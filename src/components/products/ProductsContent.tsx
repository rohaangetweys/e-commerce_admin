'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { Product, productsService } from '@/utils/supabase/products';
import { Category, categoriesService } from '@/utils/supabase/categories';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import ProductModal from '@/components/products/ProductModal';
import { FiSearch, FiFilter, FiX, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ProductsContentProps {
    initialProducts: Product[];
}

const ProductsContent: React.FC<ProductsContentProps> = ({ initialProducts }) => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [productModal, setProductModal] = useState<{ isOpen: boolean; product: Product | null }>({
        isOpen: false,
        product: null
    });
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; product: Product | null }>({
        isOpen: false,
        product: null
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesData = await categoriesService.getCategories();
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching categories:', error);
                toast.error('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.brand?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' && product.is_active) ||
                (statusFilter === 'inactive' && !product.is_active);

            const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;

            const matchesStock = stockFilter === 'all' ||
                (stockFilter === 'in-stock' && product.stock_quantity > 0) ||
                (stockFilter === 'out-of-stock' && product.stock_quantity === 0);

            return matchesSearch && matchesStatus && matchesCategory && matchesStock;
        });
    }, [products, searchTerm, statusFilter, categoryFilter, stockFilter]);

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setStockFilter('all');
    };

    const getStockStatus = (quantity: number) => {
        if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
    };

    const columns = [
        {
            key: 'main_img_url',
            header: 'Image',
            render: (value: string, row: Product) => (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {value ? (
                        <img
                            src={value}
                            alt={row.name}
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
            key: 'sku',
            header: 'SKU',
        },
        {
            key: 'category',
            header: 'Category',
            render: (value: any, row: Product) => row.category?.name || 'No Category'
        },
        {
            key: 'price',
            header: 'Price',
            render: (value: number) => `$${value.toFixed(2)}`
        },
        {
            key: 'stock_quantity',
            header: 'Stock',
            render: (value: number, row: Product) => {
                const stockStatus = getStockStatus(value);
                return (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">{value}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                            {stockStatus.text}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'is_active',
            header: 'Status',
            render: (value: boolean, row: Product) => (
                <button
                    onClick={() => handleToggleStatus(row)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${value
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                >
                    {value ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                    {value ? 'Active' : 'Inactive'}
                </button>
            )
        },
        {
            key: 'variants',
            header: 'Variants',
            render: (value: any, row: Product) => (
                <div className="text-xs text-gray-600">
                    {row.variant_type1_name && (
                        <div>{row.variant_type1_name}: {row.variant_type1_options?.length || 0}</div>
                    )}
                    {row.variant_type2_name && (
                        <div>{row.variant_type2_name}: {row.variant_type2_options?.length || 0}</div>
                    )}
                    {!row.variant_type1_name && !row.variant_type2_name && 'No variants'}
                </div>
            )
        },
        {
            key: 'created_at',
            header: 'Created At',
            render: (value: string) => new Date(value).toLocaleDateString()
        }
    ];

    const handleSaveProduct = async (productData: any) => {
        setIsLoading(true);
        try {
            if (productModal.product) {
                const updatedProduct = await productsService.updateProduct(productModal.product.id, productData);
                setProducts(products.map(prod =>
                    prod.id === updatedProduct.id ? updatedProduct : prod
                ));
                toast.success('Product updated successfully');
            } else {
                const newProduct = await productsService.createProduct(productData);
                setProducts([newProduct, ...products]);
                toast.success('Product created successfully');
            }
            setProductModal({ isOpen: false, product: null });
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Failed to save product');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        setIsLoading(true);
        try {
            await productsService.toggleProductStatus(product.id, !product.is_active);
            setProducts(products.map(prod =>
                prod.id === product.id ? { ...prod, is_active: !prod.is_active } : prod
            ));
            toast.success(`Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error('Failed to update product status');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.product) return;

        setIsLoading(true);
        try {
            await productsService.deleteProduct(deleteModal.product.id);
            setProducts(products.filter(prod => prod.id !== deleteModal.product?.id));
            toast.success('Product deleted successfully');
            setDeleteModal({ isOpen: false, product: null });
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        } finally {
            setIsLoading(false);
        }
    };

    const activeFiltersCount = (searchTerm ? 1 : 0) +
        (statusFilter !== 'all' ? 1 : 0) +
        (categoryFilter !== 'all' ? 1 : 0) +
        (stockFilter !== 'all' ? 1 : 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
                <Button
                    variant="success"
                    onClick={() => setProductModal({ isOpen: true, product: null })}
                >
                    Add New Product
                </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products by name, SKU, or brand..."
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

                    {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || stockFilter !== 'all') && (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock Status
                                </label>
                                <select
                                    value={stockFilter}
                                    onChange={(e) => setStockFilter(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                    <option value="all">All Stock</option>
                                    <option value="in-stock">In Stock</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Showing {filteredProducts.length} of {products.length} products
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
                data={filteredProducts}
                onEdit={(product) => setProductModal({ isOpen: true, product })}
                onDelete={(product) => setDeleteModal({ isOpen: true, product })}
                isLoading={isLoading}
            />

            <ProductModal
                isOpen={productModal.isOpen}
                onClose={() => setProductModal({ isOpen: false, product: null })}
                onSave={handleSaveProduct}
                product={productModal.product}
                categories={categories}
                isLoading={isLoading}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, product: null })}
                onConfirm={handleDelete}
                title="Delete Product"
                message={`Are you sure you want to delete product "${deleteModal.product?.name}"? This action cannot be undone.`}
                confirmText="Delete Product"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
};

export default ProductsContent;