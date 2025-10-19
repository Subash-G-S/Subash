import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        font-family: 'Poppins', sans-serif;
        background: #f9f9f9;
        margin: 0;
        padding: 0;
      }

      .amrita-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: linear-gradient(180deg, #7b1f29 0%, #a93439 100%);
        color: #fff;
        padding: 2rem 1rem;
      }

      .amrita-header img {
        height: 70px;
        margin-bottom: 10px;
      }

      .amrita-header h4 {
        font-weight: 700;
        margin: 0;
      }

      .amrita-header p {
        margin-top: 4px;
        font-size: 0.9rem;
        color: #f3e5e5;
      }

      .login-card {
        background: #f2d5d5ff;
        color: #000000ff;
        border-radius: 5px;
        padding: 2rem 1.5rem;
        width: 100%;
        max-width: 380px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        text-align: center;
        margin-top: 1rem;
      }

      .login-card img {
        height: 60px;
        margin-bottom: 10px;
      }

      .login-card h3 {
        color: #ad670cff;
        font-weight: 700;
      }

      .login-card p {
        color: #555;
        margin-bottom: 1.5rem;
      }

      .form-control {
        border-radius: 10px;
        border: 1.5px solid #ddd;
        padding: 10px;
        margin-bottom: 12px;
        width: 100%;
        outline: none;
        transition: 0.2s;
      }

      .form-control:focus {
        border-color: #9b6307ff;
        box-shadow: 0 0 0 0.15rem rgba(172, 117, 13, 0.25);
      }

      .btn-amrita {
        background-color: #9b6307ff;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 0;
        width: 100%;
        font-weight: 600;
        transition: 0.3s;
      }

      .btn-amrita:hover {
        background-color: #7b1f29;
        transform: scale(1.02);
      }

      .link-btn {
        color: #9b6307ff;
        font-weight: 600;
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
      }

      .link-btn:hover {
        text-decoration: underline;
        color: #7b1f29;
      }

      .footer-text {
        color: #f5eaea;
        font-size: 0.85rem;
        margin-top: 2rem;
      }

      @media (max-width: 480px) {
        .amrita-header img {
    height: 50px; /* ↓ smaller logo */
  }

  .amrita-header h4 {
    font-size: 1rem; /* smaller heading */
  }

  .amrita-header p {
    font-size: 0.8rem;
  }

  .login-card {
    padding: 1.3rem;
  }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Generate 6-digit code
  const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox or spam section.");
      const newCode = generateCode();
      await setDoc(doc(db, "users", user.uid), {
        name: user.email.split("@")[0],
        email: user.email,
        phone: "",
        role: "buyer",
        code: newCode,
        verified: false,
      });
      setIsRegister(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      if (!user.emailVerified) {
        alert("Please verify your email before logging in!");
        return;
      }
      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.phone) navigate("/profile");
        else navigate("/phone");
      } else {
        const newCode = generateCode();
        await setDoc(userRef, {
          name: user.email.split("@")[0],
          email: user.email,
          phone: "",
          role: "buyer",
          code: newCode,
          verified: true,
        });
        navigate("/phone");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!Check your spam");
      setIsForgot(false);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="amrita-page">
      {/* 🔹 Header */}
      <div className="amrita-header text-center">
        <img src="/amritalogowhite.svg" alt="Amrita Logo" />
        <p>Coimbatore Campus</p>
      </div>

      {/* 🔸 Login Card */}
      <div className="login-card">
        <img src="/ahaarlogopng-32x32.png" alt="Ahaar Logo" />
        <h3>Ahaar</h3>
        <p>The College Canteen App</p>

        <h5 className="mb-3">
          {isForgot ? "Reset Password" : isRegister ? "Register" : "Login"}
        </h5>

        <input
          type="email"
          className="form-control"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {!isForgot && (
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        <button
          className="btn-amrita mt-2"
          onClick={
            isForgot
              ? handleForgotPassword
              : isRegister
              ? handleRegister
              : handleLogin
          }
        >
          {isForgot ? "Send Reset Email" : isRegister ? "Register" : "Login"}
        </button>

        {/* Links */}
        <div className="text-center mt-3">
          {!isForgot && (
            <p className="mb-1">
              {isRegister
                ? "Already have an account?"
                : "Don’t have an account?"}{" "}
              <button
                className="link-btn"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Login here" : "Register here"}
              </button>
            </p>
          )}

          {!isRegister && !isForgot && (
            <p>
              <button className="link-btn" onClick={() => setIsForgot(true)}>
                Forgot Password?
              </button>
            </p>
          )}

          {isForgot && (
            <p>
              <button className="link-btn" onClick={() => setIsForgot(false)}>
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <p className="footer-text">
        © {new Date().getFullYear()} Ahaar | Amrita Vishwa Vidyapeetham
      </p>
    </div>
  );
}

export default Login;
