'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    FiHome,
    FiUsers,
    FiShoppingBag,
    FiDollarSign,
    FiBarChart2,
    FiSettings,
    FiPlusCircle,
    FiLogOut,
    FiFolder
} from 'react-icons/fi'

const menuItems = [
    { href: '/', icon: FiHome, label: 'Dashboard' },
    { href: '/users', icon: FiUsers, label: 'Users' },
    { href: '/categories', icon: FiFolder, label: 'Categories' },
    { href: '/products', icon: FiShoppingBag, label: 'Products' },
    { href: '/sales', icon: FiDollarSign, label: 'Sales' },
]

export default function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="w-64 bg-white shadow-lg flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            </div>

            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-[#1ABA1A] text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="p-4 border-t border-gray-200">
                <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full">
                    <FiLogOut size={20} />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}