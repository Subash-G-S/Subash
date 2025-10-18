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

        // 🔹 Available orders
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
                userCode: buyerData.code || "",
              };
            })
          );
          setPendingOrders(pending.filter(o => o && o.userId !== user.uid));
        });

        // 🔹 Accepted orders
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

        // 🔹 Completed orders
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

  // 🔍 Filter orders by delivery location
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
          <div key={order.id} className="list-group-item">
            <div className="row">
              {/* 🔹 3-column layout: Canteen | Items | Delivery */}
              <div className="col-4">
                <strong>Canteen:</strong>
                <br />
                {order.canteen}
              </div>
              <div className="col-4">
                <strong>Items:</strong>
                <br />
                {order.items?.join(", ") || "N/A"}
              </div>
              <div className="col-4">
                <strong>Delivery:</strong>
                <br />
                {order.deliveryLocation || "Not specified"}
              </div>
            </div>

            {/* ✅ Show Buyer & Phone ONLY in Accepted Orders */}
            {type === "accepted" && (
              <div className="mt-2">
                <p className="mb-1">
                  <strong>Buyer:</strong> {order.userName}
                </p>
                <p className="mb-1">
                  <strong>Phone:</strong> {order.buyerPhone}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {type === "available" && (
              <Button
                variant="outline-primary"
                size="sm"
                className="mt-2"
                onClick={() => handleAccept(order.id)}
              >
                Accept Order
              </Button>
            )}
            {type === "accepted" && (
              <Button
                variant="outline-success"
                size="sm"
                className="mt-2"
                onClick={() => handleDeliver(order)}
              >
                Mark as Delivered
              </Button>
            )}
            {type === "completed" && (
              <span className="badge bg-success mt-2">Delivered</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-4">
      <h2 className="text-center text-primary mb-4">Runner Dashboard</h2>

      {/* 🔍 Search Bar */}
      <InputGroup className="mb-4">
        <Form.Control
          type="text"
          placeholder="Search by delivery location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
          Clear
        </Button>
      </InputGroup>

      {/* 🔽 Accordion Dropdown (auto-collapse) */}
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            Available Orders ({pendingOrders.length})
          </Accordion.Header>
          <Accordion.Body>{renderOrders(pendingOrders, "available")}</Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="1">
          <Accordion.Header>
            Your Accepted Orders ({acceptedOrders.length})
          </Accordion.Header>
          <Accordion.Body>{renderOrders(acceptedOrders, "accepted")}</Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey="2">
          <Accordion.Header>
            Completed Orders ({completedOrders.length})
          </Accordion.Header>
          <Accordion.Body>{renderOrders(completedOrders, "completed")}</Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Modal for Delivery Code */}
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
