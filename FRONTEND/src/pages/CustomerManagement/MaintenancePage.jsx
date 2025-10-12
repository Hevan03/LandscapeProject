import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const badge = (status = "") => {
  switch ((status || "").toLowerCase()) {
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
};

// convert availability array to a map, with defaults
const arrayToMap = (arr = []) => {
  const map = {};
  arr.forEach((a) => {
    map[a.day] = { from: a.from, to: a.to, available: !!a.available };
  });
  ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].forEach((d) => {
    if (!map[d]) map[d] = { from: "09:00", to: "17:00", available: false };
  });
  return map;
};

const MaintenancePage = () => {
  const { user, api } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMaintenance = user?.role === "maintenance";
  const isCustomer = user?.role === "customer";

  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");

  // holds a worker id to preselect after workers are loaded
  const preselectIdRef = useRef(null);

  // maintenance profile (maintenance users only)
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: "Lawn Maintenance",
    skills: ["Lawn Mowing", "Garden Maintenance", "Hedge Trimming"],
    availableTimes: {
      monday: { from: "09:00", to: "17:00", available: true },
      tuesday: { from: "09:00", to: "17:00", available: true },
      wednesday: { from: "09:00", to: "17:00", available: true },
      thursday: { from: "09:00", to: "17:00", available: true },
      friday: { from: "09:00", to: "17:00", available: true },
      saturday: { from: "10:00", to: "15:00", available: false },
      sunday: { from: "10:00", to: "15:00", available: false },
    },
  });

  // hires list
  const [myHires, setMyHires] = useState([]);

  // customer: hire form + worker list
  const [workers, setWorkers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    maintenanceWorkerId: "",
    scheduledDate: "",
    scheduledTime: "",
    address: "",
    description: "",
  });

  // validation state and refs
  const [errors, setErrors] = useState({});
  const fieldRefs = {
    maintenanceWorkerId: useRef(null),
    scheduledDate: useRef(null),
    scheduledTime: useRef(null),
    address: useRef(null),
    description: useRef(null),
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const nowHHMM = (() => {
    const n = new Date();
    const hh = String(n.getHours()).padStart(2, "0");
    const mm = String(n.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  })();

  const isValidDateStr = (s) => {
    if (!s) return false;
    const t = new Date(s).getTime();
    return Number.isFinite(t);
  };

  const hhmmToMinutes = (hhmm) => {
    const [h, m] = (hhmm || "").split(":").map((x) => parseInt(x, 10));
    if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
    return h * 60 + m;
  };

  const isPastDateTime = (dateStr, timeStr) => {
    // Use local date comparison to avoid UTC issues
    const pad2 = (n) => String(n).padStart(2, "0");
    const parseLocalDate = (s) => {
      const [y, m, d] = (s || "").split("-").map((x) => parseInt(x, 10));
      if (!y || !m || !d) return null;
      const dt = new Date(y, m - 1, d);
      if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
      return dt;
    };

    const selDate = parseLocalDate(dateStr);
    if (!selDate) return true;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const selStart = new Date(selDate.getFullYear(), selDate.getMonth(), selDate.getDate());

    if (selStart < todayStart) return true;
    if (selStart > todayStart) return false;

    // Same day: compare time
    const selMins = hhmmToMinutes(timeStr);
    if (Number.isNaN(selMins)) return true;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return selMins <= nowMins;
  };

  const validateForm = (f) => {
    const next = {};
    // worker must exist in loaded list
    if (!f.maintenanceWorkerId) {
      next.maintenanceWorkerId = "Please select a maintenance worker.";
    } else if (!workers.some((w) => String(w._id) === String(f.maintenanceWorkerId))) {
      next.maintenanceWorkerId = "Selected worker is not available.";
    }

    // date
    if (!f.scheduledDate) {
      next.scheduledDate = "Please select a date.";
    } else if (!isValidDateStr(f.scheduledDate)) {
      next.scheduledDate = "Invalid date.";
    } else if (f.scheduledDate < todayStr) {
      next.scheduledDate = "Date cannot be in the past.";
    }

    // time
    if (!f.scheduledTime) {
      next.scheduledTime = "Please select a time.";
    } else if (Number.isNaN(hhmmToMinutes(f.scheduledTime))) {
      next.scheduledTime = "Invalid time format.";
    } else if (!next.scheduledDate && isPastDateTime(f.scheduledDate, f.scheduledTime)) {
      next.scheduledTime = "Time must be later than the current time.";
    }

    // address
    const addr = (f.address || "").trim();
    if (!addr) {
      next.address = "Address is required.";
    } else if (addr.length < 5) {
      next.address = "Address must be at least 5 characters.";
    } else if (addr.length > 120) {
      next.address = "Address must be 120 characters or less.";
    }

    // description (optional)
    const desc = (f.description || "").trim();
    if (desc.length > 500) {
      next.description = "Description must be 500 characters or less.";
    }

    return next;
  };

  // read preselect worker id from query or navigation state
  useEffect(() => {
    if (!isCustomer) return;
    const search = new URLSearchParams(location.search);
    const fromQuery = search.get("workerId") || search.get("maintenanceWorkerId") || search.get("id");
    const fromState = location.state?.workerId || location.state?.maintenanceWorkerId || location.state?.id;
    const pre = fromState || fromQuery;
    if (pre) preselectIdRef.current = String(pre);
  }, [location, isCustomer]);

  // after workers load, apply preselection if present
  useEffect(() => {
    if (!isCustomer || !workers.length || !preselectIdRef.current) return;
    const id = preselectIdRef.current;
    const exists = workers.some((w) => String(w._id) === String(id));
    if (exists) {
      setForm((f) => ({ ...f, maintenanceWorkerId: id }));
      setErrors((er) => ({ ...er, maintenanceWorkerId: undefined }));
    }
    preselectIdRef.current = null;
  }, [workers, isCustomer]);

  // maintenance: load profile + hires (as worker)
  const loadForMaintenance = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const res = await api.get("/maintenance/me/profile");
      const data = res.data || {};
      setProfile((p) => ({
        ...p,
        name: data.name || p.name,
        email: data.email || p.email,
        phone: data.phone || p.phone,
        specialization: data.specialization || p.specialization,
        skills: Array.isArray(data.skills) ? data.skills : p.skills,
        availableTimes: arrayToMap(data.availableTimes || []),
      }));
      const hireRes = await api.get("/maintenance/me/hires");
      setMyHires(Array.isArray(hireRes.data) ? hireRes.data : []);
    } catch (e) {
      setErrMsg(e?.response?.data?.message || "Failed to load maintenance data");
      setMyHires([]);
    } finally {
      setLoading(false);
    }
  };

  // customer: load own hires
  const loadForCustomer = async () => {
    try {
      setErrMsg("");
      setLoading(true);
      const res = await api.get("/maintenance/customer/hires");
      setMyHires(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErrMsg(e?.response?.data?.message || "Failed to load your hire requests");
      setMyHires([]);
    } finally {
      setLoading(false);
    }
  };

  // customer: fetch maintenance workers
  const loadWorkers = async () => {
    try {
      setErrMsg("");
      let res = await api.get("/maintenance");
      if (!Array.isArray(res.data)) {
        res = await api.get("/maintenance/workers");
      }
      const list = Array.isArray(res.data) ? res.data : res.data?.workers || [];
      setWorkers(list);
    } catch (e) {
      setWorkers([]);
      toast.error(e?.response?.data?.message || "Failed to load maintenance workers");
    }
  };

  // customer: submit hire form (with validation)
  const submitHire = async (e) => {
    e.preventDefault();

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      const firstKey = Object.keys(nextErrors)[0];
      fieldRefs[firstKey]?.current?.focus();
      toast.error("Please correct the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/maintenance/hire", {
        maintenanceWorkerId: form.maintenanceWorkerId,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        address: form.address.trim(),
        description: form.description.trim(),
      });
      toast.success("Hire request sent");
      setForm({
        maintenanceWorkerId: "",
        scheduledDate: "",
        scheduledTime: "",
        address: "",
        description: "",
      });
      setErrors({});
      await loadForCustomer();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to send hire request");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (isMaintenance) {
      loadForMaintenance();
    } else if (isCustomer) {
      loadWorkers();
      loadForCustomer();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // hires list (shared renderer)
  const HiresList = ({ title }) => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button
          onClick={() => (isMaintenance ? loadForMaintenance() : loadForCustomer())}
          className="px-3 py-1.5 text-sm bg-white/10 text-white rounded-md hover:bg-white/20"
        >
          Refresh
        </button>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : myHires.length === 0 ? (
          <div className="text-gray-600">No hires found.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myHires.map((h) => {
              const customer = h.customer || {};
              const worker = h.maintenanceWorker || {};
              const when =
                (h.scheduledDate ? new Date(h.scheduledDate).toLocaleDateString() : "-") + (h.scheduledTime ? ` • ${h.scheduledTime}` : "");
              return (
                <div key={h._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      {isMaintenance ? (
                        <>
                          <div className="font-semibold">{customer.name || "Customer"}</div>
                          <div className="text-sm text-gray-600">
                            {customer.email || ""}
                            {customer.email && (customer.phone || customer.contactNumber) ? " • " : ""}
                            {customer.phone || customer.contactNumber || ""}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold">{worker.name || "Worker"}</div>
                          <div className="text-sm text-gray-600">{worker.specialization || ""}</div>
                        </>
                      )}
                      <div className="text-sm text-gray-700">{when}</div>
                      {h.address ? <div className="text-sm">Address: {h.address}</div> : null}
                      {h.description ? <div className="text-sm">Desc: {h.description}</div> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge(h.status)}`}>{h.status || "unknown"}</span>
                      {!isMaintenance && h.status === "accepted" && (
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              maintenanceWorkerId: worker?._id || "",
                              hireId: h._id,
                            });
                            navigate(`/payment-management/service?${params.toString()}`);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">{isMaintenance ? "Maintenance Profile & Hires" : "Maintenance"}</h1>

        {errMsg && <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{errMsg}</div>}

        {isMaintenance ? (
          <>
            {/* Maintenance profile */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                <h2 className="text-xl font-bold text-white">My Profile</h2>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-gray-600">{profile.phone}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Specialization</h4>
                  <p>{profile.specialization}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-2">
                  <h4 className="font-medium mb-2">Availability</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(profile.availableTimes).map(([day, times]) => (
                      <div key={day} className="flex">
                        <div className="w-1/3 capitalize">{day}</div>
                        <div className="w-2/3">
                          {times.available ? (
                            <span>
                              {times.from} - {times.to}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not available</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hires list (maintenance) */}
            <HiresList title="My Hires (Customers)" />
          </>
        ) : (
          // Customer view: left hire form, right my requests
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Hire form with validation */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                <h2 className="text-xl font-bold text-white">Hire a Maintenance Worker</h2>
              </div>
              <form onSubmit={submitHire} className="p-6 space-y-4" noValidate>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Worker</label>
                  <select
                    ref={fieldRefs.maintenanceWorkerId}
                    value={form.maintenanceWorkerId}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, maintenanceWorkerId: e.target.value }));
                      if (errors.maintenanceWorkerId) setErrors((er) => ({ ...er, maintenanceWorkerId: undefined }));
                    }}
                    className={`mt-1 block w-full py-2 px-1 rounded-md border ${
                      errors.maintenanceWorkerId ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-green-500 focus:ring-green-500`}
                    aria-invalid={!!errors.maintenanceWorkerId}
                    aria-describedby={errors.maintenanceWorkerId ? "err-worker" : undefined}
                    required
                  >
                    <option value="">Choose a worker</option>
                    {workers.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name || "Worker"} {w.specialization ? `— ${w.specialization}` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.maintenanceWorkerId && (
                    <p id="err-worker" className="mt-1 text-sm text-red-600">
                      {errors.maintenanceWorkerId}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      ref={fieldRefs.scheduledDate}
                      type="date"
                      value={form.scheduledDate}
                      min={todayStr}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, scheduledDate: e.target.value }));
                        if (errors.scheduledDate || errors.scheduledTime) {
                          setErrors((er) => ({ ...er, scheduledDate: undefined, scheduledTime: undefined }));
                        }
                      }}
                      className={`mt-1 block w-full rounded-md border py-2 px-1 ${
                        errors.scheduledDate ? "border-red-500" : "border-gray-300"
                      } shadow-sm focus:border-green-500 focus:ring-green-500`}
                      aria-invalid={!!errors.scheduledDate}
                      aria-describedby={errors.scheduledDate ? "err-date" : undefined}
                      required
                    />
                    {errors.scheduledDate && (
                      <p id="err-date" className="mt-1 text-sm text-red-600">
                        {errors.scheduledDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      ref={fieldRefs.scheduledTime}
                      type="time"
                      value={form.scheduledTime}
                      min={form.scheduledDate === todayStr ? nowHHMM : undefined}
                      onChange={(e) => {
                        setForm((f) => ({ ...f, scheduledTime: e.target.value }));
                        if (errors.scheduledTime) setErrors((er) => ({ ...er, scheduledTime: undefined }));
                      }}
                      className={`mt-1 block w-full rounded-md border py-2 px-1 ${
                        errors.scheduledTime ? "border-red-500" : "border-gray-300"
                      } shadow-sm focus:border-green-500 focus:ring-green-500`}
                      aria-invalid={!!errors.scheduledTime}
                      aria-describedby={errors.scheduledTime ? "err-time" : undefined}
                      required
                    />
                    {errors.scheduledTime && (
                      <p id="err-time" className="mt-1 text-sm text-red-600">
                        {errors.scheduledTime}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    ref={fieldRefs.address}
                    type="text"
                    value={form.address}
                    maxLength={120}
                    placeholder="Street, City"
                    onChange={(e) => {
                      setForm((f) => ({ ...f, address: e.target.value }));
                      if (errors.address) setErrors((er) => ({ ...er, address: undefined }));
                    }}
                    className={`mt-1 block w-full rounded-md border py-2 px-1 ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-green-500 focus:ring-green-500`}
                    aria-invalid={!!errors.address}
                    aria-describedby={errors.address ? "err-address" : undefined}
                    required
                  />
                  <div className="mt-1 text-xs text-gray-500">{form.address.trim().length}/120</div>
                  {errors.address && (
                    <p id="err-address" className="mt-1 text-sm text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                  <textarea
                    ref={fieldRefs.description}
                    rows={3}
                    value={form.description}
                    maxLength={500}
                    placeholder="Describe the work to be done"
                    onChange={(e) => {
                      setForm((f) => ({ ...f, description: e.target.value }));
                      if (errors.description) setErrors((er) => ({ ...er, description: undefined }));
                    }}
                    className={`mt-1 block w-full py-2 px-1 rounded-md border ${
                      errors.description ? "border-red-500" : "border-gray-300"
                    } shadow-sm focus:border-green-500 focus:ring-green-500`}
                    aria-invalid={!!errors.description}
                    aria-describedby={errors.description ? "err-description" : undefined}
                  />
                  <div className="mt-1 text-xs text-gray-500">{form.description.length}/500</div>
                  {errors.description && (
                    <p id="err-description" className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send Hire Request"}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: My hire requests */}
            <HiresList title="My Hire Requests" />
          </div>
        )}

        {/* Small hint for customers */}
        {isCustomer && (
          <div className="max-w-6xl mx-auto mt-6 text-center text-sm text-gray-600">You can also browse workers on Customer → Maintenance.</div>
        )}
      </div>
    </div>
  );
};

export default MaintenancePage;
