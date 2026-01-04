import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "rider",
    first_name: "",
    last_name: ""
  });

  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const err = validateField(key, form[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-500 to-cyan-400 p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md bg-white/10 border border-white/20">

        {/* LEFT FORM SECTION */}
        <div className="p-8 flex flex-col justify-center bg-white/5 backdrop-blur-lg">
          <h2 className="text-3xl font-bold text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

               {/* FIRST NAME */}
            <div>
              <input
                className="w-full p-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                type="text"
                name="first_name"
                placeholder="First Name"
                value={form.first_name}
                onChange={handleChange}
              />
              {errors.first_name && <p className="text-red-200 text-xs mt-1">{errors.first_name}</p>}
            </div>

            {/* LAST NAME */}
            <div>
              <input
                className="w-full p-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={form.last_name}
                onChange={handleChange}
              />
              {errors.last_name && <p className="text-red-200 text-xs mt-1">{errors.last_name}</p>}
            </div>

            {/* EMAIL */}
            <div>
              <input
                className="w-full p-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                type="text"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <p className="text-red-200 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            <div>
              <input
                className="w-full p-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                type="password"
                name="password"
                placeholder="Create a password"
                value={form.password}
                onChange={handleChange}
              />
              {errors.password && <p className="text-red-200 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* ROLE */}
            <div>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full p-3 bg-white/20 border border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 transition"
              >
                <option value="admin" className="text-black">Admin</option>
                <option value="rider" className="text-black">Rider</option>
                <option value="driver" className="text-black">Driver</option>
              </select>
              {errors.role && <p className="text-red-200 text-xs mt-1">{errors.role}</p>}
            </div>

         

            {/* SUBMIT BUTTON */}
            <button
              className="w-full bg-white/30 hover:bg-white/40 text-white font-semibold py-3 rounded-2xl transition transform hover:scale-[1.02] active:scale-[0.98]"
              type="submit"
            >
              Register Now
            </button>
          </form>

          <p className="text-white/80 text-sm text-center mt-5">
            Already registered?{" "}
            <span onClick={() => navigate("/login")} className="text-white font-medium underline cursor-pointer">
              Go to Login
            </span>
          </p>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="hidden md:block">
          <img src="https://media.istockphoto.com/id/2205696704/photo/online-registration-form-identity-verification-personal-information-verification-concept.jpg?s=612x612&w=0&k=20&c=2X_45rxke9VrEez-D7JPchhSQwM_Od2jR_vyS1O5MTY=" alt="register visual" className="h-full w-full object-cover opacity-90" />
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
