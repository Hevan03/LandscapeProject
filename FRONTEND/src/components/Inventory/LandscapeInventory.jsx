import React, { useEffect, useState } from "react";
import { getAllLandscaperRequests } from "../../api/requestApi";

const LandscapeInventory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await getAllLandscaperRequests();
        setRequests(res.data);
      } catch (err) {
        console.error("Error fetching requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-gray-700">
        Loading...
      </div>
    );

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-green-800 text-center">
          Landscaper Orders Dashboard
        </h2>

        {requests.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No landscaper requests found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl transition duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-green-700">
                    Project: {req.projectId}
                  </h3>
                  <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                    {req.landscaper}
                  </span>
                </div>

                <p className="text-gray-500 text-sm mb-3">
                  Requested on: {new Date(req.createdAt).toLocaleString()}
                </p>

                <div className="bg-green-50 rounded-lg p-3 mb-3">
                  <h4 className="font-semibold text-green-800 mb-2">Items:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    {req.items.map((i) => (
                      <li key={i._id}>
                        {i.item?.itemname || "Unknown Item"} | Qty: {i.qty} |
                        Rs. {Number(i.price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-right">
                  <span className="font-bold text-lg text-green-900">
                    Total: Rs.{Number(req.total).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default LandscapeInventory;
