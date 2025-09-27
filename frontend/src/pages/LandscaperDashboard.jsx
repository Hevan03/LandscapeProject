// frontend/pages/LandscaperDashboard.jsx
import React from "react";

const LandscaperDashboard = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🌿 Landscaper Dashboard</h1>
      <p style={styles.subtitle}>
        Welcome to the Leafsphere system. Manage your landscaping projects and
        schedules here.
      </p>
      <div style={styles.cardContainer}>
        <div style={styles.card}>📅 View Work Schedule</div>
        <div style={styles.card}>🪴 Manage Landscaping Tasks</div>
        <div style={styles.card}>📊 Reports & Performance</div>
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
    background: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "200px",
    textAlign: "center",
    cursor: "pointer",
  },
};

export default LandscaperDashboard;
