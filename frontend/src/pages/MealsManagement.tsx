import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Meal } from '../types/menu';
import { useMealManagement } from '../hooks/useMealManagement';
import { useTableFilters } from '../hooks/useTableFilters';
import MealFormModal, { type MealFormData } from '../components/MealFormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import SearchBar from '../components/SearchBar';
import NutritionFilters from '../components/NutritionFilters';

export default function MealsManagement() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [mealToDelete, setMealToDelete] = useState<Meal | null>(null);

    const { createMeal, updateMeal, deleteMeal, loading: actionLoading } = useMealManagement();

    // Filtering
    const {
        searchTerm,
        setSearchTerm,
        numericFilters,
        updateNumericFilter,
        filteredData: filteredMeals,
        activeFilterCount,
        clearFilters,
        totalCount,
        filteredCount,
    } = useTableFilters({
        data: meals,
        searchFields: ['name', 'description'],
    });

    useEffect(() => {
        loadMeals();
    }, []);

    const loadMeals = async () => {
        try {
            setLoading(true);
            const data = await api.get<Meal[]>('/meals');
            setMeals(data || []);
            setError(null);
        } catch (err) {
            setError('Failed to load meals');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setSelectedMeal(null);
        setIsFormModalOpen(true);
    };

    const handleEditClick = (meal: Meal) => {
        setSelectedMeal(meal);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = (meal: Meal) => {
        setMealToDelete(meal);
        setIsDeleteModalOpen(true);
    };

    const handleSaveMeal = async (mealData: MealFormData): Promise<boolean> => {
        if (selectedMeal) {
            // Edit mode
            const updated = await updateMeal(selectedMeal.id, mealData);
            if (updated) {
                await loadMeals();
                setSuccessMessage('Meal updated successfully');
                setTimeout(() => setSuccessMessage(null), 5000); // Auto-dismiss after 5s
                return true;
            }
        } else {
            // Create mode
            const created = await createMeal(mealData);
            if (created) {
                await loadMeals();
                setSuccessMessage('Meal created successfully');
                setTimeout(() => setSuccessMessage(null), 5000); // Auto-dismiss after 5s
                return true;
            }
        }
        return false;
    };

    const handleConfirmDelete = async () => {
        if (mealToDelete) {
            setDeleteError(null);
            const result = await deleteMeal(mealToDelete.id);
            if (result.success) {
                await loadMeals();
                setIsDeleteModalOpen(false);
                setMealToDelete(null);
                setSuccessMessage('Meal deleted successfully');
                setTimeout(() => setSuccessMessage(null), 5000); // Auto-dismiss after 5s
            } else {
                // Show the error message from the API
                setDeleteError(result.error || 'Failed to delete meal');
                setIsDeleteModalOpen(false);
                setMealToDelete(null);
            }
        }
    };

    const truncate = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <p className="text-sm font-light tracking-wide uppercase">Loading meals...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-thin tracking-tight mb-2">Meal Management</h1>
                        <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                            Manage your meal offerings
                        </p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="bg-black text-white px-6 py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} strokeWidth={1.5} />
                        Create New Meal
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm font-light">
                        {error}
                    </div>
                )}

                {/* Delete Error Notification */}
                {deleteError && (
                    <div className="mb-6 p-4 border border-yellow-600 bg-yellow-50 text-yellow-900 text-sm font-light relative">
                        <p className="font-normal mb-1">Unable to Delete Meal</p>
                        <p>{deleteError}</p>
                        <button
                            onClick={() => setDeleteError(null)}
                            className="absolute top-3 right-3 text-yellow-900 hover:text-yellow-700"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Success Notification */}
                {successMessage && (
                    <div className="mb-6 p-4 border border-green-600 bg-green-50 text-green-900 text-sm font-light relative">
                        <p className="font-normal mb-1">Success</p>
                        <p>{successMessage}</p>
                        <button
                            onClick={() => setSuccessMessage(null)}
                            className="absolute top-3 right-3 text-green-900 hover:text-green-700"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <div className="flex gap-4 flex-col sm:flex-row">
                        <div className="flex-1">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search meals by name or description..."
                            />
                        </div>
                        <NutritionFilters
                            filters={numericFilters}
                            onFilterChange={updateNumericFilter}
                            onClearAll={clearFilters}
                            activeCount={activeFilterCount}
                        />
                    </div>

                    {/* Result Count */}
                    <div className="flex items-center justify-between text-sm font-light">
                        <p>
                            Showing <span className="font-normal">{filteredCount}</span> of{' '}
                            <span className="font-normal">{totalCount}</span> meals
                        </p>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs uppercase tracking-wide hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Meals Table */}
                {filteredMeals.length === 0 ? (
                    <div className="text-center py-16 border border-black">
                        <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                            {totalCount === 0 ? 'No meals yet' : 'No meals match your filters'}
                        </p>
                        {totalCount > 0 && activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-xs uppercase tracking-wide hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="border border-black overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Photo</th>
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Meal</th>
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Description</th>
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Macros</th>
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Price</th>
                                        <th className="text-right px-4 py-3 text-xs font-normal uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMeals.map((meal, index) => (
                                        <tr
                                            key={meal.id}
                                            className={`hover:bg-gray-50 transition-colors ${index !== filteredMeals.length - 1 ? 'border-b border-gray-200' : ''}`}
                                        >
                                            <td className="px-4 py-4">
                                                {meal.image_url ? (
                                                    <img
                                                        src={meal.image_url}
                                                        alt={meal.name}
                                                        className="w-16 h-16 object-cover border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 border border-gray-200 bg-gray-50 flex items-center justify-center">
                                                        <span className="text-xs font-light text-gray-400">No image</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-normal">{meal.name}</td>
                                            <td className="px-4 py-4 text-sm font-light text-gray-600">
                                                {truncate(meal.description, 60)}
                                            </td>
                                            <td className="px-4 py-4 text-xs font-light text-gray-600">
                                                {meal.calories || 0} cal | {meal.protein || 0}P {meal.carbs || 0}C {meal.fat || 0}F
                                            </td>
                                            <td className="px-4 py-4 text-sm font-light">
                                                ${((meal.price || 0) / 100).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleEditClick(meal)}
                                                        className="inline-flex items-center justify-center p-2 hover:bg-gray-200 transition-colors"
                                                        title="Edit meal"
                                                    >
                                                        <Edit size={16} strokeWidth={1.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(meal)}
                                                        className="inline-flex items-center justify-center p-2 hover:bg-gray-200 transition-colors"
                                                        title="Delete meal"
                                                    >
                                                        <Trash2 size={16} strokeWidth={1.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden divide-y divide-gray-200">
                            {filteredMeals.map((meal, index) => (
                                <div
                                    key={meal.id}
                                    className={`p-4 ${index !== filteredMeals.length - 1 ? 'border-b border-gray-200' : ''}`}
                                >
                                    <div className="flex gap-4">
                                        {meal.image_url ? (
                                            <img
                                                src={meal.image_url}
                                                alt={meal.name}
                                                className="w-20 h-20 object-cover border border-gray-200 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 border border-gray-200 bg-gray-50 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-light text-gray-400">No image</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-normal mb-1">{meal.name}</h3>
                                            <p className="text-xs font-light text-gray-600 mb-2">
                                                {truncate(meal.description, 80)}
                                            </p>
                                            <p className="text-xs font-light mb-1">
                                                ${((meal.price || 0) / 100).toFixed(2)}
                                            </p>
                                            <p className="text-xs font-light text-gray-600">
                                                {meal.calories || 0} cal | {meal.protein || 0}P {meal.carbs || 0}C {meal.fat || 0}F
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleEditClick(meal)}
                                            className="flex-1 border border-black py-2 text-xs font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} strokeWidth={1.5} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(meal)}
                                            className="flex-1 bg-black text-white py-2 text-xs font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} strokeWidth={1.5} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modals */}
                <MealFormModal
                    isOpen={isFormModalOpen}
                    meal={selectedMeal}
                    onSave={handleSaveMeal}
                    onCancel={() => setIsFormModalOpen(false)}
                    loading={actionLoading}
                />

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Meal"
                    message={`Are you sure you want to delete "${mealToDelete?.name}"? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setIsDeleteModalOpen(false);
                        setMealToDelete(null);
                    }}
                    loading={actionLoading}
                />
            </div>
        </div>
    );
}
