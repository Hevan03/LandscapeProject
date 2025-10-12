import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CustomerMaintenance = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();

  const [workers, setWorkers] = useState([]);
  const [myHires, setMyHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, worker: null });
  const [form, setForm] = useState({ scheduledDate: "", scheduledTime: "", address: "", description: "", priority: "medium" });

  const canSubmit = useMemo(() => !!form.scheduledDate && !!form.scheduledTime && !!form.address, [form]);

  const fetchWorkers = async () => {
    try {
      const res = await api.get("/maintenance");
      setWorkers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load workers");
    }
  };

  const fetchMyHires = async () => {
    try {
      const res = await api.get("/maintenance/customer/hires");
      setMyHires(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      // ignore when not a customer
    }
  };

  const openModal = (w) => {
    setModal({ open: true, worker: w });
    setForm({ scheduledDate: "", scheduledTime: "", address: "", description: "", priority: "medium" });
  };

  const submitHire = async () => {
    if (!modal.worker) return;
    if (!canSubmit) return toast.error("Please fill date, time and address");
    try {
      const payload = { maintenanceWorkerId: modal.worker._id, ...form };
      await api.post("/maintenance/hire", payload);
      toast.success("Request sent");
      setModal({ open: false, worker: null });
      fetchMyHires();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send request");
    }
  };

  const cancelPending = async (hireId) => {
    // You may implement a cancel endpoint; for now just inform
    toast("Cancel feature pending");
  };

  useEffect(() => {
    if (!user) return;
    fetchWorkers();
    fetchMyHires();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Maintenance Services</h1>

      {/* Available Workers */}
      <div className="bg-white rounded shadow mb-6">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Available Maintenance Workers</h2>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((w) => (
            <div key={w._id} className="border rounded p-4 flex items-start justify-between">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-sm text-gray-600">{w.specialization}</div>
                {w.skills && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {w.skills.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => openModal(w)}>
                Hire
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* My Requests */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">My Hire Requests</h2>
        </div>
        <div className="p-4 space-y-3">
          {myHires.length === 0 ? (
            <div className="text-gray-600">No requests yet.</div>
          ) : (
            myHires.map((h) => (
              <div key={h._id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{h.maintenanceWorker?.name || "Worker"}</div>
                  <div className="text-sm text-gray-600">
                    {h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : "-"} • {h.scheduledTime || "-"}
                  </div>
                  <div className="text-sm">
                    Status: <span className="capitalize">{h.status}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {h.status === "pending" && (
                    <button onClick={() => cancelPending(h._id)} className="px-3 py-1 bg-gray-100 rounded">
                      Cancel
                    </button>
                  )}
                  {h.status === "accepted" && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams({ maintenanceWorkerId: h.maintenanceWorker?._id || "", hireId: h._id });
                        navigate(`/payment-management/service?${params.toString()}`);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Hire Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Hire {modal.worker?.name}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm">Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={form.scheduledDate}
                  onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Time</label>
                <input
                  type="time"
                  className="w-full border rounded p-2"
                  value={form.scheduledTime}
                  onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Address</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Description</label>
                <textarea
                  className="w-full border rounded p-2"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm">Priority</label>
                <select className="w-full border rounded p-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button className="px-3 py-1 bg-gray-100 rounded" onClick={() => setModal({ open: false, worker: null })}>
                Cancel
              </button>
              <button className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-60" onClick={submitHire} disabled={!canSubmit}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMaintenance;
