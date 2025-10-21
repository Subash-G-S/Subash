import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function PhonePage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      body {
        font-family: 'Poppins', sans-serif;
        background: linear-gradient(180deg, #7b1f29 0%, #a93439 100%);
        margin: 0;
        color: #fff;
      }
      @font-face {
            font-family: 'VIOLA';
            src: url('/fonts/VIOLA.otf') format('opentype');
            font-weight: normal;
            font-style: normal;
          }

      .phone-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        padding: 1.5rem;
      }

      .card-phone {
        background: #fffdfc;
        border: none;
        border-radius: 20px;
        padding: 2rem 1.8rem;
        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
        width: 100%;
        max-width: 400px;
        color: #222;
        transition: all 0.3s ease;
      }

      .card-phone:hover {
        transform: translateY(-3px);
        box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
      }

      .amrita-logo {
        height: 65px;
        margin-bottom: 12px;
      }

      .form-control {
        border-radius: 10px;
        border: 1.5px solid #ddd;
        padding: 10px;
        margin-bottom: 14px;
        transition: 0.2s;
      }

      .form-control:focus {
        border-color: #9e2a33;
        box-shadow: 0 0 0 0.2rem rgba(158, 42, 51, 0.25);
      }

      .btn-amrita {
        background-color: #9e2a33;
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 10px 0;
        width: 100%;
        font-weight: 600;
        transition: all 0.3s ease;
      }

      .btn-amrita:hover {
        background-color: #7b1f29;
        transform: scale(1.02);
      }

      .university-text {
        font-weight: 700;
        color: #fff;
        margin-top: 10px;
      }

      .footer-text {
        color: #f8eaea;
        font-size: 0.85rem;
        margin-top: 2rem;
      }

      @media (max-width: 480px) {
        .amrita-logo {
          height: 50px;
        }

        .card-phone {
          padding: 1.6rem;
        }

        .university-text {
          font-size: 1rem;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in!");
      return;
    }

    if (!phone || !name) {
      alert("Please enter both name and phone number.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { phone, name });

      alert("Details saved successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error saving user details:", error);
      alert("Failed to save details. Try again.");
    }
  };

  return (
    <div className="phone-container">
      {/* 🔹 Header */}
      <img
        src="/amritalogowhite.svg"
        alt="Amrita Logo"
        className="amrita-logo"
      />
      <h4 className="university-text">Amrita Vishwa Vidyapeetham</h4>
      <p className="text-light">Coimbatore Campus</p>

      {/* 🔸 Card */}
      <div className="card-phone">
        <img
          src="/ahaarlogopng-32x32.png"
          alt="Ahaar Logo"
          style={{ height: "50px", marginBottom: "10px" }}
        />
        <h3 className="fw-bold text-danger" style={{fontFamily: "VIOLA"}}>Ahaar</h3>
        <p className="text-muted mb-4">Complete your profile to continue</p>

        <input
          type="text"
          className="form-control"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="tel"
          className="form-control"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button className="btn-amrita mt-2" onClick={handleSave}>
          Save & Continue
        </button>
      </div>

      <p className="footer-text">
        © {new Date().getFullYear()} Ahaar | Amrita Vishwa Vidyapeetham
      </p>
    </div>
  );
}

export default PhonePage;
