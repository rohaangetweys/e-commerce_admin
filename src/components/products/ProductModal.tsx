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

interface FormData {
    name: string;
    slug: string;
    description: string;
    price: number;
    compare_price: number;
    free_shipping: boolean;
    free_gift: boolean;
    sku: string;
    category_id: string;
    brand: string;
    main_img_url: string;
    image_urls: string[];
    variant_type1_name: string;
    variant_type1_options: string[];
    variant_type2_name: string;
    variant_type2_options: string[];
    variant_prices: Record<string, number>;
    is_active: boolean;
    is_new: boolean;
    stock_quantity: number;
}

const initialFormData: FormData = {
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
};

const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    onSave,
    product,
    isLoading = false,
    categories = []
}) => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [variantPrices, setVariantPrices] = useState<Record<string, number>>({});

    useEffect(() => {
        if (product) {
            const productData = {
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
            };
            setFormData(productData);
            setVariantPrices(product.variant_prices || {});
        } else {
            setFormData(initialFormData);
            setVariantPrices({});
        }
    }, [product]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const cleanedData = {
            ...formData,
            image_urls: formData.image_urls.filter(url => url.trim() !== ''),
            variant_type1_options: formData.variant_type1_options.filter(opt => opt.trim() !== ''),
            variant_type2_options: formData.variant_type2_options.filter(opt => opt.trim() !== ''),
            variant_prices: variantPrices
        };

        onSave(cleanedData);
    };

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: 'image_urls' | 'variant_type1_options' | 'variant_type2_options', index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleVariantPriceChange = (variant: string, price: number) => {
        setVariantPrices(prev => ({
            ...prev,
            [variant]: price
        }));
    };

    const addArrayItem = (field: 'image_urls' | 'variant_type1_options' | 'variant_type2_options') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field: 'image_urls' | 'variant_type1_options' | 'variant_type2_options', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product ? 'Edit Product' : 'Create New Product'}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => handleChange('slug', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={3}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                                    step="0.01"
                                    min="0"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price</label>
                                <input
                                    type="number"
                                    value={formData.compare_price}
                                    onChange={(e) => handleChange('compare_price', parseFloat(e.target.value))}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                                <input
                                    type="text"
                                    value={formData.sku}
                                    onChange={(e) => handleChange('sku', e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                                <input
                                    type="number"
                                    value={formData.stock_quantity}
                                    onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value))}
                                    min="0"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                            <input
                                type="text"
                                value={formData.brand}
                                onChange={(e) => handleChange('brand', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                            <select
                                value={formData.category_id}
                                onChange={(e) => handleChange('category_id', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Media & Settings</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL *</label>
                            <input
                                type="url"
                                value={formData.main_img_url}
                                onChange={(e) => handleChange('main_img_url', e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Image URLs</label>
                            {formData.image_urls.map((url, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => handleArrayChange('image_urls', index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Image URL"
                                    />
                                    {formData.image_urls.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('image_urls', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('image_urls')}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            >
                                Add Image URL
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Active</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_new}
                                    onChange={(e) => handleChange('is_new', e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">New Product</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.free_shipping}
                                    onChange={(e) => handleChange('free_shipping', e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Free Shipping</span>
                            </label>

                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.free_gift}
                                    onChange={(e) => handleChange('free_gift', e.target.checked)}
                                    className="h-4 w-4 text-green-600 focus:ring-green-500"
                                />
                                <span className="text-sm text-gray-700">Free Gift</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Variants</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Variant Type 1 Name</label>
                            <input
                                type="text"
                                value={formData.variant_type1_name}
                                onChange={(e) => handleChange('variant_type1_name', e.target.value)}
                                placeholder="e.g., Size, Color"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            
                            <label className="block text-sm font-medium text-gray-700">Variant Options</label>
                            {formData.variant_type1_options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleArrayChange('variant_type1_options', index, e.target.value)}
                                        placeholder="Option name"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <input
                                        type="number"
                                        value={variantPrices[option] || formData.price}
                                        onChange={(e) => handleVariantPriceChange(option, parseFloat(e.target.value))}
                                        placeholder="Price"
                                        step="0.01"
                                        min="0"
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    {formData.variant_type1_options.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('variant_type1_options', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('variant_type1_options')}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            >
                                Add Option
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Variant Type 2 Name</label>
                            <input
                                type="text"
                                value={formData.variant_type2_name}
                                onChange={(e) => handleChange('variant_type2_name', e.target.value)}
                                placeholder="e.g., Size, Color"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            
                            <label className="block text-sm font-medium text-gray-700">Variant Options</label>
                            {formData.variant_type2_options.map((option, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleArrayChange('variant_type2_options', index, e.target.value)}
                                        placeholder="Option name"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <input
                                        type="number"
                                        value={variantPrices[option] || formData.price}
                                        onChange={(e) => handleVariantPriceChange(option, parseFloat(e.target.value))}
                                        placeholder="Price"
                                        step="0.01"
                                        min="0"
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    {formData.variant_type2_options.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('variant_type2_options', index)}
                                            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('variant_type2_options')}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
                            >
                                Add Option
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
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