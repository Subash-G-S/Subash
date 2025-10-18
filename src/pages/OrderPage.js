import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

function OrderPage() {
  const [canteen, setCanteen] = useState("Sopanam Canteen");
  const [location, setLocation] = useState("Main Gate");
  const [itemInput, setItemInput] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    // 🎨 Inject warm theme animations + hover styles
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes warmGradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .warm-bg {
        background: linear-gradient(270deg, #f8e1b7, #f0d7a7, #e8be91, #f2d6a2);
        background-size: 800% 800%;
        animation: warmGradientShift 10s ease infinite;
      }
      .btn-warm {
        background-color: #fff8e1 !important;
        color: #5d4037 !important;
        border: 2px solid #ffe0b2 !important;
        transition: all 0.3s ease;
        font-weight: 600;
      }
      .btn-warm:hover {
        background-color: #f7d49b !important;
        color: #3e2723 !important;
        border-color: #d7b97a !important;
        transform: scale(1.03);
      }
      .btn-warm-success {
        background-color: #d7b97a !important;
        border: none !important;
        color: #3e2723 !important;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .btn-warm-success:hover {
        background-color: #bfa05e !important;
        color: white !important;
        transform: scale(1.03);
      }
      .card-warm {
        background: linear-gradient(135deg, #fffaf3, #fff3e0);
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      }
      .form-select, .form-control {
        border-radius: 12px;
        border: 1.5px solid #ffe0b2;
      }
      .form-select:focus, .form-control:focus {
        border-color: #d7b97a;
        box-shadow: 0 0 0 0.2rem rgba(215, 185, 122, 0.25);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const handleAddItem = () => {
    if (itemInput.trim() !== "") {
      setItems([...items, itemInput.trim()]);
      setItemInput("");
    }
  };

  const handlePlaceOrder = async () => {
    const user = auth.currentUser;
    if (!user || items.length === 0) {
      alert("Please log in and add at least one item.");
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    let userData = {};
    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      userName: userData.name || user.email,
      userPhone: userData.phone || "",
      canteen,
      items,
      deliveryLocation: location,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setItems([]);
    alert("Order placed successfully!");
  };

  return (
    <div
      className="min-vh-100 py-5 px-3 warm-bg"
      style={{
        fontFamily: "'Poppins', sans-serif",
        color: "#4e342e",
      }}
    >
      <div className="container card-warm p-4 p-md-5">
        <h2 className="mb-4 fw-bold text-center" style={{ color: "#6d4c41" }}>
          🥗 Place an Order
        </h2>

        {/* 🏠 Canteen Selection */}
        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: "#5d4037" }}>
            Select Canteen
          </label>
          <select
            className="form-select"
            value={canteen}
            onChange={(e) => setCanteen(e.target.value)}
          >
            <option value="Sopanam Canteen">Sopanam Canteen</option>
            <option value="MBA Canteen">MBA Canteen</option>
            <option value="Samudra Canteen">Samudra Canteen</option>
          </select>
        </div>

        {/* 📍 Delivery Location */}
        <div className="mb-4">
          <label className="form-label fw-semibold" style={{ color: "#5d4037" }}>
            Delivery Location
          </label>
          <select
            className="form-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Main Gate">Main Gate</option>
            <option value="Vashishta Hostel">Vashishta Hostel</option>
            <option value="Agastyia Hostel">Agastyia Hostel</option>
            <option value="AB3">AB3</option>
            <option value="AB2">AB2</option>
            <option value="AB1">AB1</option>
            <option value="Library">Library</option>
            <option value="Auditorium">Auditorium</option>
            <option value="MBA Block">MBA Block</option>
          </select>
        </div>

        {/* 🍔 Item Input */}
        <div className="mb-4 d-flex flex-column flex-sm-row">
          <input
            className="form-control me-sm-2 mb-2 mb-sm-0"
            value={itemInput}
            onChange={(e) => setItemInput(e.target.value)}
            placeholder="Add food item"
          />
          <button className="btn btn-warm" onClick={handleAddItem}>
            Add Item
          </button>
        </div>

        {/* 🧾 Items List */}
        {items.length > 0 && (
          <div className="mb-4">
            <h5 className="fw-semibold mb-3" style={{ color: "#6d4c41" }}>
              Order Items
            </h5>
            <ul className="list-group">
              {items.map((itm, idx) => (
                <li
                  className="list-group-item"
                  key={idx}
                  style={{
                    border: "none",
                    borderRadius: "10px",
                    marginBottom: "8px",
                    backgroundColor: "#fff8e1",
                    color: "#4e342e",
                    fontWeight: "500",
                  }}
                >
                  {itm}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ✅ Place Order Button */}
        <button className="btn btn-warm-success w-100 py-3 mt-2" onClick={handlePlaceOrder}>
          Place Order 🍱
        </button>
      </div>
    </div>
  );
}

export default OrderPage;
