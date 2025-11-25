'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Product, productsService } from '@/utils/supabase/products';
import { Category } from '@/utils/supabase/categories';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { FiUpload, FiX, FiImage, FiPlus, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

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
    image_urls: [],
    variant_type1_name: '',
    variant_type1_options: [],
    variant_type2_name: '',
    variant_type2_options: [],
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
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [additionalImages, setAdditionalImages] = useState<{ file: File | null; preview: string; url: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const mainImageInputRef = useRef<HTMLInputElement>(null);
    const additionalImagesInputRef = useRef<HTMLInputElement>(null);

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
                image_urls: product.image_urls || [],
                variant_type1_name: product.variant_type1_name || '',
                variant_type1_options: product.variant_type1_options || [],
                variant_type2_name: product.variant_type2_name || '',
                variant_type2_options: product.variant_type2_options || [],
                variant_prices: product.variant_prices || {},
                is_active: product.is_active,
                is_new: product.is_new,
                stock_quantity: product.stock_quantity
            };
            setFormData(productData);
            setVariantPrices(product.variant_prices || {});
            setMainImagePreview(product.main_img_url);
            
            const additionalImagesData = product.image_urls?.map(url => ({
                file: null,
                preview: url,
                url: url
            })) || [];
            setAdditionalImages(additionalImagesData);
        } else {
            setFormData(initialFormData);
            setVariantPrices({});
            setMainImageFile(null);
            setMainImagePreview('');
            setAdditionalImages([]);
        }
    }, [product]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isUploading) {
            toast.error('Please wait for image uploads to complete');
            return;
        }

        setIsUploading(true);

        try {
            let finalMainImageUrl = formData.main_img_url;

            if (mainImageFile) {
                finalMainImageUrl = await productsService.uploadImage(mainImageFile, 'main');
                setFormData(prev => ({ ...prev, main_img_url: finalMainImageUrl }));
            }

            const finalAdditionalUrls: string[] = [];
            
            for (const img of additionalImages) {
                if (img.file) {
                    const url = await productsService.uploadImage(img.file, 'additional');
                    finalAdditionalUrls.push(url);
                } else if (img.url) {
                    finalAdditionalUrls.push(img.url);
                }
            }

            const cleanedData = {
                ...formData,
                main_img_url: finalMainImageUrl,
                image_urls: finalAdditionalUrls.filter(url => url.trim() !== ''),
                variant_type1_options: formData.variant_type1_options.filter(opt => opt.trim() !== ''),
                variant_type2_options: formData.variant_type2_options.filter(opt => opt.trim() !== ''),
                variant_prices: variantPrices
            };

            onSave(cleanedData);
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images');
        } finally {
            setIsUploading(false);
        }
    };

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field: 'variant_type1_options' | 'variant_type2_options', index: number, value: string) => {
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

    const addArrayItem = (field: 'variant_type1_options' | 'variant_type2_options') => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field: 'variant_type1_options' | 'variant_type2_options', index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        setMainImageFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setMainImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select image files only');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setAdditionalImages(prev => [...prev, {
                    file,
                    preview: e.target?.result as string,
                    url: ''
                }]);
            };
            reader.readAsDataURL(file);
        });

        if (additionalImagesInputRef.current) {
            additionalImagesInputRef.current.value = '';
        }
    };

    const removeMainImage = () => {
        setMainImageFile(null);
        setMainImagePreview('');
        if (mainImageInputRef.current) {
            mainImageInputRef.current.value = '';
        }
        if (!product) {
            setFormData(prev => ({ ...prev, main_img_url: '' }));
        }
    };

    const removeAdditionalImage = (index: number) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'main' | 'additional') => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            if (type === 'main') {
                const event = ({
                    target: {
                        files: [file]
                    }
                } as unknown) as React.ChangeEvent<HTMLInputElement>;
                handleMainImageChange(event);
            } else {
                const event = ({
                    target: {
                        files: [file]
                    }
                } as unknown) as React.ChangeEvent<HTMLInputElement>;
                handleAdditionalImagesChange(event);
            }
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
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
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Product Images</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Main Image *</label>
                            {mainImagePreview ? (
                                <div className="relative">
                                    <img
                                        src={mainImagePreview}
                                        alt="Main preview"
                                        className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeMainImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onDrop={(e) => handleDrop(e, 'main')}
                                    onDragOver={handleDragOver}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                    onClick={() => mainImageInputRef.current?.click()}
                                >
                                    <FiImage className="mx-auto text-gray-400 mb-2" size={32} />
                                    <p className="text-sm text-gray-600 mb-2">
                                        Drag & drop main image here, or click to select
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Supports: JPG, PNG, WebP • Max: 5MB
                                    </p>
                                    <input
                                        ref={mainImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImageChange}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {additionalImages.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={img.preview}
                                            alt={`Additional ${index + 1}`}
                                            className="w-full h-24 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAdditionalImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <FiTrash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <div
                                onDrop={(e) => handleDrop(e, 'additional')}
                                onDragOver={handleDragOver}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                                onClick={() => additionalImagesInputRef.current?.click()}
                            >
                                <FiPlus className="mx-auto text-gray-400 mb-1" size={20} />
                                <p className="text-sm text-gray-600">Add more images</p>
                                <input
                                    ref={additionalImagesInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAdditionalImagesChange}
                                    className="hidden"
                                />
                            </div>
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
                        disabled={isLoading || isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="success"
                        isLoading={isLoading || isUploading}
                    >
                        {product ? 'Update' : 'Create'} Product
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default ProductModal;