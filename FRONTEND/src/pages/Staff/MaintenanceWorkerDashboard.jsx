import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const MaintenanceWorkerDashboard = () => {
  const { api, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [hires, setHires] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerModal, setCustomerModal] = useState({ open: false, customer: null });
  const [ratingModal, setRatingModal] = useState({ open: false, targetId: null });
  const [ratingData, setRatingData] = useState({ rating: 5, comment: "", clientName: "" });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [pRes, hRes, payRes] = await Promise.all([
        api.get("/maintenance/me/profile"),
        api.get("/maintenance/me/hires"),
        api.get("/maintenance/me/payments").catch(() => ({ data: [] })),
      ]);
      setProfile(pRes.data);
      setHires(Array.isArray(hRes.data) ? hRes.data : []);
      setPayments(Array.isArray(payRes.data) ? payRes.data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const respond = async (hireId, action) => {
    try {
      await api.put(`/maintenance/me/hires/${hireId}/respond`, { action });
      toast.success(action);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update request");
    }
  };

  const viewCustomer = (hire) => {
    if (!hire?.customer) return toast.error("No customer details");
    setCustomerModal({ open: true, customer: hire.customer });
  };

  const rateCustomer = (hire) => {
    if (!hire?.customer?._id) return toast.error("Invalid customer");
    const defaultClient = profile?.name || user?.name || "";
    setRatingData((d) => ({ ...d, clientName: defaultClient || d.clientName }));
    setRatingModal({ open: true, targetId: hire.customer._id });
  };

  const submitRating = async () => {
    try {
      if (!ratingModal.targetId) return toast.error("No target selected");
      if (!ratingData.clientName.trim()) return toast.error("Please enter your name");
      await api.post(`/rating/${ratingModal.targetId}/rate-public`, {
        rating: Number(ratingData.rating) || 5,
        comment: ratingData.comment || "",
        clientName: ratingData.clientName,
      });
      toast.success("Feedback submitted");
      setRatingModal({ open: false, targetId: null });
      setRatingData({ rating: 5, comment: "", clientName: "" });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit rating");
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">My Profile</h2>
        </div>
        <div className="p-4">
          <div className="font-medium">{profile?.name}</div>
          <div className="text-gray-600 text-sm">{profile?.email}</div>
          <div className="text-gray-600 text-sm">{profile?.phone}</div>
          <div className="mt-2 text-sm">Specialization: {profile?.specialization}</div>
          {profile?.skills?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {profile.skills.map((s) => (
                <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full" key={s}>
                  {s}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Hire Requests */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Hire Requests</h2>
        </div>
        <div className="p-4 space-y-3">
          {hires.length === 0 ? (
            <div className="text-gray-600">No hire requests yet.</div>
          ) : (
            hires.map((h) => (
              <div key={h._id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">Customer: {h.customer?.name || "-"}</div>
                  <div className="text-sm text-gray-600">
                    {h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : "-"} • {h.scheduledTime || "-"}
                  </div>
                  <div className="text-sm">
                    Status: <span className="capitalize">{h.status}</span>
                  </div>
                  {h.address && <div className="text-sm">Address: {h.address}</div>}
                  {h.description && <div className="text-sm">Desc: {h.description}</div>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => viewCustomer(h)} className="px-3 py-1 bg-white border rounded">
                    View Customer
                  </button>
                  {h.status === "pending" && (
                    <>
                      <button onClick={() => respond(h._id, "accept")} className="px-3 py-1 bg-green-600 text-white rounded">
                        Accept
                      </button>
                      <button onClick={() => respond(h._id, "reject")} className="px-3 py-1 bg-red-100 text-red-700 rounded">
                        Reject
                      </button>
                    </>
                  )}
                  {h.status === "completed" && (
                    <button onClick={() => rateCustomer(h)} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded">
                      Add Feedback
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">My Payments</h2>
        </div>
        <div className="p-4 space-y-2">
          {payments.length === 0 ? (
            <div className="text-gray-600">No payments yet.</div>
          ) : (
            payments.map((p) => (
              <div key={p._id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">LKR {Number(p.amount || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Method: {p.method}</div>
                </div>
                <div className="text-sm">{new Date(p.createdAt || p.paymentDate || Date.now()).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {customerModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-5 rounded-t-2xl text-white">
              <h3 className="text-xl font-semibold">Hired Customer</h3>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Name: </span>
                <span className="font-medium">{customerModal.customer?.name || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Email: </span>
                <span>{customerModal.customer?.email || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone: </span>
                <span>{customerModal.customer?.phone || customerModal.customer?.contactNumber || "-"}</span>
              </div>
              <div>
                <span className="text-gray-500">Customer ID: </span>
                <span className="font-mono">{customerModal.customer?._id || "-"}</span>
              </div>
            </div>
            <div className="p-5 flex justify-end gap-2 border-t">
              <button onClick={() => setCustomerModal({ open: false, customer: null })} className="px-4 py-2 bg-gray-200 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-5 rounded-t-2xl text-white">
              <h3 className="text-xl font-semibold">Add Feedback</h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Your Name</label>
                <input
                  value={ratingData.clientName}
                  onChange={(e) => setRatingData((d) => ({ ...d, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Rating</label>
                <select
                  value={ratingData.rating}
                  onChange={(e) => setRatingData((d) => ({ ...d, rating: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded"
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Comment (optional)</label>
                <textarea
                  rows={4}
                  value={ratingData.comment}
                  onChange={(e) => setRatingData((d) => ({ ...d, comment: e.target.value }))}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Share your experience..."
                />
              </div>
            </div>
            <div className="p-5 flex justify-end gap-2 border-t">
              <button onClick={() => setRatingModal({ open: false, targetId: null })} className="px-4 py-2 bg-gray-200 rounded">
                Cancel
              </button>
              <button onClick={submitRating} className="px-4 py-2 bg-green-600 text-white rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceWorkerDashboard;
