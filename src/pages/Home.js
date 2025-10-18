import React, { useEffect } from "react";
import { Link } from "react-router-dom";

function Home() {
  useEffect(() => {
    // 🌀 Inject animated gradient + hover styles dynamically
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes warmGradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .hero-gradient {
        background: linear-gradient(270deg, #e2c290, #f0d7a7, #f8e1b7, #e8be91);
        background-size: 800% 800%;
        animation: warmGradientShift 10s ease infinite;
      }
      .card-hover {
        transition: all 0.3s ease;
      }
      .card-hover:hover {
        transform: translateY(-6px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      }
      .btn-animate {
        transition: all 0.3s ease;
      }
      .btn-animate:hover {
        transform: scale(1.05);
      }

      /* 🎨 Custom Button Hovers */
      .btn-order {
        background-color: #fff8e1 !important;
        color: #795548 !important;
        border: 2px solid #ffe0b2 !important;
      }
      .btn-order:hover {
        background-color: #f7d49b !important;
        color: #4e342e !important;
        border-color: #d7b97a !important;
      }

      .btn-runner {
        background-color: transparent !important;
        color: #fff8e1 !important;
        border: 2px solid #fff8e1 !important;
      }
      .btn-runner:hover {
        background-color: #795548 !important;
        color: #fff8e1 !important;
        border-color: #795548 !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div
      className="min-vh-100 d-flex flex-column"
      style={{
        background: "linear-gradient(135deg, #fffaf3 0%, #fff3e0 100%)",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* 🍯 Hero Section */}
      <section
        className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center px-4 py-5 hero-gradient"
        style={{
          color: "#4e342e",
          borderBottomLeftRadius: "40px",
          borderBottomRightRadius: "40px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h1
          className="fw-bold display-5 mb-3"
          style={{ letterSpacing: "0.5px", color: "#3e2723" }}
        >
          🍱 Ahaar
        </h1>
        <p className="fs-5 mb-4" style={{ color: "#5d4037" }}>
          Your college canteen app — fast ordering, smooth delivery, and happy eating!
        </p>

        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
          {/* 🟡 Place Order Button */}
          <Link
            to="/order"
            className="btn btn-lg fw-semibold shadow-sm px-4 py-2 btn-animate btn-order"
            style={{
              borderRadius: "50px",
              fontSize: "1.1rem",
            }}
          >
            Place an Order 🍔
          </Link>

          {/* 🟤 Runner Dashboard Button (Fixed Hover) */}
          <Link
            to="/runner"
            className="btn btn-lg fw-semibold px-4 py-2 btn-animate btn-runner"
            style={{
              borderRadius: "50px",
              fontSize: "1.1rem",
            }}
          >
            Runner Dashboard 🛵
          </Link>
        </div>
      </section>

      {/* 🔹 Features Section */}
      <section className="container mt-5 mb-5 px-3">
        <div className="row g-4">
          <div className="col-md-4 col-sm-6">
            <div
              className="card h-100 border-0 shadow-lg text-center p-4 card-hover"
              style={{
                borderRadius: "20px",
                background: "linear-gradient(135deg, #fffdf6, #fff8e1)",
              }}
            >
              <div className="fs-1 mb-3">⚡</div>
              <h5 className="fw-bold text-brown mb-2" style={{ color: "#795548" }}>
                Fast Ordering
              </h5>
              <p className="text-muted">
                Place your food order in seconds — no waiting in long canteen queues!
              </p>
            </div>
          </div>

          <div className="col-md-4 col-sm-6">
            <div
              className="card h-100 border-0 shadow-lg text-center p-4 card-hover"
              style={{
                borderRadius: "20px",
                background: "linear-gradient(135deg, #fff3e0, #ffe0b2)",
              }}
            >
              <div className="fs-1 mb-3">🛵</div>
              <h5 className="fw-bold mb-2" style={{ color: "#8d6e63" }}>
                Runner Friendly
              </h5>
              <p className="text-muted">
                Manage, deliver, and earn with a simple and easy-to-use dashboard.
              </p>
            </div>
          </div>

          <div className="col-md-4 col-sm-12">
            <div
              className="card h-100 border-0 shadow-lg text-center p-4 card-hover"
              style={{
                borderRadius: "20px",
                background: "linear-gradient(135deg, #fff8e1, #ffecb3)",
              }}
            >
              <div className="fs-1 mb-3">📍</div>
              <h5 className="fw-bold mb-2" style={{ color: "#a1887f" }}>
                Real-Time Tracking
              </h5>
              <p className="text-muted">
                Know when your order is picked, on the way, and delivered — in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 🍪 CTA Section */}
      <section
        className="container text-center mt-auto mb-5 py-5 px-4 shadow-lg rounded-4"
        style={{
          background: "linear-gradient(135deg, #d7b97a, #e8c690, #f2d6a2)",
          color: "#4e342e",
        }}
      >
        <h2 className="fw-bold mb-3">Feeling Hungry?</h2>
        <p className="fs-5 mb-4">
          Order now and enjoy your favorite meal delivered by your friends in minutes!
        </p>
        <Link
          to="/order"
          className="btn btn-light btn-lg fw-semibold px-5 py-2 shadow-sm btn-animate"
          style={{
            borderRadius: "40px",
            color: "#6d4c41",
            backgroundColor: "#fff8e1",
            border: "2px solid #ffe0b2",
          }}
        >
          Start Ordering 🍕
        </Link>
      </section>

      {/* 🧡 Footer */}
      <footer className="text-center py-3 small" style={{ color: "#8d6e63" }}>
        © {new Date().getFullYear()} <strong>Ahaar</strong> | Made with 🍩 for College Life
      </footer>
    </div>
  );
}

export default Home;
