import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../component/Navbar";

const RequestForm = () => {
  const [projectId, setProjectId] = useState("");
  const [landscaperName, setLandscaperName] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (!projectId || !landscaperName) {
      alert("Please fill all fields");
      return;
    }
    navigate("/selectitems", { state: { projectId, landscaperName } });
  };

  return (
    <>
    <Navbar />
    <div className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Request Items</h2>
      <input
        className="input input-bordered w-full mb-3"
        placeholder="Project ID"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
      />
      <input
        className="input input-bordered w-full mb-4"
        placeholder="Landscaper Name / ID"
        value={landscaperName}
        onChange={(e) => setLandscaperName(e.target.value)}
      />
      <button className="btn btn-primary w-full" onClick={handleNext}>
        Next
      </button>
    </div></>
    
  );
};

export default RequestForm;
