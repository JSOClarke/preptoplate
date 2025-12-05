import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Meal, WeeklyMenu } from '../types/menu';
import { useWeeklyMenuManagement } from '../hooks/useWeeklyMenuManagement';
import type { CreateWeeklyMenuRequest } from '../types/menu';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function EditWeeklyMenu() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [menu, setMenu] = useState<WeeklyMenu | null>(null);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [weekStartDate, setWeekStartDate] = useState('');
    const [selectedMeals, setSelectedMeals] = useState<Map<number, number>>(new Map());
    const [validationError, setValidationError] = useState<string | null>(null);

    // Delete modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { updateMenu, deleteMenu, loading: actionLoading } = useWeeklyMenuManagement();

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load all meals
            const mealsData = await api.get<Meal[]>('/meals');
            setMeals(mealsData || []);

            // Load this specific menu
            if (id) {
                const menuData = await api.get<WeeklyMenu>(`/admin/weekly-menus/${id}`);
                setMenu(menuData);

                // Pre-populate form
                const date = new Date(menuData.week_start_date);
                const formattedDate = date.toISOString().split('T')[0];
                setWeekStartDate(formattedDate);

                // Pre-populate selected meals and stock
                const mealsMap = new Map<number, number>();
                menuData.meals.forEach(menuMeal => {
                    mealsMap.set(menuMeal.meal.id, menuMeal.initial_stock);
                });
                setSelectedMeals(mealsMap);
            }

            setError(null);
        } catch (err) {
            setError('Failed to load menu data');
        } finally {
            setLoading(false);
        }
    };

    const getWeekEndDate = (startDate: string): string => {
        if (!startDate) return '';
        const date = new Date(startDate);
        date.setDate(date.getDate() + 6);
        return date.toLocaleDateString();
    };

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

    const handleSave = async () => {
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

        const menuData: CreateWeeklyMenuRequest = {
            week_start_date: weekStartDate,
            meals: Array.from(selectedMeals.entries()).map(([meal_id, stock]) => ({
                meal_id,
                stock,
            })),
        };

        const result = await updateMenu(parseInt(id!), menuData);
        if (result.success) {
            setSuccessMessage('Menu updated successfully');
            setTimeout(() => {
                navigate('/admin/menus');
            }, 1500);
        } else {
            setError(result.error || 'Failed to update menu');
        }
    };

    const handleDelete = async () => {
        const result = await deleteMenu(parseInt(id!));
        if (result.success) {
            navigate('/admin/menus');
        } else {
            setError(result.error || 'Failed to delete menu');
            setIsDeleteModalOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <p className="text-sm font-light tracking-wide uppercase">Loading menu...</p>
            </div>
        );
    }

    if (!menu) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-sm font-light text-gray-600 uppercase tracking-wide mb-4">Menu not found</p>
                    <button
                        onClick={() => navigate('/admin/menus')}
                        className="text-sm font-normal uppercase tracking-wide underline hover:no-underline"
                    >
                        ← Back to Menus
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-white py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/admin/menus')}
                        className="inline-flex items-center gap-2 text-sm font-light hover:underline mb-6"
                    >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        Back to Menus
                    </button>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-thin tracking-tight mb-2">Edit Weekly Menu</h1>
                            <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                                Menu ID: {menu.id}
                            </p>
                        </div>

                        {!menu.is_active && (
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="border border-red-600 text-red-600 px-4 py-2 text-sm font-normal uppercase tracking-wide hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <Trash2 size={16} strokeWidth={1.5} />
                                Delete Menu
                            </button>
                        )}
                    </div>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 border border-green-600 bg-green-50 text-green-900 text-sm font-light">
                        {successMessage}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm font-light">
                        {error}
                    </div>
                )}

                {/* Active Menu Warning */}
                {menu.is_active && (
                    <div className="mb-6 p-4 border border-blue-600 bg-blue-50 text-blue-900 text-sm font-light">
                        <p className="font-normal mb-1">Active Menu</p>
                        <p>This is the currently active menu. Deactivate it before deleting.</p>
                    </div>
                )}

                {/* Form */}
                <div className="space-y-8">
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
                            onClick={() => navigate('/admin/menus')}
                            disabled={actionLoading}
                            className="flex-1 border border-black bg-white text-black py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={actionLoading}
                            className="flex-1 bg-black text-white py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                            {actionLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Menu"
                    message={`Are you sure you want to delete this menu? This action cannot be undone.`}
                    onConfirm={handleDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                    loading={actionLoading}
                />
            </div>
        </div>
    );
}
