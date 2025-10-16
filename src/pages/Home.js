import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container py-5">
      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm">
        <div className="container-fluid py-5">
          <h1 className="display-5 fw-bold text-primary">Ahaar - the College Canteen App</h1>
          <p className="col-md-8 fs-5 text-muted">
            Easily place food orders, and your friends will deliver you.
          </p>
          <div className="d-flex gap-3 mt-4">
            <Link to="/order" className="btn btn-primary btn-lg">
              Place an Order
            </Link>
            <Link to="/login" className="btn btn-outline-secondary btn-lg">
              Login
            </Link>
          </div>
        </div>
      </div>

      <div className="row text-center mt-5">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Fast Ordering</h5>
              <p className="card-text text-muted">Order your favorite food in just a few clicks.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mt-4 mt-md-0">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Live Tracking</h5>
              <p className="card-text text-muted">Know exactly when your food is arriving.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mt-4 mt-md-0">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <h5 className="card-title">Runner Friendly</h5>
              <p className="card-text text-muted">Simple dashboard for runners to manage orders.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
