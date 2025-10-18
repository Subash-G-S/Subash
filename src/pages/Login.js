import React, { useState } from "react";
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

  // Generate 6-digit code
  const generateCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

  // 🔹 Register new user
  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Send verification email
      await sendEmailVerification(user);
      alert("Verification email sent! Please check your inbox.");

      // Create Firestore doc (unverified user too, so we can store data early)
      const newCode = generateCode();
      await setDoc(doc(db, "users", user.uid), {
        name: user.email.split("@")[0],
        email: user.email,
        phone: "",
        role: "buyer",
        code: newCode,
        verified: false,
      });

      // Stay on login page after registration
      setIsRegister(false);
    } catch (error) {
      console.error("Registration failed:", error);
      alert(error.message);
    }
  };

  // 🔹 Login existing user
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

        if (data.phone) {
          navigate("/profile");
        } else {
          navigate("/phone");
        }
      } else {
        // If no Firestore doc, create one
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
      console.error("Login failed:", error);
      alert(error.message);
    }
  };

  // 🔹 Forgot password
  const handleForgotPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent! Check your inbox.");
      setIsForgot(false);
    } catch (error) {
      console.error("Reset failed:", error);
      alert(error.message);
    }
  };

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center mb-4 text-primary">
          {isForgot ? "Reset Password" : isRegister ? "Register" : "Login"}
        </h2>

        {/* Email input */}
        <input
          type="email"
          className="form-control mb-3"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password only if not reset */}
        {!isForgot && (
          <input
            type="password"
            className="form-control mb-3"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {/* Main button */}
        <button
          className="btn btn-primary w-100"
          onClick={
            isForgot
              ? handleForgotPassword
              : isRegister
              ? handleRegister
              : handleLogin
          }
        >
          {isForgot
            ? "Send Reset Email"
            : isRegister
            ? "Register"
            : "Login"}
        </button>

        {/* Links */}
        <div className="text-center mt-3">
          {!isForgot && (
            <p>
              {isRegister
                ? "Already have an account?"
                : "Don’t have an account?"}{" "}
              <button
                className="btn btn-link p-0"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Login here" : "Register here"}
              </button>
            </p>
          )}

          {!isRegister && !isForgot && (
            <p>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsForgot(true)}
              >
                Forgot Password?
              </button>
            </p>
          )}

          {isForgot && (
            <p>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsForgot(false)}
              >
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
