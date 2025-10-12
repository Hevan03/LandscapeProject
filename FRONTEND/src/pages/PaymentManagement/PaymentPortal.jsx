import React, { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { clearCustomerCart } from "../../api/adminPaymentApi";
import AuthContext from "../../context/AuthContext";

// Initialize Stripe (replace with your publishable key)
const stripePromise = loadStripe("pk_test_51SGwqNF4Uqm38X79LtQNoQVJuTlAW2sDmYBNmXvetFuyLprCw0OhvEZKKDs3vegqgvbZ4Ds3uPzmk6EzQna4Ni5R007E7bkKXL");

// Card payment form component
const CardPaymentForm = ({ amount, orderId, orderType, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      // 1) Create payment intent on backend
      const intentRes = await fetch("http://localhost:5001/api/payment/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ amount, orderId, orderType }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.message || "Failed to create payment intent");

      // 2) Confirm card payment on client
      const cardElement = elements.getElement(CardElement);
      if (!postalCode) {
        toast.error("Please enter your billing postal/ZIP code");
        setLoading(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(intentData.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: billingName || undefined,
            address: { postal_code: postalCode || undefined },
          },
        },
      });
      if (error) throw error;

      // 3) Notify backend to confirm and update order/payment state
      const confirmRes = await fetch("http://localhost:5001/api/payment/confirm-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          orderId,
          orderType,
          paymentMethod: "Stripe",
        }),
      });
      const confirmData = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmData.message || "Payment confirmation failed");

      toast.success("Payment submitted and pending verification.");
      if (onSuccess) onSuccess(confirmData.paymentId || paymentIntent.id);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card</label>
          <input
            type="text"
            value={billingName}
            onChange={(e) => setBillingName(e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Billing Postal/ZIP Code</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="e.g. 12345"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
      </div>
      <div className="bg-gray-50 p-4 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <CardElement
          className="p-4 border border-gray-300 rounded-md bg-white"
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
        } transition-colors duration-300 flex justify-center items-center`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </button>
    </form>
  );
};

// Bank slip upload component
const BankSlipUpload = ({ amount, orderId, orderType, onSuccess }) => {
  const auth = useContext(AuthContext);
  const customerId = auth.user ? auth.user.id : null;
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [notes, setNotes] = useState("");
  const [reference, setReference] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please upload your bank slip");
      return;
    }

    if (!reference.trim()) {
      toast.error("Please enter a reference number");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("orderId", orderId);
      formData.append("customerId", customerId);
      formData.append("amount", amount);
      formData.append("method", "BankSlip");
      formData.append("bankSlip", file);
      formData.append("notes", notes);
      formData.append("orderType", orderType || "order");
      formData.append("referenceNumber", reference);

      const response = await fetch("http://localhost:5001/api/payment/bank-slip", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Bank slip uploaded successfully! Payment is pending verification.");
        onSuccess(data.paymentId);
      } else {
        toast.error(data.message || "Failed to upload bank slip");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload bank slip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Enter bank reference number"
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Bank Slip</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {preview ? (
              <div>
                <img src={preview} alt="Bank slip preview" className="mx-auto h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-4 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Bank Transfer Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Please transfer ${amount.toFixed(2)} to:</p>
              <p className="mt-1">
                Bank: <strong>Landscape Solutions Bank</strong>
              </p>
              <p>
                Account Name: <strong>Landscape Services Ltd</strong>
              </p>
              <p>
                Account Number: <strong>1234-5678-9012-3456</strong>
              </p>
              <p>
                Reference: <strong>LS-{orderId ? orderId.substring(0, 8) : ""}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
        } transition-colors duration-300 flex justify-center items-center`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </>
        ) : (
          "Submit Bank Slip"
        )}
      </button>
    </form>
  );
};

const PaymentPortal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const customerId = auth.user ? auth.user.id : null;

  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  // Get payment details from location state
  const paymentDetails = location.state || {
    amount: 0,
    orderId: "",
    orderType: "",
    returnUrl: "/",
  };

  // If there's no amount or order ID, redirect to home
  useEffect(() => {
    if (!paymentDetails.amount) {
      toast.error("Invalid payment request");
      navigate("/");
    }
  }, [paymentDetails, navigate]);

  // Handle successful payment
  const handlePaymentSuccess = async (id) => {
    setPaymentId(id);
    setPaymentCompleted(true);

    // Clear cart after success if order type is order
    try {
      if (paymentDetails.orderType === "order" && customerId) {
        await clearCustomerCart(customerId);
      }
    } catch (e) {
      console.warn("Failed to clear cart after payment:", e);
    }

    // Redirect after a delay
    setTimeout(() => {
      navigate(paymentDetails.returnUrl || "/", {
        state: {
          paymentSuccess: true,
          paymentId: id,
          projectId: location.state.orderType === "advance" ? location.state.projectId : "",
          projectStatus: location.state.orderType === "advance" ? location.state.projectStatus : "",
        },
      });
    }, 3000);
  };

  if (paymentCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Your payment has been submitted and is pending verification by admin.</p>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-500">Reference ID: {paymentId}</p>
            <p className="text-sm text-gray-500">Amount: ${paymentDetails.amount.toFixed(2)}</p>
          </div>
          <p className="text-gray-500">You will be redirected automatically...</p>
          <button
            onClick={() => navigate(paymentDetails.returnUrl || "/")}
            className="mt-6 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-green-700 py-6 px-8">
          <h2 className="text-xl font-bold text-white">Complete Your Payment</h2>
          <p className="text-green-100 mt-1">Amount: ${paymentDetails.amount.toFixed(2)}</p>
        </div>

        <div className="p-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`pb-4 px-6 ${
                paymentMethod === "stripe" ? "border-b-2 border-green-500 text-green-600 font-medium" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setPaymentMethod("stripe")}
            >
              Credit Card
            </button>
            <button
              className={`pb-4 px-6 ${
                paymentMethod === "bank" ? "border-b-2 border-green-500 text-green-600 font-medium" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setPaymentMethod("bank")}
            >
              Bank Transfer
            </button>
          </div>

          <div className="mt-6">
            {paymentMethod === "stripe" ? (
              <Elements stripe={stripePromise}>
                <CardPaymentForm
                  amount={paymentDetails.amount}
                  orderId={paymentDetails.orderId}
                  orderType={paymentDetails.orderType}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            ) : (
              <BankSlipUpload
                amount={paymentDetails.amount}
                orderId={paymentDetails.orderId}
                orderType={paymentDetails.orderType}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </div>

          <div className="mt-8">
            <button onClick={() => navigate(-1)} className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel and go back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPortal;
