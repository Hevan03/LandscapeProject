import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const AdminMaintenanceRequests = () => {
  const { api, user } = useAuth();
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHires = async () => {
    try {
      setLoading(true);
      const res = await api.get("/maintenance/admin/hires");
      setHires(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load hire requests");
    } finally {
      setLoading(false);
    }
  };

  const respond = async (hireId, action) => {
    try {
      await api.post(`/maintenance/admin/hires/${hireId}/respond`, { action });
      toast.success(action === "approve" ? "Hire approved" : "Hire rejected");
      fetchHires();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update hire request");
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchHires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Maintenance Hire Requests</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Customer</th>
                <th className="p-3">Worker</th>
                <th className="p-3">Date</th>
                <th className="p-3">Time</th>
                <th className="p-3">Address</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hires.map((h) => (
                <tr key={h._id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{h.customer?.name || "-"}</div>
                    <div className="text-sm text-gray-500">{h.customer?.email}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{h.maintenanceWorker?.name || "-"}</div>
                    <div className="text-sm text-gray-500">{h.maintenanceWorker?.specialization}</div>
                  </td>
                  <td className="p-3">{h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : "-"}</td>
                  <td className="p-3">{h.scheduledTime || "-"}</td>
                  <td className="p-3">{h.address || "-"}</td>
                  <td className="p-3 capitalize">{h.status}</td>
                  <td className="p-3 space-x-2">
                    <button
                      disabled={h.status !== "pending"}
                      onClick={() => respond(h._id, "approve")}
                      className={`px-3 py-1 rounded text-white ${h.status !== "pending" ? "bg-gray-300" : "bg-green-600 hover:bg-green-700"}`}
                    >
                      Approve
                    </button>
                    <button
                      disabled={h.status !== "pending"}
                      onClick={() => respond(h._id, "reject")}
                      className={`px-3 py-1 rounded ${h.status !== "pending" ? "bg-gray-100 text-gray-400" : "bg-red-100 text-red-700"}`}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMaintenanceRequests;
