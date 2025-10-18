import React, { useEffect, useState } from "react";
import {
  collection,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Modal, Button, Form } from "react-bootstrap";

const RunnerDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [runnerId, setRunnerId] = useState("");
  const [runnerInfo, setRunnerInfo] = useState({ name: "", phone: "" });

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [codeInput, setCodeInput] = useState("");

  useEffect(() => {
    let unsubscribeAuth;
    let unsubscribePending;
    let unsubscribePicked;
    let unsubscribeCompleted;

    unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setRunnerId(user.uid);

        const runnerRef = doc(db, "users", user.uid);
        onSnapshot(runnerRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setRunnerInfo({
              name: data.name || "Unnamed",
              phone: data.phone || "N/A",
            });
          }
        });

        // 🔹 Pending orders (available to pick)
        const pendingQuery = query(
          collection(db, "orders"),
          where("status", "==", "pending")
        );
        unsubscribePending = onSnapshot(pendingQuery, async (snapshot) => {
          const pending = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              if (data.status === "cancelled") return null; // ✅ ignore cancelled
              const buyerDoc = await getDoc(doc(db, "users", data.userId));
              const buyerData = buyerDoc.exists() ? buyerDoc.data() : {};
              return {
                id: docSnap.id,
                ...data,
                userName: buyerData.name || "Unknown",
                buyerPhone: buyerData.phone || "N/A",
                userCode: buyerData.code || "",
              };
            })
          );
          setPendingOrders(pending.filter(o => o && o.userId !== user.uid));
        });

        // 🔹 Accepted orders (picked by this runner)
        const pickedQuery = query(
          collection(db, "orders"),
          where("status", "==", "picked"),
          where("runnerId", "==", user.uid)
        );
        unsubscribePicked = onSnapshot(pickedQuery, async (snapshot) => {
          const accepted = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const buyerDoc = await getDoc(doc(db, "users", data.userId));
              const buyerData = buyerDoc.exists() ? buyerDoc.data() : {};
              return {
                id: docSnap.id,
                ...data,
                userName: buyerData.name || "Unknown",
                buyerPhone: buyerData.phone || "N/A",
                userCode: buyerData.code || "",
              };
            })
          );
          setAcceptedOrders(accepted);
        });

        // 🔹 Completed orders (delivered by this runner)
        const completedQuery = query(
          collection(db, "orders"),
          where("status", "==", "delivered"),
          where("runnerId", "==", user.uid)
        );
        unsubscribeCompleted = onSnapshot(completedQuery, async (snapshot) => {
          const completed = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              const buyerDoc = await getDoc(doc(db, "users", data.userId));
              const buyerData = buyerDoc.exists() ? buyerDoc.data() : {};
              return {
                id: docSnap.id,
                ...data,
                userName: buyerData.name || "Unknown",
                buyerPhone: buyerData.phone || "N/A",
                userCode: buyerData.code || "",
              };
            })
          );
          setCompletedOrders(completed);
        });
      }
    });

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribePending) unsubscribePending();
      if (unsubscribePicked) unsubscribePicked();
      if (unsubscribeCompleted) unsubscribeCompleted();
    };
  }, []);

  const handleAccept = async (orderId) => {
    const orderRef = doc(db, "orders", orderId);
    try {
      await runTransaction(db, async (transaction) => {
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) throw new Error("Order does not exist!");
        const orderData = orderDoc.data();
        if (orderData.status !== "pending") {
          throw new Error("Order has already been picked or cancelled.");
        }
        transaction.update(orderRef, {
          status: "picked",
          runnerId,
          runnerName: runnerInfo.name,
          runnerPhone: runnerInfo.phone,
        });
      });
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeliver = (order) => {
    setSelectedOrder(order);
    setCodeInput("");
    setShowModal(true);
  };

  const confirmDelivery = async () => {
    if (!selectedOrder || !codeInput) return;
    const userRef = doc(db, "users", selectedOrder.userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      alert("Buyer not found!");
      return;
    }
    const userCode = userSnap.data().code;
    if (codeInput === userCode) {
      await updateDoc(doc(db, "orders", selectedOrder.id), {
        status: "delivered",
      });
      alert("Order marked as delivered!");
      setShowModal(false);
    } else {
      alert("Incorrect 6-digit code. Delivery not confirmed.");
    }
  };

  return (
    <div className="container py-4">
      <h2 className="text-center text-primary mb-4">Runner Dashboard</h2>
      <div className="row">
        {/* Available Orders */}
        <div className="col-md-4 mb-4">
          <div className="p-4 bg-light border rounded shadow-sm">
            <h4 className="mb-3">Available Orders</h4>
            {pendingOrders.length === 0 ? (
              <p className="text-muted">No pending orders</p>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Buyer:</strong> {order.userName}</p>
                    <p><strong>Phone:</strong> {order.buyerPhone}</p>
                    <p><strong>Canteen:</strong> {order.canteen}</p>
                    <p><strong>Items:</strong> {order.items?.join(", ")}</p>
                    <p><strong>Delivery Location:</strong> {order.deliveryLocation || "Not specified"}</p>
                    <button className="btn btn-outline-primary btn-sm" onClick={() => handleAccept(order.id)}>
                      Accept Order
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Accepted Orders */}
        <div className="col-md-4 mb-4">
          <div className="p-4 bg-light border rounded shadow-sm">
            <h4 className="mb-3">Your Accepted Orders</h4>
            {acceptedOrders.length === 0 ? (
              <p className="text-muted">No accepted orders</p>
            ) : (
              acceptedOrders.map((order) => (
                <div key={order.id} className="card mb-3">
                  <div className="card-body">
                    <p><strong>Buyer:</strong> {order.userName}</p>
                    <p><strong>Phone:</strong> {order.buyerPhone}</p>
                    <p><strong>Canteen:</strong> {order.canteen}</p>
                    <p><strong>Items:</strong> {order.items?.join(", ")}</p>
                    <p><strong>Delivery Location:</strong> {order.deliveryLocation || "Not specified"}</p>
                    <button className="btn btn-outline-success btn-sm" onClick={() => handleDeliver(order)}>
                      Mark as Delivered
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Completed Orders */}
        <div className="col-md-4 mb-4">
          <div className="p-4 bg-light border rounded shadow-sm">
            <h4 className="mb-3">Completed Orders</h4>
            {completedOrders.length === 0 ? (
              <p className="text-muted">No completed orders</p>
            ) : (
              completedOrders.map((order) => (
                <div key={order.id} className="card mb-3 bg-success-subtle">
                  <div className="card-body">
                    <p><strong>Buyer:</strong> {order.userName}</p>
                    <p><strong>Phone:</strong> {order.buyerPhone}</p>
                    <p><strong>Canteen:</strong> {order.canteen}</p>
                    <p><strong>Items:</strong> {order.items?.join(", ")}</p>
                    <p><strong>Delivery Location:</strong> {order.deliveryLocation || "Not specified"}</p>
                    <span className="badge bg-success">Delivered</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal for delivery code */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enter Buyer's 6-Digit Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Verification Code</Form.Label>
            <Form.Control
              type="text"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              placeholder="e.g. 123456"
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmDelivery}>
            Confirm Delivery
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RunnerDashboard;
