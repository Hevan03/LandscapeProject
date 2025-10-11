import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getOrderForPayment, createInventoryPayment } from '../api/itemPayApi';

const useInventoryPayments = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const customerId = searchParams.get('customerId');
    const totalAmount = searchParams.get('totalAmount');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bankSlip, setBankSlip] = useState(null);
    const [notes, setNotes] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [optionalContactNumber, setOptionalContactNumber] = useState('');
    const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [contactNumberError, setContactNumberError] = useState('');

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await getOrderForPayment(orderId);
                setOrder(response.data);
            } catch (error) {
                console.error('Error fetching order:', error);
                if (orderId.startsWith('test')) {
                    console.log('Using test order data');
                    setOrder({
                        _id: orderId,
                        customerId: { name: 'Test Customer' },
                        items: [
                            {
                                itemName: 'Test Item',
                                pricePerItem: parseFloat(totalAmount) || 1000,
                                quantity: 1,
                                totalPrice: parseFloat(totalAmount) || 1000
                            }
                        ],
                        totalAmount: parseFloat(totalAmount) || 1000
                    });
                } else {
                    toast.error('Failed to load order details');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, totalAmount]);

    const handleContactNumberChange = (e) => {
        const value = e.target.value;
        const onlyDigits = value.replace(/\D/g, '');
        setContactNumber(onlyDigits);
        
        if (onlyDigits.length > 10) {
            setContactNumberError('Contact number cannot exceed 10 digits.');
        } else if (value !== onlyDigits) {
            setContactNumberError('Contact number can only contain digits.');
        } else {
            setContactNumberError('');
        }
    };

    const handleFileUpload = (e) => {
        setBankSlip(e.target.files[0]);
    };

    const handleSubmitPayment = async (e) => {
        e.preventDefault();

        // Check for validations
        if (contactNumber.length !== 10) {
            toast.error("Please enter a valid 10-digit contact number.");
            return;
        }
        if (!bankSlip) {
            toast.error("Please upload a bank slip to confirm your payment.");
            return;
        }
        if (!customerAddress.trim() || !customerName.trim()) {
            toast.error("Please fill in all required customer details.");
            return;
        }

        try {
            const paymentData = {
                orderId: orderId.startsWith('test') ? '507f1f77bcf86cd799439011' : orderId,
                customerId: customerId.startsWith('test') ? '507f1f77bcf86cd799439012' : customerId,
                amount: order?.totalAmount || parseFloat(totalAmount),
                method: 'BankSlip',
                bankSlipUrl: bankSlip.name,
                notes,
                customerAddress,
                customerName,
                contactNumber,
                optionalContactNumber
            };

            await createInventoryPayment(paymentData);
            toast.success('Payment submitted successfully! Awaiting admin confirmation.');
            setIsPaymentConfirmed(true);
            setIsReceiptModalOpen(true);
        } catch (error) {
            console.error('Error submitting payment:', error);
            toast.error('Failed to submit payment. Please try again.');
        }
    };

    const displayOrder = order || {
        items: [],
        totalAmount: parseFloat(totalAmount) || 0,
        customerId: { name: 'Customer' }
    };

    return {
        loading,
        orderId,
        customerId,
        displayOrder,
        customerName,
        setCustomerName,
        customerAddress,
        setCustomerAddress,
        contactNumber,
        handleContactNumberChange,
        contactNumberError,
        optionalContactNumber,
        setOptionalContactNumber,
        bankSlip,
        handleFileUpload,
        notes,
        setNotes,
        handleSubmitPayment,
        isPaymentConfirmed,
        isReceiptModalOpen,
        setIsReceiptModalOpen
    };
};

export default useInventoryPayments;