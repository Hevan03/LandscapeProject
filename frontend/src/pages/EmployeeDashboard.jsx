// frontend/pages/EmployeeDashboard.jsx
import React from "react";

const EmployeeDashboard = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>👨‍💼 Employee Dashboard</h1>
      <p style={styles.subtitle}>
        Manage your profile, check updates, and access work resources.
      </p>
      <div style={styles.cardContainer}>
        <div style={styles.card}>👤 Profile Settings</div>
        <div style={styles.card}>📢 Company Announcements</div>
        <div style={styles.card}>📂 Work Resources</div>
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
    background: "#e6f7ff",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "200px",
    textAlign: "center",
    cursor: "pointer",
  },
};

export default EmployeeDashboard;
