// src/pages/Login.jsx
import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const { username, password } = form;
    const encodedCredentials = btoa(`${username}:${password}`);

    const res = await axios.post("http://mp3converter.com/login", null, {
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    });

    console.log("Login response:", res.data);
    localStorage.setItem("token", res.data); // or res.data.token if needed
    navigate("/dashboard");
  } catch (error) {
    console.error("Login failed", error);
    alert("Login failed");
  }
};

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        className="w-full p-2 border"
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full p-2 border"
      />
      <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
        Login
      </button>
    </form>
  );
}
