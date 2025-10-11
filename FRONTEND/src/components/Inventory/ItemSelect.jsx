import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllItems } from "../../api/itemApi";
// ...existing code...
import { createLandscaperRequest } from "../../api/requestApi";

const ItemSelect = () => {
  const { state } = useLocation();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getAllItems();
        setItems(res.data);
      } catch (err) {
        console.error("Error fetching items:", err);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    let t = 0;
    for (const id in selected) {
      const { qty, price } = selected[id];
      t += qty * price;
    }
    setTotal(t);
  }, [selected]);

  const handleCheck = (item) => {
    setSelected((prev) => {
      if (prev[item._id]) {
        const newSel = { ...prev };
        delete newSel[item._id];
        return newSel;
      }
      return { ...prev, [item._id]: { qty: 1, price: item.price * 0.7 } };
    });
  };

  const handleQtyChange = (id, qty) => {
    setSelected((prev) => ({
      ...prev,
      [id]: { ...prev[id], qty: parseInt(qty) || 1 },
    }));
  };

  const handleCheckout = async () => {
    const order = {
      projectId: state?.projectId,
      landscaper: state?.landscaperName,
      items: Object.entries(selected).map(([id, { qty, price }]) => ({
        item: id,
        qty,
        price,
      })),
      total,
    };

    try {
      const res = await createLandscaperRequest(order);
      console.log("Saved request:", res.data);
      alert("Request submitted successfully!");
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Failed to submit request");
    }
  };

  return (
    <>
      // ...existing code...
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Select Items for Project: {state?.projectId}</h2>
        <h5 className="text-xl font-bold mb-4">Landscaper: {state?.landscaperName}</h5>

        {items.length === 0 && <p className="text-gray-500">No items found.</p>}

        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item) => {
            const discounted = (item.price * 0.7).toFixed(2);
            const checked = selected[item._id];
            const isOutOfStock = item.quantity === 0;

            return (
              <div
                key={item._id}
                className={`card shadow p-4 border rounded-lg flex flex-col transition 
                  ${isOutOfStock ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {item.imageUrl && (
                  <div className="w-full flex justify-center mb-2">
                    <img src={`http://localhost:5001/${item.imageUrl}`} alt={item.itemname} className="max-h-48 w-auto object-contain rounded" />
                  </div>
                )}

                <h3 className="font-bold mt-2">{item.itemname}</h3>
                <p>Price: Rs.{item.price.toFixed(2)}</p>
                <p className="text-green-700">Discounted: Rs.{discounted}</p>

                <p className="text-sm mt-1">
                  {isOutOfStock ? <span className="text-red-600 font-semibold">Out of Stock</span> : <>Available: {item.quantity}</>}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <input type="checkbox" checked={!!checked} onChange={() => handleCheck(item)} disabled={isOutOfStock} />
                  <input
                    type="number"
                    min="1"
                    disabled={!checked || isOutOfStock}
                    value={checked ? checked.qty : ""}
                    onChange={(e) => handleQtyChange(item._id, e.target.value)}
                    className="input input-bordered w-20"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-bold">Total: Rs.{total.toFixed(2)}</h3>
          <button onClick={handleCheckout} className="btn btn-success mt-3" disabled={Object.keys(selected).length === 0}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default ItemSelect;
