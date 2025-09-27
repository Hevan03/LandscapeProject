import React, { useEffect, useState } from 'react';
import { BsBell, BsCheckCircle, BsExclamationTriangle, BsTruck, BsFileText } from 'react-icons/bs';
import { FaCreditCard, FaUserFriends } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationAsRead } from '../api/inventoryPaymentApi';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, payment, accident

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await getNotifications();
            setNotifications(response.data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.isRead);
            await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n._id)));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'payment_received':
                return <FaCreditCard className="text-green-600" />;
            case 'delivery_assigned':
                return <BsTruck className="text-blue-600" />;
            case 'accident_reported':
                return <BsExclamationTriangle className="text-red-600" />;
            default:
                return <BsBell className="text-gray-600" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'payment_received':
                return 'bg-green-100 border-green-300 text-green-800';
            case 'delivery_assigned':
                return 'bg-blue-100 border-blue-300 text-blue-800';
            case 'accident_reported':
                return 'bg-red-100 border-red-300 text-red-800';
            default:
                return 'bg-gray-100 border-gray-300 text-gray-800';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        if (filter === 'unread') return !notification.isRead;
        if (filter === 'payment') return notification.type === 'payment_received';
        if (filter === 'accident') return notification.type === 'accident_reported';
        return true;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen p-8 font-sans">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="loading loading-spinner loading-lg"></div>
                        <p className="mt-4 text-gray-600">Loading notifications...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                            <BsBell className="mr-3 text-blue-600" />
                            Notifications
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllAsRead}
                                className="btn btn-outline btn-sm"
                            >
                                <BsCheckCircle className="mr-2" />
                                Mark All Read
                            </button>
                        )}
                        <Link to="/Admin-dashboard" className="btn btn-success btn-sm">
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="tabs tabs-boxed mb-6">
                    <button 
                        className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All ({notifications.length})
                    </button>
                    <button 
                        className={`tab ${filter === 'unread' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button 
                        className={`tab ${filter === 'payment' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('payment')}
                    >
                        Payments
                    </button>
                    <button 
                        className={`tab ${filter === 'accident' ? 'tab-active' : ''}`}
                        onClick={() => setFilter('accident')}
                    >
                        Accidents
                    </button>
                </div>

                {/* Notifications List */}
                {filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                            <div 
                                key={notification._id} 
                                className={`alert ${notification.isRead ? 'alert-info' : getNotificationColor(notification.type)} shadow-lg`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold">{notification.message}</h3>
                                                <p className="text-sm opacity-70 mt-1">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <button 
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    Mark as Read
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <BsBell className="mx-auto text-6xl text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
                        </h3>
                        <p className="text-gray-500">
                            {filter === 'all' 
                                ? 'You\'ll see notifications here when customers make payments or report accidents.'
                                : `No ${filter} notifications found.`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
