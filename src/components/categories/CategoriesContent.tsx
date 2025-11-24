'use client';
import React, { useState, useMemo } from 'react';
import { Category, categoriesService } from '@/utils/supabase/categories';
import { productsService } from '@/utils/supabase/products';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import CategoryModal from '@/components/categories/CategoryModal';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

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

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [showFilters, setShowFilters] = useState(false);

    // Filter categories based on search and status
    const filteredCategories = useMemo(() => {
        return categories.filter(category => {
            const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                category.slug.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || 
                                (statusFilter === 'active' && category.is_active) ||
                                (statusFilter === 'inactive' && !category.is_active);
            
            return matchesSearch && matchesStatus;
        });
    }, [categories, searchTerm, statusFilter]);

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
    };

    const columns = [
        {
            key: 'image_url',
            header: 'Image',
            render: (value: string) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {value ? (
                        <img 
                            src={value} 
                            alt="Category" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/api/placeholder/48/48';
                            }}
                        />
                    ) : (
                        <FiX className="text-gray-400" size={20} />
                    )}
                </div>
            )
        },
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value 
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
            // First, check if there are products in this category
            const productsInCategory = await productsService.getProductsByCategory(deleteModal.category.id);
            
            if (productsInCategory.length > 0) {
                // Show error and don't delete
                toast.error(`Cannot delete category. There are ${productsInCategory.length} products in this category.`);
                setDeleteModal({ isOpen: false, category: null });
                return;
            }

            // If no products, delete the category
            await categoriesService.deleteCategory(deleteModal.category.id);
            setCategories(categories.filter(cat => cat.id !== deleteModal.category?.id));
            toast.success('Category deleted successfully');
            setDeleteModal({ isOpen: false, category: null });
        } catch (error: any) {
            console.error('Error deleting category:', error);
            
            if (error.code === '23503') {
                toast.error('Cannot delete category. There are products associated with it.');
            } else {
                toast.error('Failed to delete category');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const activeFiltersCount = (searchTerm ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

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

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search categories by name or slug..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <FiFilter size={16} />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="bg-green-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>

                    {(searchTerm || statusFilter !== 'all') && (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="flex items-center gap-2"
                        >
                            <FiX size={16} />
                            Clear
                        </Button>
                    )}
                </div>

                {showFilters && (
                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Showing {filteredCategories.length} of {categories.length} categories
                    </p>
                    {searchTerm && (
                        <p className="text-sm text-gray-500">
                            Search: "{searchTerm}"
                        </p>
                    )}
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredCategories}
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
                message={
                    deleteModal.category ? 
                    `Are you sure you want to delete category "${deleteModal.category.name}"? This action will check for associated products and may not be possible if products exist in this category.` 
                    : ''
                }
                confirmText="Delete Category"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

export default CategoriesContent;