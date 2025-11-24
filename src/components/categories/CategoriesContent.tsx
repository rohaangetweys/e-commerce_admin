'use client';
import React, { useState } from 'react';
import { Category, categoriesService } from '@/utils/supabase/categories';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import toast from 'react-hot-toast';
import CategoryModal from './CategoryModal';

interface CategoriesContentProps {
    initialCategories: Category[];
}

const CategoriesContent: React.FC<CategoriesContentProps> = ({ initialCategories }) => {
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [isLoading, setIsLoading] = useState(false);
    const [categoryModal, setCategoryModal] = useState<{ isOpen: boolean; category: Category | null }>({
        isOpen: false,
        category: null
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; category: Category | null }>({
        isOpen: false,
        category: null
    });

    const columns = [
        {
            key: 'name',
            header: 'Name',
        },
        {
            key: 'slug',
            header: 'Slug',
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
            key: 'sort_order',
            header: 'Sort Order',
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (value: string) => new Date(value).toLocaleDateString()
        }
    ];

    const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'created_at'>) => {
        setIsLoading(true);
        try {
            if (categoryModal.category) {
                // Update existing category
                const updatedCategory = await categoriesService.updateCategory(categoryModal.category.id, categoryData);
                setCategories(categories.map(cat =>
                    cat.id === updatedCategory.id ? updatedCategory : cat
                ));
                toast.success('Category updated successfully');
            } else {
                // Create new category
                const newCategory = await categoriesService.createCategory(categoryData);
                setCategories([newCategory, ...categories]);
                toast.success('Category created successfully');
            }
            setCategoryModal({ isOpen: false, category: null });
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (category: Category) => {
        setIsLoading(true);
        try {
            await categoriesService.toggleCategoryStatus(category.id, !category.is_active);
            setCategories(categories.map(cat =>
                cat.id === category.id ? { ...cat, is_active: !cat.is_active } : cat
            ));
            toast.success(`Category ${!category.is_active ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating category:', error);
            toast.error('Failed to update category status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.category) return;

        setIsLoading(true);
        try {
            await categoriesService.deleteCategory(deleteModal.category.id);
            setCategories(categories.filter(cat => cat.id !== deleteModal.category?.id));
            toast.success('Category deleted successfully');
            setDeleteModal({ isOpen: false, category: null });
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Categories Management</h1>
                <Button
                    variant="success"
                    onClick={() => setCategoryModal({ isOpen: true, category: null })}
                >
                    Add New Category
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={categories}
                onEdit={(category) => setCategoryModal({ isOpen: true, category })}
                onDelete={(category) => setDeleteModal({ isOpen: true, category })}
                isLoading={isLoading}
            />

            <CategoryModal
                isOpen={categoryModal.isOpen}
                onClose={() => setCategoryModal({ isOpen: false, category: null })}
                onSave={handleSaveCategory}
                category={categoryModal.category}
                isLoading={isLoading}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, category: null })}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete category "${deleteModal.category?.name}"? This action cannot be undone.`}
                confirmText="Delete Category"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

export default CategoriesContent;