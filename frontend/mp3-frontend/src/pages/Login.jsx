import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, Loader2 } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { username, password } = form;
      const encodedCredentials = btoa(`${username}:${password}`);

      const res = await axios.post("http://mp3converter.com/login", null, {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
        },
      });

      localStorage.setItem("token", res.data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center px-6 text-white">
      <div className="w-full max-w-md bg-white/10 backdrop-blur rounded-xl p-8 border border-white/10">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-lg bg-indigo-500 font-bold">

          </div>
          <h1 className="text-2xl font-semibold">Sign in to MP3JB</h1>
          <p className="text-sm text-gray-300 mt-1">
            Secure access to your conversion dashboard
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Username"
              required
              onChange={(e) =>
                setForm({ ...form, username: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10
                         border border-white/10 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="password"
              placeholder="Password"
              required
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10
                         border border-white/10 placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full flex items-center justify-center gap-2
              bg-indigo-500 hover:bg-indigo-600
              disabled:opacity-50 disabled:cursor-not-allowed
              py-2 rounded-lg font-medium transition
            "
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Microservices-based authentication • Secure API access
        </p>
      </div>
    </div>
  );
}