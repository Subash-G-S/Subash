import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import OrderPage from "./pages/OrderPage";
import Profile from "./pages/Profile";
import RunnerDashboard from "./pages/RunnerDashboard";
import Navbar from "./components/Navbar";
import PhoneNumberInput from "./pages/PhoneNumberInput";

function App() {
  return (
    <Router>
      {/* ✅ Navbar is always visible on all pages */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/runner" element={<RunnerDashboard />} />
        <Route path="/phone" element={<PhoneNumberInput />} />
      </Routes>
    </Router>
  );
}

export default App;

