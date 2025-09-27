// frontend/pages/LandscaperLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandscaperLogin = () => {
  const [email, setEmail] = useState("");   // using email instead of username
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      // Save JWT + user details
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Role-based redirect
      switch (data.user.role) {
        case "driver":
          navigate("/driver-dashboard");
          break;
        case "landscaper":
          navigate("/landscaper-dashboard");
          break;
        case "management":
          navigate("/management-dashboard");
          break;
        default:
          navigate("/user-dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.title}>Leafsphere Login Portal</h2>
        <p style={styles.subtitle}>Please sign in to continue</p>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="Enter email"
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
              required
            />
          </div>
          {error && <p style={styles.errorText}>{error}</p>}
          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f0f2f5" },
  loginBox: { padding: "40px", backgroundColor: "white", borderRadius: "8px", width: "400px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  title: { marginBottom: "10px", fontSize: "24px" },
  subtitle: { marginBottom: "20px", color: "#666" },
  inputGroup: { marginBottom: "15px", textAlign: "left" },
  label: { fontWeight: "bold" },
  input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" },
  button: { width: "100%", padding: "12px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" },
  errorText: { color: "red", marginBottom: "10px" },
};

export default LandscaperLogin;
