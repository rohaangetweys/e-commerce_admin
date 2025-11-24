'use client';
import React from 'react';
import { FiUsers, FiShoppingBag, FiFolder, FiDollarSign, FiPlus, FiBarChart2, FiSettings, FiTrendingUp } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { Order } from '@/utils/supabase/orders';

interface DashboardContentProps {
    stats: {
        users: number;
        products: number;
        categories: number;
        orders: number;
    };
    recentOrders: Order[];
    metrics: {
        totalRevenue: number;
        conversionRate: number;
        averageOrderValue: number;
        completedOrders: number;
    };
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
    stats, 
    recentOrders, 
    metrics 
}) => {
    const router = useRouter();

    const statCards = [
        {
            title: 'Total Users',
            value: stats.users,
            icon: FiUsers,
            color: 'bg-blue-500',
            route: '/users',
            description: 'Registered users'
        },
        {
            title: 'Total Products',
            value: stats.products,
            icon: FiShoppingBag,
            color: 'bg-green-500',
            route: '/products',
            description: 'Active products'
        },
        {
            title: 'Categories',
            value: stats.categories,
            icon: FiFolder,
            color: 'bg-purple-500',
            route: '/categories',
            description: 'Product categories'
        },
        {
            title: 'Total Orders',
            value: stats.orders,
            icon: FiDollarSign,
            color: 'bg-orange-500',
            route: '/sales',
            description: 'All-time orders'
        }
    ];

    const quickActions = [
        {
            label: 'Add New Product',
            icon: FiPlus,
            route: '/products',
            description: 'Create a new product listing'
        },
        {
            label: 'Manage Users',
            icon: FiUsers,
            route: '/users',
            description: 'View and manage users'
        }
    ];

    const handleCardClick = (route: string) => {
        router.push(route);
    };

    const handleQuickAction = (route: string) => {
        router.push(route);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusDisplay = (status: string) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'pending': return 'Pending';
            default: return status;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const pendingOrdersCount = recentOrders.filter(order => order.status === 'pending').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        {pendingOrdersCount > 0 
                            ? `${pendingOrdersCount} orders pending review` 
                            : 'All orders are processed'
                        }
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={card.title}
                            className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                            onClick={() => handleCardClick(card.route)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-2">
                                        {card.value.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                                </div>
                                <div className={`p-3 rounded-full ${card.color} text-white group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={24} />
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="text-xs text-gray-500 hover:text-blue-600 transition-colors">
                                    View details →
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                        <button 
                            onClick={() => handleCardClick('/sales')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            View All
                        </button>
                    </div>
                    
                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div 
                                    key={order.id} 
                                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/sales?order=${order.id}`)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-800">
                                                {order.email}
                                            </p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusDisplay(order.status)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-sm text-gray-500">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </span>
                                            <span className="font-semibold text-gray-800">
                                                {formatCurrency(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            <FiDollarSign size={48} className="mx-auto mb-3 text-gray-300" />
                            <p>No orders yet</p>
                            <p className="text-sm mt-1">Orders will appear here as they come in</p>
                        </div>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        {quickActions.map((action) => {
                            const ActionIcon = action.icon;
                            return (
                                <button
                                    key={action.label}
                                    onClick={() => handleQuickAction(action.route)}
                                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors">
                                            <ActionIcon size={18} className="text-gray-600 group-hover:text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{action.label}</p>
                                            <p className="text-sm text-gray-500">{action.description}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardContent;