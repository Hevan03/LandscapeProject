import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { getLandscapesForLandscaper } from "../../api/landscapeApi";
import MachineryShop from "../../components/Inventory/MachineryShop";

// Simple wrapper: left column project selector, right shows MachineryShop modal flow
const LandscaperRentalOrders = () => {
  const { user } = useContext(AuthContext);
  const landscaperId = user?.id || user?._id;
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!landscaperId) return;
      try {
        const data = await getLandscapesForLandscaper(landscaperId);
        setProjects(data);
        if (data?.length) setSelectedProject(data[0]);
      } catch (e) {
        console.error("Failed to load projects", e);
      }
    };
    load();
  }, [landscaperId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Rental Orders</h1>
          <p className="text-gray-500">Choose a project to order resources for.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold mb-3">Your Projects</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedProject(p)}
                  className={`w-full text-left px-3 py-2 rounded-lg border ${
                    selectedProject?._id === p._id ? "bg-green-50 border-green-300" : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-gray-800 line-clamp-1">{p.name}</div>
                  <div className="text-xs text-gray-500">Status: {p.status || "N/A"}</div>
                </button>
              ))}
              {!projects.length && <div className="text-sm text-gray-500">No projects found.</div>}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedProject ? (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="text-sm text-green-800">
                  Ordering for project: <span className="font-semibold">{selectedProject.name}</span>
                </div>
              </div>
            ) : null}

            {/* Reuse MachineryShop for browsing & creating rental orders */}
            <MachineryShop />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandscaperRentalOrders;
