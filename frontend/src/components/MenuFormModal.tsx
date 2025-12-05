import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Meal } from '../types/menu';

interface MenuFormModalProps {
    isOpen: boolean;
    meals: Meal[];
    onSave: (menuData: MenuFormData) => Promise<boolean>;
    onCancel: () => void;
    loading?: boolean;
}

export interface MenuFormData {
    week_start_date: string; // YYYY-MM-DD
    meals: {
        meal_id: number;
        stock: number;
    }[];
}

export default function MenuFormModal({
    isOpen,
    meals,
    onSave,
    onCancel,
    loading = false,
}: MenuFormModalProps) {
    const [weekStartDate, setWeekStartDate] = useState('');
    const [selectedMeals, setSelectedMeals] = useState<Map<number, number>>(new Map());
    const [validationError, setValidationError] = useState<string | null>(null);

    // Calculate week end date
    const getWeekEndDate = (startDate: string): string => {
        if (!startDate) return '';
        const date = new Date(startDate);
        date.setDate(date.getDate() + 6);
        return date.toLocaleDateString();
    };

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setWeekStartDate('');
            setSelectedMeals(new Map());
            setValidationError(null);
        }
    }, [isOpen]);

    const handleMealToggle = (mealId: number) => {
        setSelectedMeals((prev) => {
            const newMap = new Map(prev);
            if (newMap.has(mealId)) {
                newMap.delete(mealId);
            } else {
                newMap.set(mealId, 100); // Default stock
            }
            return newMap;
        });
    };

    const handleStockChange = (mealId: number, stock: number) => {
        setSelectedMeals((prev) => {
            const newMap = new Map(prev);
            newMap.set(mealId, stock);
            return newMap;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Validation
        if (!weekStartDate) {
            setValidationError('Please select a week start date');
            return;
        }

        if (selectedMeals.size === 0) {
            setValidationError('Please select at least one meal');
            return;
        }

        // Check if all selected meals have stock > 0
        for (const [, stock] of selectedMeals.entries()) {
            if (stock <= 0) {
                setValidationError('All selected meals must have stock greater than 0');
                return;
            }
        }

        const menuData: MenuFormData = {
            week_start_date: weekStartDate,
            meals: Array.from(selectedMeals.entries()).map(([meal_id, stock]) => ({
                meal_id,
                stock,
            })),
        };

        const success = await onSave(menuData);
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white border border-black p-8 max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
                >
                    <X size={20} strokeWidth={1.5} />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-normal uppercase tracking-wide mb-8">
                    Create Weekly Menu
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Week Start Date */}
                    <div>
                        <label htmlFor="week_start_date" className="block text-xs font-light uppercase tracking-wide mb-2">
                            Week Start Date *
                        </label>
                        <input
                            id="week_start_date"
                            type="date"
                            required
                            value={weekStartDate}
                            onChange={(e) => setWeekStartDate(e.target.value)}
                            className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        {weekStartDate && (
                            <p className="mt-2 text-xs font-light text-gray-600">
                                Week: {new Date(weekStartDate).toLocaleDateString()} - {getWeekEndDate(weekStartDate)}
                            </p>
                        )}
                    </div>

                    {/* Meal Selection */}
                    <div>
                        <label className="block text-xs font-light uppercase tracking-wide mb-3">
                            Select Meals & Set Stock *
                        </label>
                        <div className="border border-black max-h-96 overflow-y-auto">
                            {meals.length === 0 ? (
                                <p className="p-4 text-sm font-light text-gray-600">
                                    No meals available. Please create meals first.
                                </p>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {meals.map((meal) => {
                                        const isSelected = selectedMeals.has(meal.id);
                                        const stock = selectedMeals.get(meal.id) || 100;

                                        return (
                                            <div
                                                key={meal.id}
                                                className={`p-4 flex items-center gap-4 ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}
                                            >
                                                {/* Checkbox */}
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleMealToggle(meal.id)}
                                                    className="w-4 h-4"
                                                />

                                                {/* Meal Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-normal">{meal.name}</p>
                                                    <p className="text-xs font-light text-gray-600 truncate">
                                                        {meal.description}
                                                    </p>
                                                </div>

                                                {/* Stock Input */}
                                                {isSelected && (
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs font-light text-gray-600 whitespace-nowrap">
                                                            Stock:
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={stock}
                                                            onChange={(e) => handleStockChange(meal.id, parseInt(e.target.value) || 0)}
                                                            className="w-20 px-2 py-1 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <p className="mt-2 text-xs font-light text-gray-600">
                            {selectedMeals.size} meal{selectedMeals.size !== 1 ? 's' : ''} selected
                        </p>
                    </div>

                    {/* Validation Error */}
                    {validationError && (
                        <div className="p-4 border border-red-200 bg-red-50 text-red-600 text-sm font-light">
                            {validationError}
                        </div>
                    )}

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
                            {loading ? 'Creating...' : 'Create Menu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
