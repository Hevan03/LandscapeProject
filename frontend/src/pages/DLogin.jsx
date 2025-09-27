import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const DLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // dLogin removed: redirect users to the Driver Dashboard
    const t = setTimeout(() => navigate("/Driver-dashboard"), 1200);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Driver Login Removed</h2>
        <p className="text-gray-600 mb-6">
          The driver login feature has been removed. You will be redirected to the Driver Dashboard shortly.
        </p>
        <Link to="/Driver-dashboard" className="btn btn-primary">Go to Driver Dashboard</Link>
      </div>
    </div>
  );
};

export default DLogin;
