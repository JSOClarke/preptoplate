import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import type { Meal } from '../types/menu';
import { api } from '../lib/api';

interface MealFormModalProps {
    isOpen: boolean;
    meal: Meal | null; // null = create mode, Meal = edit mode
    onSave: (mealData: MealFormData) => Promise<boolean>;
    onCancel: () => void;
    loading?: boolean;
}

export interface MealFormData {
    name: string;
    description: string;
    image_url: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number; // in cents
}

export default function MealFormModal({
    isOpen,
    meal,
    onSave,
    onCancel,
    loading = false,
}: MealFormModalProps) {
    const [formData, setFormData] = useState<MealFormData>({
        name: '',
        description: '',
        image_url: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        price: 0,
    });
    const [uploading, setUploading] = useState(false);

    // Initialize form with meal data when editing
    useEffect(() => {
        if (meal) {
            setFormData({
                name: meal.name,
                description: meal.description,
                image_url: meal.image_url || '',
                calories: meal.calories || 0,
                protein: meal.protein || 0,
                carbs: meal.carbs || 0,
                fat: meal.fat || 0,
                price: meal.price || 0,
            });
        } else {
            // Reset form for create mode
            setFormData({
                name: '',
                description: '',
                image_url: '',
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                price: 0,
            });
        }
    }, [meal, isOpen]);

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const data = new FormData();
            data.append('file', file);

            const response = await api.upload<{ url: string }>('/upload', data);
            setFormData(prev => ({ ...prev, image_url: response.url }));
        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const success = await onSave(formData);
        if (success) {
            onCancel(); // Close modal on success
        }
    };

    // ESC key to close
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onCancel();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const isEditMode = !!meal;

    // Helper to convert cents to dollars for display
    const priceInDollars = formData.price / 100;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white border border-black p-8 max-w-2xl w-full mx-4 my-8">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
                >
                    <X size={20} strokeWidth={1.5} />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-normal uppercase tracking-wide mb-8">
                    {isEditMode ? 'Edit Meal' : 'Create New Meal'}
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-xs font-light uppercase tracking-wide mb-2">
                            Name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="e.g., Grilled Chicken Bowl"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-xs font-light uppercase tracking-wide mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black resize-none"
                            placeholder="Brief description of the meal..."
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-xs font-light uppercase tracking-wide mb-2">
                            Meal Image
                        </label>
                        <div className="flex items-start gap-4">
                            {/* Preview */}
                            <div className="w-32 h-32 border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                ) : formData.image_url ? (
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-gray-300 text-xs text-center px-2">No image</div>
                                )}
                            </div>

                            {/* Upload Button */}
                            <div className="flex-1">
                                <label
                                    htmlFor="image-upload"
                                    className={`flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-black cursor-pointer hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Upload size={16} />
                                    <span className="text-sm font-light uppercase">
                                        {uploading ? 'Uploading...' : 'Upload Photo'}
                                    </span>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                                <p className="mt-2 text-xs text-gray-500 font-light">
                                    Recommended: Square JPG or PNG, max 5MB.
                                </p>
                                {formData.image_url && (
                                    <p className="mt-1 text-xs text-green-600 font-light truncate">
                                        ✓ Image uploaded successfully
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="block text-xs font-light uppercase tracking-wide mb-2">
                            Price (USD) *
                        </label>
                        <input
                            id="price"
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={priceInDollars}
                            onChange={(e) => setFormData({ ...formData, price: Math.round(parseFloat(e.target.value) * 100) })}
                            className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                            placeholder="12.99"
                        />
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="calories" className="block text-xs font-light uppercase tracking-wide mb-2">
                                Calories
                            </label>
                            <input
                                id="calories"
                                type="number"
                                min="0"
                                value={formData.calories}
                                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="500"
                            />
                        </div>
                        <div>
                            <label htmlFor="protein" className="block text-xs font-light uppercase tracking-wide mb-2">
                                Protein (g)
                            </label>
                            <input
                                id="protein"
                                type="number"
                                min="0"
                                value={formData.protein}
                                onChange={(e) => setFormData({ ...formData, protein: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="30"
                            />
                        </div>
                        <div>
                            <label htmlFor="carbs" className="block text-xs font-light uppercase tracking-wide mb-2">
                                Carbs (g)
                            </label>
                            <input
                                id="carbs"
                                type="number"
                                min="0"
                                value={formData.carbs}
                                onChange={(e) => setFormData({ ...formData, carbs: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="40"
                            />
                        </div>
                        <div>
                            <label htmlFor="fat" className="block text-xs font-light uppercase tracking-wide mb-2">
                                Fat (g)
                            </label>
                            <input
                                id="fat"
                                type="number"
                                min="0"
                                value={formData.fat}
                                onChange={(e) => setFormData({ ...formData, fat: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                                placeholder="20"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 border border-black bg-white text-black py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-black text-white py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : isEditMode ? 'Update Meal' : 'Create Meal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
