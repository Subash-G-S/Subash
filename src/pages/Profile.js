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
        console.log("📦 Snapshot updated in Profile.js:", snapshot.size);

        const allOrders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setOrders(allOrders);
      });

      return unsubscribe;
    } catch (err) {
      console.error("❌ Error setting up snapshot listener:", err.message);
      return () => {}; // Return a no-op function to safely unsubscribe
    }
  };

  const handleNameUpdate = async () => {
    if (!user || name.trim() === "") return;

    await updateDoc(doc(db, "users", user.uid), {
      name: name.trim(),
    });

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
    <div className="container mt-4">
      <h2 className="mb-4">Profile</h2>
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <Card.Title>User Information</Card.Title>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {phone || "Not Provided"}</p>
              <p><strong>Your 6-digit Code:</strong> <span className="text-success">{code}</span></p>

              <div>
                <strong>Name:</strong>{" "}
                {editingName ? (
                  <Form className="d-flex gap-2 mt-2">
                    <Form.Control
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter new name"
                    />
                    <Button variant="success" onClick={handleNameUpdate}>Save</Button>
                  </Form>
                ) : (
                  <>
                    {name}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="ms-3"
                      onClick={() => setEditingName(true)}
                    >
                      Change Name
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div>
              <Button variant="danger" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <h4>Your Orders</h4>
      {orders.length === 0 ? (
        <Alert variant="info">No past orders found.</Alert>
      ) : (
        orders.map((order) => (
          <Card key={order.id} className="mb-3">
            <Card.Body>
              <Card.Title>{order.canteen}</Card.Title>
              <p><strong>Items:</strong> {order.items?.join(", ")}</p>
              <p><strong>Delivery Location:</strong> {order.deliveryLocation || "Not specified"}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={`badge bg-${order.status === "delivered" ? "success" : order.status === "picked" ? "warning text-dark" : "secondary"}`}>
                  {order.status}
                </span>
              </p>
              {(order.status === "picked" || order.status === "delivered") && (
                <>
                  <p><strong>Runner Name:</strong> {order.runnerName || "N/A"}</p>
                  <p><strong>Runner Phone:</strong> {order.runnerPhone || "N/A"}</p>
                </>
              )}
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default Profile;
