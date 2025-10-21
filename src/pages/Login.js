import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [mode, setMode] = useState("login"); // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await user.reload();
        if (!user.emailVerified) {
          setError("Please verify your email before logging in!");
          setLoading(false);
          return;
        }
        navigate("/profile");
      } else if (mode === "register") {
        if (!email || !password || !name || !phone) {
          setError("Please fill all fields!");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError("Passwords do not match!");
          setLoading(false);
          return;
        }

        const result = await createUserWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await sendEmailVerification(user);

        await setDoc(doc(db, "users", user.uid), {
          name,
          phone,
          email,
          role: "buyer",
          code: generateCode(),
          verified: false,
        });

        setMessage("✅ Verification email sent! Please verify before logging in.");
        setMode("login");
      } else if (mode === "forgot") {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent! Check your inbox.");
        setMode("login");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #7b1f29, #9e2a33, #b63a3d)",
        fontFamily: "Poppins, sans-serif",
        padding: "20px",
        overflowY: "auto",
      }}
    >
      <div
        className="card shadow-lg text-center p-4"
        style={{
          maxWidth: "380px",
          width: "100%",
          backgroundColor: "#fffaf5",
          borderRadius: "18px",
        }}
      >
        {/* 🔹 Amrita Logo Inside Card */}
        <div className="mb-3">
          <img
            src="/amritalogo.svg"
            alt="Amrita Logo"
            className="img-fluid mb-2"
            style={{ height: "60px", width: "auto" }}
          />
          <h6 className="fw-bold text-danger mb-0">Amrita Vishwa Vidyapeetham</h6>
          <p className="text-muted small mb-2">Coimbatore Campus</p>
        </div>

        {/* 🔸 Ahaar Branding */}
        <div className="mb-3">
          <img
            src="/ahaarlogopng-32x32.png"
            alt="Ahaar Logo"
            style={{ height: "45px", width: "auto" }}
          />
          <h4 className="fw-bold text-danger mt-2 mb-0">Ahaar</h4>
          <p className="text-muted small mb-2">The College Canteen App</p>
        </div>

        {/* Heading */}
        <h5 className="fw-semibold text-dark mb-3">
          {mode === "login"
            ? "Login"
            : mode === "register"
            ? "Register"
            : "Reset Password"}
        </h5>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="tel"
                className="form-control mb-3"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {mode !== "forgot" && (
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}

          {mode === "register" && (
            <input
              type="password"
              className="form-control mb-3"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          {error && <p className="text-danger small mb-2">{error}</p>}
          {message && <p className="text-success small mb-2">{message}</p>}

          <button
            type="submit"
            className="btn w-100 text-white fw-semibold mb-3"
            style={{
              backgroundColor: "#9e2a33",
              border: "none",
              transition: "0.3s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#7b1f29")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#9e2a33")}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : mode === "register"
              ? "Register"
              : "Send Reset Email"}
          </button>
        </form>

        {/* Links */}
        <div>
          {mode === "login" && (
            <>
              <p className="small mb-1">
                Don’t have an account?{" "}
                <button
                  className="btn btn-link p-0 text-decoration-none text-danger"
                  onClick={() => setMode("register")}
                >
                  Register
                </button>
              </p>
              <p className="small">
                Forgot password?{" "}
                <button
                  className="btn btn-link p-0 text-decoration-none text-danger"
                  onClick={() => setMode("forgot")}
                >
                  Reset here
                </button>
              </p>
            </>
          )}
          {mode === "register" && (
            <p className="small">
              Already have an account?{" "}
              <button
                className="btn btn-link p-0 text-decoration-none text-danger"
                onClick={() => setMode("login")}
              >
                Login
              </button>
            </p>
          )}
          {mode === "forgot" && (
            <p className="small">
              Remember your password?{" "}
              <button
                className="btn btn-link p-0 text-decoration-none text-danger"
                onClick={() => setMode("login")}
              >
                Back to Login
              </button>
            </p>
          )}
        </div>

        <p className="text-muted small mt-3 mb-0">
          © {new Date().getFullYear()} Ahaar | Amrita Vishwa Vidyapeetham
        </p>
      </div>

      {/* 📱 Responsive Fixes */}
      <style>
        {`
        @media (max-width: 480px) {
          .card {
            padding: 1.3rem !important;
          }
          img[alt="Amrita Logo"] {
            height: 45px !important;
          }
          h6 {
            font-size: 0.9rem !important;
          }
          h4 {
            font-size: 1.3rem !important;
          }
          p.small {
            font-size: 0.8rem !important;
          }
        }
        `}
      </style>
    </div>
  );
}

export default Login;
