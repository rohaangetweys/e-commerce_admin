'use client';
import React, { useState } from 'react';
import { User, usersService } from '@/utils/supabase/users';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import toast from 'react-hot-toast';

interface UsersContentProps {
    initialUsers: User[];
}

const UsersContent: React.FC<UsersContentProps> = ({ initialUsers }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
        isOpen: false,
        user: null
    });

    const columns = [
        {
            key: 'email',
            header: 'Email',
        },
        {
            key: 'full_name',
            header: 'Full Name',
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (value: boolean) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${value
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {value ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (value: string) => new Date(value).toLocaleDateString()
        }
    ];

    const handleToggleStatus = async (user: User) => {
        setIsLoading(true);
        try {
            await usersService.toggleUserStatus(user.id, !user.is_active);
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, is_active: !u.is_active } : u
            ));
            toast.success(`User ${!user.is_active ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user status');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
                <Button variant="success" routeTo="/users/new">
                    Add New User
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={users}
                onEdit={(user) => handleToggleStatus(user)}
                isLoading={isLoading}
            />
        </div>
    );
};

export default UsersContent;