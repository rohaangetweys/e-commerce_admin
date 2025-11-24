'use client';
import React, { useState } from 'react';
import { Order, ordersService } from '@/utils/supabase/orders';
import DataTable from '@/components/common/DataTable';
import OrderModal from '@/components/sales/OrderModal';
import toast from 'react-hot-toast';

interface SalesContentProps {
    initialOrders: Order[];
}

const SalesContent: React.FC<SalesContentProps> = ({ initialOrders }) => {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isLoading, setIsLoading] = useState(false);
    const [orderModal, setOrderModal] = useState<{ isOpen: boolean; order: Order | null }>({
        isOpen: false,
        order: null
    });

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

    const columns = [
        {
            key: 'id',
            header: 'Order ID',
            render: (value: string) => value.slice(0, 8) + '...'
        },
        {
            key: 'email',
            header: 'Customer Email',
        },
        {
            key: 'total',
            header: 'Total',
            render: (value: number) => `$${value.toFixed(2)}`
        },
        {
            key: 'status',
            header: 'Status',
            render: (value: Order['status']) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                    {getStatusDisplay(value)}
                </span>
            )
        },
        {
            key: 'created_at',
            header: 'Order Date',
            render: (value: string) => new Date(value).toLocaleDateString()
        }
    ];

    const handleUpdateStatus = async (order: Order, newStatus: Order['status']) => {
        const updatedOrder = { ...order, status: newStatus };
        setOrders(prevOrders => 
            prevOrders.map(o => o.id === order.id ? updatedOrder : o)
        );
        
        if (orderModal.order && orderModal.order.id === order.id) {
            setOrderModal({ isOpen: true, order: updatedOrder });
        }

        setIsLoading(true);
        try {
            await ordersService.updateOrderStatus(order.id, newStatus);
            toast.success(`Order status updated to ${getStatusDisplay(newStatus)}`);
        } catch (error: any) {
            console.error('Error updating order:', error);
            
            setOrders(prevOrders => 
                prevOrders.map(o => o.id === order.id ? order : o)
            );
            
            if (orderModal.order && orderModal.order.id === order.id) {
                setOrderModal({ isOpen: true, order });
            }
            
            toast.error('Failed to update order status');
        } finally {
            setIsLoading(false);
        }
    };

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders
        .filter(o => o.status === 'completed')
        .reduce((sum, order) => sum + order.total, 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Sales & Orders</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-sm text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-sm text-gray-600">Completed Orders</p>
                    <p className="text-2xl font-bold text-green-600">{completedOrders}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                onView={(order) => setOrderModal({ isOpen: true, order })}
                isLoading={isLoading}
            />

            <OrderModal
                isOpen={orderModal.isOpen}
                onClose={() => setOrderModal({ isOpen: false, order: null })}
                order={orderModal.order}
                onUpdateStatus={handleUpdateStatus}
                isLoading={isLoading}
            />
        </div>
    );
};

export default SalesContent;