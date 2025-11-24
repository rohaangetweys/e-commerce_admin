'use client';
import React, { useState, useEffect } from 'react';
import { Product } from '@/utils/supabase/products';
import { Category } from '@/utils/supabase/categories';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: any) => void;
    product: Product | null;
    isLoading?: boolean;
    categories?: Category[];
}

const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    onSave,
    product,
    isLoading = false,
    categories = []
}) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        price: 0,
        compare_price: 0,
        free_shipping: false,
        free_gift: false,
        sku: '',
        category_id: '',
        brand: '',
        main_img_url: '',
        image_urls: [''],
        variant_type1_name: '',
        variant_type1_options: [''],
        variant_type2_name: '',
        variant_type2_options: [''],
        variant_prices: {},
        is_active: true,
        is_new: false,
        stock_quantity: 0
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                compare_price: product.compare_price || 0,
                free_shipping: product.free_shipping,
                free_gift: product.free_gift,
                sku: product.sku,
                category_id: product.category_id,
                brand: product.brand,
                main_img_url: product.main_img_url,
                image_urls: product.image_urls || [''],
                variant_type1_name: product.variant_type1_name || '',
                variant_type1_options: product.variant_type1_options || [''],
                variant_type2_name: product.variant_type2_name || '',
                variant_type2_options: product.variant_type2_options || [''],
                variant_prices: product.variant_prices || {},
                is_active: product.is_active,
                is_new: product.is_new,
                stock_quantity: product.stock_quantity
            });
        } else {
            setFormData({
                name: '',
                slug: '',
                description: '',
                price: 0,
                compare_price: 0,
                free_shipping: false,
                free_gift: false,
                sku: '',
                category_id: '',
                brand: '',
                main_img_url: '',
                image_urls: [''],
                variant_type1_name: '',
                variant_type1_options: [''],
                variant_type2_name: '',
                variant_type2_options: [''],
                variant_prices: {},
                is_active: true,
                is_new: false,
                stock_quantity: 0
            });
        }
    }, [product]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clean up empty strings from arrays
        const cleanedData = {
            ...formData,
            image_urls: formData.image_urls.filter(url => url.trim() !== ''),
            variant_type1_options: formData.variant_type1_options.filter(opt => opt.trim() !== ''),
            variant_type2_options: formData.variant_type2_options.filter(opt => opt.trim() !== '')
        };

        onSave(cleanedData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleArrayChange = (field: string, index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev as any)[field].map((item: string, i: number) =>
                i === index ? value : item
            )
        }));
    };

    const addArrayItem = (field: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev as any)[field], '']
        }));
    };

    const removeArrayItem = (field: string, index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev as any)[field].filter((_: string, i: number) => i !== index)
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product ? 'Edit Product' : 'Create New Product'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slug *
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Compare Price
                        </label>
                        <input
                            type="number"
                            name="compare_price"
                            value={formData.compare_price}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Stock Quantity *
                        </label>
                        <input
                            type="number"
                            name="stock_quantity"
                            value={formData.stock_quantity}
                            onChange={handleChange}
                            min="0"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            SKU *
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Brand
                        </label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                    </label>
                    <select
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Main Image URL *
                    </label>
                    <input
                        type="url"
                        name="main_img_url"
                        value={formData.main_img_url}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Image URLs
                    </label>
                    {formData.image_urls.map((url, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => handleArrayChange('image_urls', index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder={`Image URL ${index + 1}`}
                            />
                            {formData.image_urls.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeArrayItem('image_urls', index)}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('image_urls')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                        Add Image URL
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Active
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_new"
                            checked={formData.is_new}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            New Product
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="free_shipping"
                            checked={formData.free_shipping}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Free Shipping
                        </label>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="free_gift"
                            checked={formData.free_gift}
                            onChange={handleChange}
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Free Gift
                        </label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="success"
                        isLoading={isLoading}
                    >
                        {product ? 'Update' : 'Create'} Product
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductModal;