import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateField = (name, value) => {
    let msg = "";
    if (!value.trim()) msg = "This field is required";

    if (name === "email") {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(value)) msg = "Enter a valid email";
    }

    if (name === "password") {
      if (value.length < 6) msg = "Password must be at least 6 characters";
    }

    return msg;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: validateField(name, value) });
  };

  const saveToCookie = (key, value) => {
    document.cookie = `${key}=${value}; path=/; max-age=${7 * 24 * 60 * 60}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
      } else {
        const d = data.data;

        // save tokens and role to cookies
        saveToCookie("accessToken", d.accessToken);
        saveToCookie("refreshToken", d.refreshToken);
        saveToCookie("role", d.user.role);

        navigate(`/${d.user.role}/dashboard`); // you can change this later
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-400 p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md bg-white/10 border border-white/20">

        {/* LEFT FORM */}
        <div className="p-8 flex flex-col justify-center bg-black/20 backdrop-blur-lg">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* EMAIL */}
            <div>
              <input
                type="text"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              />
              {errors.email && <p className="text-red-200 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              />
              {errors.password && <p className="text-red-200 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/30 hover:bg-white/40 text-white font-semibold py-3 rounded-2xl transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm text-white/80 mt-4">
            Don't have an account?{" "}
            <span onClick={() => navigate("/register")} className="text-white font-medium underline cursor-pointer">
              Register
            </span>
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden md:block">
          <img src="https://media.istockphoto.com/id/2193825302/photo/senior-adult-using-fingerprint-scanner-on-smartphone-for-secure-login.jpg?s=2048x2048&w=is&k=20&c=JTs3CFCTOt2YOLgRU6-r7KyI7T3WT-lupbU8m6Z65Ts=" alt="login visual" className="h-full w-full object-cover opacity-90" />
        </div>

      </div>
    </div>
  );
}
