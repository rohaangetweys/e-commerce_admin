'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Category, categoriesService } from '@/utils/supabase/categories';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { FiUpload, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Omit<Category, 'id' | 'created_at'>) => void;
    category: Category | null;
    isLoading?: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
    isOpen,
    onClose,
    onSave,
    category,
    isLoading = false
}) => {
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        image_url: '',
        is_active: true,
        sort_order: 0
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                slug: category.slug,
                description: category.description || '',
                image_url: category.image_url,
                is_active: category.is_active,
                sort_order: category.sort_order
            });
            setImagePreview(category.image_url);
        } else {
            setFormData({
                name: '',
                slug: '',
                description: '',
                image_url: '',
                is_active: true,
                sort_order: 0
            });
            setImagePreview('');
            setImageFile(null);
        }
    }, [category]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isUploading) {
            toast.error('Please wait for image upload to complete');
            return;
        }

        let finalImageUrl = formData.image_url;

        if (imageFile) {
            setIsUploading(true);
            try {
                finalImageUrl = await categoriesService.uploadImage(imageFile);
                setFormData(prev => ({ ...prev, image_url: finalImageUrl }));
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image');
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        onSave({ ...formData, image_url: finalImageUrl });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                type === 'number' ? parseInt(value) : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        setImageFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (!category) {
            setFormData(prev => ({ ...prev, image_url: '' }));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            const event = ({
                target: {
                    files: [file]
                }
            } as unknown) as React.ChangeEvent<HTMLInputElement>;
            handleImageChange(event);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={category ? 'Edit Category' : 'Create New Category'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABA1A] focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABA1A] focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABA1A] focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Image
                    </label>
                    
                    {imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-gray-300"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                                <FiX size={16} />
                            </button>
                        </div>
                    ) : (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <FiImage className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm text-gray-600 mb-2">
                                Drag & drop an image here, or click to select
                            </p>
                            <p className="text-xs text-gray-500">
                                Supports: JPG, PNG, WebP • Max: 5MB
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                    )}

                    {!imagePreview && formData.image_url && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                            <img
                                src={formData.image_url}
                                alt="Current"
                                className="w-full h-32 object-cover rounded-lg border"
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sort Order
                        </label>
                        <input
                            type="number"
                            name="sort_order"
                            value={formData.sort_order}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABA1A] focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#1ABA1A] focus:ring-[#1ABA1A] border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Active
                        </label>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
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
                        {category ? 'Update' : 'Create'} Category
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CategoryModal;