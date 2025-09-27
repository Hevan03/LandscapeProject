// frontend/pages/DriverDashboard.jsx
import React from "react";

const DriverDashboard = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🚚 Driver Dashboard</h1>
      <p style={styles.subtitle}>
        Manage your delivery routes and track jobs here.
      </p>
      <div style={styles.cardContainer}>
        <div style={styles.card}>📍 View Assigned Routes</div>
        <div style={styles.card}>📦 Manage Deliveries</div>
        <div style={styles.card}>🕒 Track Work Hours</div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "40px", textAlign: "center" },
  heading: { fontSize: "28px", marginBottom: "10px" },
  subtitle: { fontSize: "16px", color: "#555", marginBottom: "30px" },
  cardContainer: { display: "flex", justifyContent: "center", gap: "20px" },
  card: {
    padding: "20px",
    background: "#fff4e6",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "200px",
    textAlign: "center",
    cursor: "pointer",
  },
};

export default DriverDashboard;
