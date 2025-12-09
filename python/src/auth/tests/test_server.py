import os
import jwt
import pytest
from unittest.mock import patch

# Import the Flask app and helper to create tokens
# Update this import if your file name is different (e.g. from myservice import server, createJWT)
from auth.server import server, createJWT

# A simple fake cursor we can control
class FakeCursor:
    def __init__(self, execute_return=0, fetchone_result=None):
        # execute_return simulates the return value of cursor.execute()
        self._execute_return = execute_return
        self._fetchone_result = fetchone_result
        self.executed_sql = None
        self.executed_params = None

    def execute(self, sql, params=None):
        self.executed_sql = sql
        self.executed_params = params
        return self._execute_return

    def fetchone(self):
        return self._fetchone_result

    def close(self):
        pass

class FakeConnection:
    def __init__(self, cursor_obj):
        self._cursor = cursor_obj
    def cursor(self):
        return self._cursor

@pytest.fixture(autouse=True)
def set_env(monkeypatch):
    # Set known env vars for tests
    monkeypatch.setenv("JWT_SECRET", "testsecret")
    monkeypatch.setenv("MYSQL_HOST", "localhost")
    monkeypatch.setenv("MYSQL_USER", "user")
    monkeypatch.setenv("MYSQL_PASSWORD", "pass")
    monkeypatch.setenv("MYSQL_DB", "db")
    monkeypatch.setenv("MYSQL_PORT", "3306")

@pytest.fixture
def client():
    server.config["TESTING"] = True
    with server.test_client() as c:
        yield c

def test_login_missing_credentials(client):
    resp = client.post("/login")  # no auth header
    assert resp.status_code == 401
    assert b"missing credentials" in resp.data

def test_login_user_not_found(client):
    # cursor.execute returns 0 -> no rows
    fake_cursor = FakeCursor(execute_return=0)
    fake_conn = FakeConnection(fake_cursor)

    with patch("auth.server.mysql") as mock_mysql:
        mock_mysql.connection = fake_conn
        resp = client.post("/login", headers={})  # still no basic auth -> route uses request.authorization
        # But Flask test client does not set request.authorization from headers for POST automatically.
        # So instead we send Authorization header Basic encoded. Use requests-style basic auth header:
        from base64 import b64encode
        basic = b64encode(b"nonexistent:whatever").decode("utf-8")
        resp = client.post("/login", headers={"Authorization": f"Basic {basic}"})
        assert resp.status_code == 401
        assert b"invalid credentials" in resp.data

def test_login_invalid_password(client):
    # simulate user found, but password mismatch
    fake_cursor = FakeCursor(execute_return=1, fetchone_result=("user@example.com", "right-password"))
    fake_conn = FakeConnection(fake_cursor)

    with patch("auth.server.mysql") as mock_mysql:
        mock_mysql.connection = fake_conn
        from base64 import b64encode
        basic = b64encode(b"user@example.com:wrong-password").decode("utf-8")
        resp = client.post("/login", headers={"Authorization": f"Basic {basic}"})
        assert resp.status_code == 401
        assert b"invalid credentials" in resp.data

def test_login_success_returns_jwt(client):
    # simulate user found and password matches
    fake_cursor = FakeCursor(execute_return=1, fetchone_result=("user@example.com", "secretpw"))
    fake_conn = FakeConnection(fake_cursor)

    with patch("auth.server.mysql") as mock_mysql:
        mock_mysql.connection = fake_conn
        # build basic auth header with correct password
        from base64 import b64encode
        basic = b64encode(b"user@example.com:secretpw").decode("utf-8")
        resp = client.post("/login", headers={"Authorization": f"Basic {basic}"})
        # Should return token (pyjwt returns a str) and status 200 by default
        assert resp.status_code == 200 or resp.status_code == 201 or resp.status_code == 202
        token = resp.get_data(as_text=True).strip().strip('"')  # remove possible quotes
        # verify we can decode token with the same secret
        decoded = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        assert decoded["username"] == "user@example.com"
        assert "exp" in decoded
        assert decoded["admin"] is True

def test_validate_missing_header(client):
    resp = client.post("/validate")
    assert resp.status_code == 401
    assert b"missing credentials" in resp.data

def test_validate_malformed_token(client):
    # send a header but with bad token
    resp = client.post("/validate", headers={"Authorization": "Bearer not-a-valid-token"})
    # decode will throw -> returns 403 "not authorized"
    assert resp.status_code == 403 or resp.status_code == 401
    assert b"not authorized" in resp.data or b"missing" not in resp.data

def test_validate_success(client):
    # create a token using createJWT helper and pass it in Authorization header
    token = createJWT("tester@example.com", os.environ["JWT_SECRET"], True)
    # token may be bytes on some pyjwt versions, ensure it's a string
    if isinstance(token, bytes):
        token = token.decode("utf-8")

    resp = client.post("/validate", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    # response is JSON-like (Flask returns tuple (decoded, 200) so test client returns JSON)
    data = resp.get_json()
    assert data["username"] == "tester@example.com"
    assert data["admin"] is True
