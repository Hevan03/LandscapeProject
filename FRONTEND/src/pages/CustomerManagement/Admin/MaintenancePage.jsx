import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : "http://localhost:5001/api",
  withCredentials: true,
});

function statusBadgeClass(status = "") {
  switch (status.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "accepted":
      return "bg-blue-100 text-blue-800";
    case "in-progress":
      return "bg-indigo-100 text-indigo-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

const MaintenancePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ManagementEmployee";

  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  const fetchAdminHires = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      setErrMsg("");
      const res = await api.get("/maintenance/admin/hires");
      // Accept either {hires: []} or [] shapes
      const data = Array.isArray(res.data) ? res.data : res.data?.hires || [];
      setHires(data);
    } catch (err) {
      console.error(err);
      setErrMsg(err?.response?.data?.message || "Failed to load hires");
      setHires([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminHires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Hired Customers</h1>

        {!isAdmin ? (
          <div className="bg-white rounded-2xl shadow p-6 text-center">Only admins can view this page.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">All Hire Requests (Customers)</h2>
                <button onClick={fetchAdminHires} className="px-3 py-1.5 text-sm bg-white/10 text-white rounded-md hover:bg-white/20">
                  Refresh
                </button>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-gray-600">Loading...</div>
              ) : errMsg ? (
                <div className="text-red-600">{errMsg}</div>
              ) : hires.length === 0 ? (
                <div className="text-gray-600">No hires found.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {hires.map((h) => {
                    const customer = h.customer || {};
                    const worker = h.maintenanceWorker || {};
                    const when =
                      (h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : "-") + (h.scheduledTime ? ` • ${h.scheduledTime}` : "");
                    return (
                      <div key={h._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="font-semibold">{customer.name || "Customer"}</div>
                            <div className="text-sm text-gray-600">
                              {customer.email || ""}
                              {customer.email && (customer.phone || customer.contactNumber) ? " • " : ""}
                              {customer.phone || customer.contactNumber || ""}
                            </div>
                            <div className="text-sm">
                              Worker: <span className="text-gray-700">{worker.name || "-"}</span>
                            </div>
                            <div className="text-sm text-gray-700">{when}</div>
                            {h.address ? <div className="text-sm">Address: {h.address}</div> : null}
                            {h.description ? <div className="text-sm">Desc: {h.description}</div> : null}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass(h.status)}`}>{h.status || "unknown"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
