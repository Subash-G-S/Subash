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

  // Listen for Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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

  const isVerified = user && user.emailVerified;

  return (
    <Router>
      {/* ✅ Show Navbar only for verified users */}
      {isVerified && <Navbar />}

      <Routes>
        {/* Home route only for verified users */}
        <Route path="/" element={isVerified ? <Home /> : <Navigate to="/login" />} />

        {/* ✅ Pass setUser prop to Login so it can instantly update App state */}
        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />

        {/* Protected routes */}
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

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
