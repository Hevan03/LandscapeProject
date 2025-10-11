import React, { useMemo, useState } from 'react';
import { BsCartPlus, BsPlusCircle, BsTrash, BsClipboardCheck } from 'react-icons/bs';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createOrder } from '../../api/orderApi';

// Helper to generate a random 24-char hex (valid ObjectId-like string for practice)
const randomObjectId = () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

const CreateOrder = () => {
  const navigate = useNavigate();
  const [customerId, setCustomerId] = useState(randomObjectId());
  const [items, setItems] = useState([
    { itemId: randomObjectId(), itemName: '', pricePerItem: 0, quantity: 1 }
  ]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.pricePerItem || 0) * Number(it.quantity || 0)), 0);
  }, [items]);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { itemId: randomObjectId(), itemName: '', pricePerItem: 0, quantity: 1 }]);
  const removeItem = (index) => setItems((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!customerId || customerId.length !== 24) {
      toast.error('Please provide a 24-character hex Customer ID.');
      return;
    }
    if (items.length === 0) {
      toast.error('Add at least one item.');
      return;
    }
    for (const it of items) {
      if (!it.itemId || it.itemId.length !== 24) {
        toast.error('Each item must have a valid 24-character hex Item ID.');
        return;
      }
      if (!it.itemName || Number(it.pricePerItem) <= 0 || Number(it.quantity) <= 0) {
        toast.error('Fill item name, positive price and quantity.');
        return;
      }
    }

    const normalizedItems = items.map((it) => ({
      itemId: it.itemId,
      itemName: it.itemName,
      pricePerItem: Number(it.pricePerItem),
      quantity: Number(it.quantity),
      totalPrice: Number(it.pricePerItem) * Number(it.quantity)
    }));

    try {
      const payload = {
        customerId,
        items: normalizedItems,
        totalAmount: totalAmount,
        readyForAssignment: false
      };
      const { data } = await createOrder(payload);
      toast.success('Order created successfully');
      // Deep-link to payment page so you can pay from UI
      navigate(`/PaymentManagement/InventoryPay?orderId=${data.order._id}&customerId=${customerId}&totalAmount=${totalAmount}`);
    } catch (err) {
      console.error('Create order error:', err);
      const msg = err.response?.data?.message || 'Failed to create order';
      toast.error(msg);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <BsCartPlus className="mr-3 text-green-700" />
          Create Order (Practice)
        </h1>
        <p className="text-gray-600 mb-6">Use this form to create real orders entirely from the frontend. After create, you'll be redirected to the Inventory Payments page for this order.</p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Customer ID (24-hex)</span></label>
              <input
                type="text"
                className="input input-bordered w-full rounded-lg"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value.trim())}
                maxLength={24}
                required
              />
              <label className="label"><span className="label-text-alt">For practice you can use any 24-hex string. A real Customer doc is not required.</span></label>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Total Amount (LKR)</span></label>
              <input type="text" className="input input-bordered w-full bg-gray-100" value={totalAmount.toLocaleString()} disabled />
            </div>
          </div>

          <div className="border rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-700">Items</h2>
              <button type="button" onClick={addItem} className="btn btn-sm btn-success text-white">
                <BsPlusCircle className="mr-1" /> Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Item ID (24-hex)</th>
                    <th>Item Name</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          className="input input-bordered w-48"
                          value={it.itemId}
                          maxLength={24}
                          onChange={(e) => updateItem(idx, 'itemId', e.target.value.trim())}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={it.itemName}
                          onChange={(e) => updateItem(idx, 'itemName', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          className="input input-bordered w-32"
                          value={it.pricePerItem}
                          onChange={(e) => updateItem(idx, 'pricePerItem', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="input input-bordered w-24"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          required
                        />
                      </td>
                      <td className="font-semibold">{(Number(it.pricePerItem || 0) * Number(it.quantity || 0)).toLocaleString()}</td>
                      <td>
                        <button type="button" onClick={() => removeItem(idx)} className="btn btn-ghost text-red-500">
                          <BsTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <Link to="/Admin-dashboard" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-success text-white">
              <BsClipboardCheck className="mr-2" /> Create and Go to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrder;
