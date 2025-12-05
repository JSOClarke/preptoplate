import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Meal, WeeklyMenu } from '../types/menu';
import { useWeeklyMenuManagement } from '../hooks/useWeeklyMenuManagement';
import MenuFormModal, { type MenuFormData } from '../components/MenuFormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function MenusManagement() {
    const navigate = useNavigate();
    const [menus, setMenus] = useState<WeeklyMenu[]>([]);
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Modal states
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<WeeklyMenu | null>(null);

    const { createMenu, deleteMenu, loading: actionLoading } = useWeeklyMenuManagement();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load meals for the create form
            const mealsData = await api.get<Meal[]>('/meals');
            setMeals(mealsData || []);

            // Load all weekly menus
            const menusData = await api.get<WeeklyMenu[]>('/admin/weekly-menus');
            setMenus(menusData || []);

            setError(null);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        setIsFormModalOpen(true);
    };

    const handleEditClick = (menu: WeeklyMenu) => {
        navigate(`/admin/menus/${menu.id}/edit`);
    };

    const handleDeleteClick = (menu: WeeklyMenu) => {
        setMenuToDelete(menu);
        setIsDeleteModalOpen(true);
    };

    const handleSaveMenu = async (menuData: MenuFormData): Promise<boolean> => {
        const result = await createMenu(menuData);
        if (result.success) {
            await loadData();
            setSuccessMessage('Weekly menu created successfully');
            setTimeout(() => setSuccessMessage(null), 5000);
            return true;
        }
        return false;
    };

    const handleConfirmDelete = async () => {
        if (menuToDelete) {
            const result = await deleteMenu(menuToDelete.id);
            if (result.success) {
                await loadData();
                setIsDeleteModalOpen(false);
                setMenuToDelete(null);
                setSuccessMessage('Menu deleted successfully');
                setTimeout(() => setSuccessMessage(null), 5000);
            } else {
                setError(result.error || 'Failed to delete menu');
                setIsDeleteModalOpen(false);
                setMenuToDelete(null);
            }
        }
    };

    const formatWeekDates = (startDate: string): string => {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);

        return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <p className="text-sm font-light tracking-wide uppercase">Loading menus...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-white py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-thin tracking-tight mb-2">Weekly Menu Management</h1>
                        <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                            Create and manage weekly meal schedules
                        </p>
                    </div>
                    <button
                        onClick={handleCreateClick}
                        disabled={meals.length === 0}
                        className="bg-black text-white px-6 py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={meals.length === 0 ? 'Create meals first' : 'Create new menu'}
                    >
                        <Plus size={18} strokeWidth={1.5} />
                        Create New Menu
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 border border-red-200 bg-red-50 text-red-600 text-sm font-light">
                        {error}
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

                {/* Menus Table */}
                {menus.length === 0 ? (
                    <div className="text-center py-16 border border-black">
                        <p className="text-sm font-light text-gray-600 uppercase tracking-wide mb-2">
                            No weekly menus yet
                        </p>
                        {meals.length === 0 ? (
                            <p className="text-xs font-light text-gray-500">
                                Create meals first before creating a weekly menu
                            </p>
                        ) : (
                            <p className="text-xs font-light text-gray-500">
                                Create your first weekly menu to get started
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="border border-black overflow-hidden">
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-black">
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Week Dates</th>
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-normal uppercase tracking-wide">Meals</th>
                                        <th className="text-right px-4 py-3 text-xs font-normal uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {menus.map((menu, index) => (
                                        <tr
                                            key={menu.id}
                                            className={`hover:bg-gray-50 transition-colors ${index !== menus.length - 1 ? 'border-b border-gray-200' : ''}`}
                                        >
                                            <td className="px-4 py-4 text-sm font-normal">
                                                {formatWeekDates(menu.week_start_date)}
                                            </td>
                                            <td className="px-4 py-4">
                                                {menu.is_active ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-light text-green-700">
                                                        <CheckCircle size={14} strokeWidth={1.5} />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-light text-gray-500">
                                                        <Circle size={14} strokeWidth={1.5} />
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-light text-gray-600">
                                                {menu.meals?.length || 0} meals
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(menu)}
                                                        className="inline-flex items-center justify-center p-2 hover:bg-gray-200 transition-colors"
                                                        title="Edit menu"
                                                    >
                                                        <Edit size={16} strokeWidth={1.5} />
                                                    </button>
                                                    {!menu.is_active && (
                                                        <button
                                                            onClick={() => handleDeleteClick(menu)}
                                                            className="inline-flex items-center justify-center p-2 hover:bg-gray-200 transition-colors"
                                                            title="Delete menu"
                                                        >
                                                            <Trash2 size={16} strokeWidth={1.5} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden">
                            {menus.map((menu, index) => (
                                <div
                                    key={menu.id}
                                    className={`p-4 ${index !== menus.length - 1 ? 'border-b border-gray-200' : ''}`}
                                >
                                    <div className="mb-3">
                                        <p className="text-sm font-normal mb-1">
                                            {formatWeekDates(menu.week_start_date)}
                                        </p>
                                        <div className="flex items-center gap-3 text-xs font-light">
                                            {menu.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-green-700">
                                                    <CheckCircle size={14} strokeWidth={1.5} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-500">
                                                    <Circle size={14} strokeWidth={1.5} />
                                                    Inactive
                                                </span>
                                            )}
                                            <span className="text-gray-600">
                                                {menu.meals?.length || 0} meals
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleEditClick(menu)}
                                            className="flex-1 border border-black py-2 text-xs font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} strokeWidth={1.5} />
                                            Edit
                                        </button>
                                        {!menu.is_active && (
                                            <button
                                                onClick={() => handleDeleteClick(menu)}
                                                className="flex-1 bg-black text-white py-2 text-xs font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} strokeWidth={1.5} />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modals */}
                <MenuFormModal
                    isOpen={isFormModalOpen}
                    meals={meals}
                    onSave={handleSaveMenu}
                    onCancel={() => setIsFormModalOpen(false)}
                    loading={actionLoading}
                />

                <ConfirmDeleteModal
                    isOpen={isDeleteModalOpen}
                    title="Delete Menu"
                    message={`Are you sure you want to delete this menu? This action cannot be undone.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setIsDeleteModalOpen(false);
                        setMenuToDelete(null);
                    }}
                    loading={actionLoading}
                />
            </div>
        </div>
    );
}
