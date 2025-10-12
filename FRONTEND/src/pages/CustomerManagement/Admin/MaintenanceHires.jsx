import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const AdminMaintenanceHires = () => {
  const { api } = useAuth();
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // { [hireId]: true }

  useEffect(() => {
    const fetchAdminHires = async () => {
      try {
        setLoading(true);
        const res = await api.get("/maintenance/admin/hires");
        setHires(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        toast.error("Failed to load hires");
        setHires([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminHires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusBadge = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Approve/Reject handler
  const handleAction = async (hireId, action) => {
    setActionLoading((prev) => ({ ...prev, [hireId]: true }));
    try {
      const res = await api.patch(`/maintenance/admin/hires/${hireId}/status`, { status: action });
      toast.success(`Request ${action === "accepted" ? "approved" : "rejected"}`);
      setHires((prev) => prev.map((h) => (h._id === hireId ? { ...h, status: action } : h)));
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [hireId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Hired Customers</h1>
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <h2 className="text-xl font-bold text-white">All Hire Requests (Customers)</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-gray-600">Loading...</div>
            ) : hires.length === 0 ? (
              <div className="text-gray-600">No hires found.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {hires.map((h) => (
                  <div key={h._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">{h.customer?.name || "Customer"}</div>
                        <div className="text-sm text-gray-600">
                          {h.customer?.email || ""}
                          {h.customer?.email && (h.customer?.phone || h.customer?.contactNumber) ? " • " : ""}
                          {h.customer?.phone || h.customer?.contactNumber || ""}
                        </div>
                        <div className="text-sm mt-1">Worker: {h.maintenanceWorker?.name || "-"}</div>
                        <div className="text-sm text-gray-700 mt-1">
                          {h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : "-"} • {h.scheduledTime || "-"}
                        </div>
                        {h.address && <div className="text-sm">Address: {h.address}</div>}
                        {h.description && <div className="text-sm">Desc: {h.description}</div>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(h.status)}`}>{h.status}</span>
                        {h.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              disabled={actionLoading[h._id]}
                              onClick={() => handleAction(h._id, "accepted")}
                              className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              disabled={actionLoading[h._id]}
                              onClick={() => handleAction(h._id, "rejected")}
                              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMaintenanceHires;
