import { useState } from "react";
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

  // Get user profile from Firestore
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  let userData = {};
  if (userSnap.exists()) {
    userData = userSnap.data();
  }

  await addDoc(collection(db, "orders"), {
    userId: user.uid,                 // 🔑 required by rules
    userName: userData.name || user.email,
    userPhone: userData.phone || "",
    canteen,
    items,
    deliveryLocation: location,
    status: "pending",
    createdAt: serverTimestamp(),
  });

  setItems([]);
  alert("Order placed!");
};


  return (
    <div className="container py-4">
      <h2 className="mb-4 text-primary">Place an Order</h2>

      <div className="mb-3">
        <label className="form-label fw-semibold">Select Canteen</label>
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

      <div className="mb-3">
        <label className="form-label fw-semibold">Delivery Location</label>
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

      <div className="mb-3 d-flex">
        <input
          className="form-control me-2"
          value={itemInput}
          onChange={(e) => setItemInput(e.target.value)}
          placeholder="Add food item"
        />
        <button className="btn btn-outline-primary" onClick={handleAddItem}>
          Add Item
        </button>
      </div>

      {items.length > 0 && (
        <div className="mb-4">
          <h5>Order Items</h5>
          <ul className="list-group">
            {items.map((itm, idx) => (
              <li className="list-group-item" key={idx}>
                {itm}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button className="btn btn-success w-100" onClick={handlePlaceOrder}>
        Place Order
      </button>
    </div>
  );
}

export default OrderPage;
