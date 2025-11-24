import { FiUsers, FiShoppingBag, FiDollarSign, FiPlusCircle } from 'react-icons/fi';
import StatCard from '@/components/common/StatCard';
import Button from '@/components/common/Button';

const stats = [
    { title: 'Total Users', value: '2,847', icon: FiUsers, color: 'bg-blue-500' },
    { title: 'Total Products', value: '1,234', icon: FiShoppingBag, color: 'bg-green-500' },
    { title: 'Total Sales', value: '$45,231', icon: FiDollarSign, color: 'bg-purple-500' },
]

const recentActivities = [
    { user: 'John Doe', action: 'placed a new order', time: '2 min ago' },
    { user: 'Sarah Smith', action: 'registered new account', time: '5 min ago' },
    { user: 'Mike Johnson', action: 'purchased product', time: '10 min ago' },
    { user: 'Emily Davis', action: 'left a product review', time: '15 min ago' },
]

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Welcome back, Admin
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color}
                    />
                ))}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Quick Actions</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">Manage</p>
                        </div>
                        <div className="p-3 rounded-full bg-orange-500 text-white">
                            <FiPlusCircle size={24} />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <Button variant="primary" size="sm">Add Product</Button>
                        <Button variant="outline" size="sm">View Reports</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activities</h2>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <Button variant="success" size="lg">View Analytics</Button>
                        <Button variant="dark" size="lg">Manage Users</Button>
                        <Button variant="outline" size="lg">Product Inventory</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}