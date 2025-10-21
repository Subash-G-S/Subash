import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Home from "./pages/Home";
import Login from "./pages/Login";
import OrderPage from "./pages/OrderPage";
import Profile from "./pages/Profile";
import RunnerDashboard from "./pages/RunnerDashboard";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Track authentication state
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      // 🔹 Force Firebase to fetch latest info from server
      await currentUser.reload();
    }
    setUser(auth.currentUser); // always set updated user
    setLoading(false);
  });
  return () => unsubscribe();
}, []);


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <h4>Loading...</h4>
      </div>
    );
  }

  // 🔸 Helper: check if user verified
  const isVerified = user && user.emailVerified;

  return (
    <Router>
      {/* ✅ Show Navbar only if verified & logged in */}
      {isVerified && <Navbar />}

      <Routes>
        {/* 🔹 Home route: only verified users can access */}
        <Route path="/" element={isVerified ? <Home /> : <Navigate to="/login" />} />

        {/* 🔹 Login route:
            - If no user → show Login
            - If user but not verified → still show Login (with “verify” message)
            - If user verified → go home */}
        <Route
          path="/login"
          element={!user || !isVerified ? <Login /> : <Navigate to="/" />}
        />

        {/* 🔹 Protected Routes — only for verified users */}
        <Route
          path="/order"
          element={isVerified ? <OrderPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isVerified ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/runner"
          element={isVerified ? <RunnerDashboard /> : <Navigate to="/login" />}
        />

        {/* Default */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
