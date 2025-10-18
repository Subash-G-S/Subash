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
import PhoneNumberInput from "./pages/PhoneNumberInput";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Track authentication state
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

  return (
    <Router>
      {/* ✅ Show Navbar only if logged in */}
      {user && <Navbar />}

      <Routes>
        {/* 🔹 If user not logged in → redirect to /login */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />

        {/* 🔹 Login route (redirects if already logged in) */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        {/* 🔹 Other protected routes */}
        <Route
          path="/order"
          element={user ? <OrderPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/runner"
          element={user ? <RunnerDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/phone"
          element={user ? <PhoneNumberInput /> : <Navigate to="/login" />}
        />

        {/* Default: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
