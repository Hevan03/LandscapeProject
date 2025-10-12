import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Badge = ({ children }) => (
  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 mr-1 mb-1 inline-block">
    {children}
  </span>
);

const RatingStars = ({ value = 0 }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const arr = Array.from({ length: 5 }, (_, i) => (i < full ? "full" : i === full && half ? "half" : "empty"));
  return (
    <div className="flex items-center gap-0.5">
      {arr.map((t, idx) => (
        <svg
          key={idx}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          className={`w-4 h-4 ${t !== "empty" ? "text-yellow-500" : "text-gray-300"}`}
          fill="currentColor"
        >
          {t === "half" ? (
            <>
              <defs>
                <linearGradient id={`half-${idx}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.011l-2.985 2.271c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                fill={`url(#half-${idx})`}
              />
            </>
          ) : (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.011l-2.985 2.271c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          )}
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{value?.toFixed?.(1) ?? value}</span>
    </div>
  );
};

const BookLandscaper = () => {
  const navigate = useNavigate();
  const [landscapers, setLandscapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [sort, setSort] = useState("top");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5001/api/landscaper");
        if (isMounted) setLandscapers(res.data || []);
      } catch (e) {
        console.error("Failed to fetch landscapers", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => (isMounted = false);
  }, []);

  const allSpecialties = useMemo(() => {
    const set = new Set();
    landscapers.forEach((l) => (l.specialties || []).forEach((s) => set.add(s)));
    return ["all", ...Array.from(set)];
  }, [landscapers]);

  const filtered = useMemo(() => {
    let arr = landscapers;
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(
        (l) =>
          l.name?.toLowerCase().includes(q) || l.address?.toLowerCase().includes(q) || (l.specialties || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    if (specialty !== "all") {
      arr = arr.filter((l) => (l.specialties || []).includes(specialty));
    }
    if (sort === "top") {
      arr = [...arr].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === "new") {
      arr = [...arr].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "name") {
      arr = [...arr].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return arr;
  }, [landscapers, search, specialty, sort]);

  const toImage = (path) => {
    if (!path) return "https://via.placeholder.com/600x400?text=No+Image";
    if (path.startsWith("http")) return path;
    return `http://localhost:5001/${String(path).replace(/\\\\/g, "/")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800">Find Your Landscaper</h1>
            <p className="text-gray-600 mt-1">Browse vetted professionals and book an appointment in minutes.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, skill, or location"
                className="w-72 pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M9.5 17a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
              </svg>
            </div>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-green-500"
            >
              {allSpecialties.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All specialties" : s}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-green-500"
            >
              <option value="top">Top rated</option>
              <option value="new">Newest</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-t-4 border-b-4 border-green-500 animate-spin"></div>
              <div
                className="h-16 w-16 absolute top-2 left-2 rounded-full border-t-4 border-green-300 animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700">No landscapers found</h3>
            <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((l) => (
              <div key={l._id} className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden">
                <div className="h-44 bg-gray-100">
                  <img
                    src={toImage(l.Employee_Image)}
                    onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/800x600?text=No+Image")}
                    alt={l.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-800 truncate" title={l.name}>
                      {l.name}
                    </h3>
                    <RatingStars value={Number(l.rating || 0)} />
                  </div>
                  <p className="text-sm text-gray-500 mb-3 truncate" title={l.address}>
                    {l.address || "Address not specified"}
                  </p>
                  <div className="mb-3">
                    {(l.specialties || []).slice(0, 4).map((s) => (
                      <Badge key={s}>{s}</Badge>
                    ))}
                    {(l.specialties || []).length > 4 && <span className="text-xs text-gray-400">+{(l.specialties || []).length - 4} more</span>}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => navigate(`/book/${l._id}`)}
                      className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => navigate(`/landscaper/profile/${l._id}`)}
                      className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookLandscaper;
