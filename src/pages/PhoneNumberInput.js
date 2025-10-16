import React, { useState } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function PhonePage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

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
      await updateDoc(userRef, {
        phone,
        name,
      });

      alert("Details saved successfully!");
      navigate("/order"); // go to order page
    } catch (error) {
      console.error("Error saving user details:", error);
      alert("Failed to save details. Try again.");
    }
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "80vh" }}>
      <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
        <h2 className="text-center mb-4 text-primary">Complete Your Profile</h2>

        {/* Name input */}
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* Phone input */}
        <input
          type="tel"
          className="form-control mb-3"
          placeholder="Enter phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button className="btn btn-success w-100" onClick={handleSave}>
          Save & Continue
        </button>
      </div>
    </div>
  );
}

export default PhonePage;
