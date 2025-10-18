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
import { Accordion, Modal, Button, Form, InputGroup } from "react-bootstrap";

const RunnerDashboard = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [runnerId, setRunnerId] = useState("");
  const [runnerInfo, setRunnerInfo] = useState({ name: "", phone: "" });

  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // 🌈 Inject warm theme styles
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
        border-radius: 14px;
        border: none;
        box-shadow: 0 6px 18px rgba(0,0,0,0.1);
        padding: 15px;
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
      .btn-warm-success {
        background-color: #d7b97a !important;
        color: #3e2723 !important;
        border: none !important;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .btn-warm-success:hover {
        background-color: #bfa05e !important;
        color: white !important;
        transform: scale(1.03);
      }
      .accordion-button {
        background-color: #fff8e1 !important;
        color: #5d4037 !important;
        font-weight: 600;
      }
      .accordion-button:not(.collapsed) {
        background-color: #f7d49b !important;
        color: #3e2723 !important;
      }
      .form-control {
        border-radius: 10px;
        border: 1.5px solid #ffe0b2;
      }
      .form-control:focus {
        border-color: #d7b97a;
        box-shadow: 0 0 0 0.2rem rgba(215, 185, 122, 0.25);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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

        // 🧾 Pending Orders
        const pendingQuery = query(
          collection(db, "orders"),
          where("status", "==", "pending")
        );
        unsubscribePending = onSnapshot(pendingQuery, async (snapshot) => {
          const pending = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              if (data.status === "cancelled") return null;
              const buyerDoc = await getDoc(doc(db, "users", data.userId));
              const buyerData = buyerDoc.exists() ? buyerDoc.data() : {};
              return {
                id: docSnap.id,
                ...data,
                userName: buyerData.name || "Unknown",
                buyerPhone: buyerData.phone || "N/A",
              };
            })
          );
          setPendingOrders(pending.filter(o => o && o.userId !== user.uid));
        });

        // 🚚 Accepted Orders
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
              };
            })
          );
          setAcceptedOrders(accepted);
        });

        // ✅ Completed Orders
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

  // 🔍 Filter by delivery location
  const filterBySearch = (orders) => {
    if (!searchTerm.trim()) return orders;
    return orders.filter(order =>
      order.deliveryLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderOrders = (orders, type) => {
    const filtered = filterBySearch(orders);
    if (filtered.length === 0)
      return <p className="text-muted text-center my-2">No {type} orders found</p>;

    return (
      <div className="list-group">
        {filtered.map((order) => (
          <div key={order.id} className="card-warm mb-3">
            <div className="row">
              <div className="col-4">
                <strong>Canteen:</strong> <br /> {order.canteen}
              </div>
              <div className="col-4">
                <strong>Items:</strong> <br /> {order.items?.join(", ") || "N/A"}
              </div>
              <div className="col-4">
                <strong>Delivery:</strong> <br /> {order.deliveryLocation || "N/A"}
              </div>
            </div>

            {type === "accepted" && (
              <div className="mt-3">
                <p className="mb-1">
                  <strong>Buyer:</strong> {order.userName}
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong>{" "}
                  <a href={`tel:${order.buyerPhone}`} style={{ textDecoration: "none" }}>
                    {order.buyerPhone}
                  </a>
                </p>
              </div>
            )}

            {type === "available" && (
              <Button
                className="btn-warm-primary mt-3"
                size="sm"
                onClick={() => handleAccept(order.id)}
              >
                Accept Order
              </Button>
            )}
            {type === "accepted" && (
              <Button
                className="btn-warm-success mt-3"
                size="sm"
                onClick={() => handleDeliver(order)}
              >
                Mark as Delivered
              </Button>
            )}
            {type === "completed" && (
              <span className="badge bg-success mt-3">Delivered</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="warm-bg min-vh-100 py-4">
      <div className="container">
        <h2 className="text-center fw-bold mb-4" style={{ color: "#4e342e" }}>
          🛵 Runner Dashboard
        </h2>

        <InputGroup className="mb-4">
          <Form.Control
            type="text"
            placeholder="Search by delivery location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            className="btn-warm-primary"
            onClick={() => setSearchTerm("")}
          >
            Clear
          </Button>
        </InputGroup>

        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>Available Orders ({pendingOrders.length})</Accordion.Header>
            <Accordion.Body>{renderOrders(pendingOrders, "available")}</Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1">
            <Accordion.Header>Your Accepted Orders ({acceptedOrders.length})</Accordion.Header>
            <Accordion.Body>{renderOrders(acceptedOrders, "accepted")}</Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2">
            <Accordion.Header>Completed Orders ({completedOrders.length})</Accordion.Header>
            <Accordion.Body>{renderOrders(completedOrders, "completed")}</Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </div>

      {/* Modal */}
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
          <Button className="btn-warm-success" onClick={confirmDelivery}>
            Confirm Delivery
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RunnerDashboard;
