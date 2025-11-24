'use client';
import React from 'react';
import { Order } from '@/utils/supabase/orders';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
    onUpdateStatus: (order: Order, status: Order['status']) => void;
    isLoading?: boolean;
}

const OrderModal: React.FC<OrderModalProps> = ({
    isOpen,
    onClose,
    order,
    onUpdateStatus,
    isLoading = false
}) => {
    if (!order) return null;

    // Only 2 status options now
    const statusOptions: Order['status'][] = ['pending', 'completed'];

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusDisplay = (status: Order['status']) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'pending': return 'Pending';
            default: return status;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Order #${order.id.slice(0, 8)}`}
            size="lg"
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-700">Customer Information</h4>
                        <p className="text-sm text-gray-600">{order.email}</p>
                        <p className="text-sm text-gray-600">{order.phone || 'No phone'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700">Order Details</h4>
                        <p className="text-sm text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Status: 
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusDisplay(order.status)}
                            </span>
                        </p>
                        <p className="text-sm text-gray-600">Total: ${order.total.toFixed(2)}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Shipping Address</h4>
                    <p className="text-sm text-gray-600">
                        {order.shipping_first_name} {order.shipping_last_name}<br />
                        {order.shipping_address}<br />
                        {order.shipping_city}, {order.shipping_state} {order.shipping_zip}<br />
                        {order.shipping_country}
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Order Items</h4>
                    <div className="space-y-2">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                                    <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                                </div>
                                <p className="font-semibold">${(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Shipping:</span>
                        <span>${order.shipping_cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Tax:</span>
                        <span>${order.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Update Status</h4>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map(status => (
                            <button
                                key={status}
                                onClick={() => onUpdateStatus(order, status)}
                                disabled={isLoading || order.status === status}
                                className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
                                    order.status === status 
                                        ? getStatusColor(status) 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {getStatusDisplay(status)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default OrderModal;