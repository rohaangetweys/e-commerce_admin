'use client';
import React, { useState, useEffect } from 'react';
import { Product, productsService } from '@/utils/supabase/products';
import { Category, categoriesService } from '@/utils/supabase/categories';
import DataTable from '@/components/common/DataTable';
import Button from '@/components/common/Button';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import toast from 'react-hot-toast';
import ProductModal from './ProductModal';

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

    const columns = [
        {
            key: 'name',
            header: 'Name',
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

            <DataTable
                columns={columns}
                data={products}
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