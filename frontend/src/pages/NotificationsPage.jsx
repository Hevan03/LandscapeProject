import React, { useEffect, useState } from "react";

const NotificationCard = ({ notification, onDelete }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-primary">
    <div className="flex justify-between items-start mb-3">
      <span className="text-sm text-gray-500">
        {new Date(notification.createdAt).toLocaleString()}
      </span>
      <button
        onClick={() => onDelete(notification._id)}
        className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors"
        aria-label="Delete notification"
      >
        ×
      </button>
    </div>
    <p className="text-gray-800 leading-relaxed">{notification.message}</p>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">📫</div>
    <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Notifications Yet</h3>
    <p className="text-gray-500">New notifications will appear here</p>
  </div>
);

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications. Please try again later.');
      console.error("Error fetching notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    try {
      setIsSending(true);
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() })
      });

      if (!response.ok) throw new Error('Failed to send notification');
      
      const newNotif = await response.json();
      setNotifications([newNotif, ...notifications]);
      setMessage("");
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError('Failed to send notification. Please try again.');
      console.error("Error sending notification:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return;

    try {
      const response = await fetch(`/api/notifications/${id}`, { 
        method: "DELETE" 
      });
      
      if (!response.ok) throw new Error('Failed to delete notification');
      
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (err) {
      setError('Failed to delete notification. Please try again.');
      console.error("Error deleting notification:", err);
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">Notifications</h1>
        <button
          onClick={handleRefresh}
          className="btn btn-outline"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Send Notification Form */}
      <div className="card p-6 mb-8">
        <h2 className="text-2xl font-semibold text-primary mb-4">Send Notification</h2>
        
        {showSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Notification sent successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows="4"
              placeholder="Enter your notification message..."
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-primary mb-4">
          Recent Notifications ({notifications.length})
        </h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;