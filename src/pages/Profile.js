import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🎨 Inject warm theme
  useEffect(() => {
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
      .card-warm {
        background: #fffaf3;
        border: none;
        border-radius: 18px;
        box-shadow: 0 6px 18px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
      }
      .card-warm:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      }
      .btn-warm-primary {
        background-color: #fff8e1 !important;
        color: #5d4037 !important;
        border: 2px solid #ffe0b2 !important;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .btn-warm-primary:hover {
        background-color: #f7d49b !important;
        color: #3e2723 !important;
        border-color: #d7b97a !important;
        transform: scale(1.03);
      }
      .btn-warm-danger {
        background-color: #ffebee !important;
        color: #b71c1c !important;
        border: 2px solid #ffcdd2 !important;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .btn-warm-danger:hover {
        background-color: #ef9a9a !important;
        color: white !important;
        transform: scale(1.03);
      }
      .badge-custom {
        border-radius: 8px;
        font-size: 0.85rem;
        padding: 5px 10px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    let unsubscribeOrders;
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchUserDetails(currentUser.uid);
        unsubscribeOrders = listenToUserOrders(currentUser.uid);
      }
      setLoading(false);
    });
    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  const fetchUserDetails = async (uid) => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      setPhone(data.phone || "");
      setName(data.name || auth.currentUser.displayName || "");
      setCode(data.code || "N/A");
    }
  };

  const listenToUserOrders = (uid) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const allOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(allOrders);
      });
      return unsubscribe;
    } catch (err) {
      console.error("❌ Error setting up snapshot listener:", err.message);
      return () => {};
    }
  };

  const handleNameUpdate = async () => {
    if (!user || name.trim() === "") return;
    await updateDoc(doc(db, "users", user.uid), { name: name.trim() });
    alert("Name updated!");
    setEditingName(false);
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      try {
        await signOut(auth);
        navigate("/login");
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  };

  // 🟥 Cancel order
  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
    if (!confirmCancel) return;
    try {
      await updateDoc(doc(db, "orders", orderId), { status: "cancelled" });
      alert("Order cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Alert variant="warning">User not logged in. Please login first.</Alert>;
  }

  return (
    <div className="warm-bg min-vh-100 py-4 px-3">
      <div className="container">
        <h2 className="fw-bold mb-4 text-center" style={{ color: "#4e342e" }}>
          👤 Profile
        </h2>

        <Card className="mb-4 card-warm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start flex-column flex-md-row">
              <div>
                <Card.Title className="mb-3 fw-semibold" style={{ color: "#5d4037" }}>
                  User Information
                </Card.Title>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {phone || "Not Provided"}</p>
                <p>
                  <strong>Your 6-digit Code:</strong>{" "}
                  <span className="text-success fw-bold">{code}</span>
                </p>

                <div className="mt-2">
                  <strong>Name:</strong>{" "}
                  {editingName ? (
                    <Form className="d-flex gap-2 mt-2">
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter new name"
                      />
                      <Button
                        className="btn-warm-success"
                        onClick={handleNameUpdate}
                      >
                        Save
                      </Button>
                    </Form>
                  ) : (
                    <>
                      {name}
                      <Button
                        className="btn-warm-primary ms-3"
                        size="sm"
                        onClick={() => setEditingName(true)}
                      >
                        Change Name
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 mt-md-0">
                <Button className="btn-warm-danger" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        <h4 className="fw-bold mb-3" style={{ color: "#4e342e" }}>
          🧾 Your Orders
        </h4>
        {orders.length === 0 ? (
          <Alert variant="info">No past orders found.</Alert>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="mb-3 card-warm">
              <Card.Body>
                <Card.Title className="fw-semibold mb-2">{order.canteen}</Card.Title>
                <p><strong>Items:</strong> {order.items?.join(", ")}</p>
                <p><strong>Delivery Location:</strong> {order.deliveryLocation || "Not specified"}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`badge badge-custom bg-${
                      order.status === "delivered"
                        ? "success"
                        : order.status === "picked"
                        ? "warning text-dark"
                        : order.status === "cancelled"
                        ? "danger"
                        : "secondary"
                    }`}
                  >
                    {order.status}
                  </span>
                </p>

                {(order.status === "picked" || order.status === "delivered") && (
                  <>
                    <p><strong>Runner Name:</strong> {order.runnerName || "N/A"}</p>
                    <p><strong>Runner Phone:</strong> {order.runnerPhone || "N/A"}</p>
                  </>
                )}

                {order.status === "pending" && (
                  <Button
                    className="btn-warm-danger mt-2"
                    size="sm"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </Card.Body>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Profile;
