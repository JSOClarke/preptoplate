import { useState } from 'react';
import { api } from '../lib/api';
import type { WeeklyMenu, CreateWeeklyMenuRequest } from '../types/menu';

export function useWeeklyMenuManagement() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMenu = async (menuData: CreateWeeklyMenuRequest): Promise<{ success: boolean; error?: string; menu?: WeeklyMenu }> => {
        try {
            setLoading(true);
            setError(null);
            const menu = await api.post<WeeklyMenu>('/admin/weekly-menus', menuData);
            return { success: true, menu };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create menu';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const activateMenu = async (id: number): Promise<{ success: boolean; error?: string }> => {
        try {
            setLoading(true);
            setError(null);
            await api.put(`/admin/weekly-menus/${id}/activate`, {});
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to activate menu';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const getMenuById = async (id: number): Promise<WeeklyMenu | null> => {
        try {
            setLoading(true);
            setError(null);
            return await api.get<WeeklyMenu>(`/admin/weekly-menus/${id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch menu');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateMenu = async (id: number, menuData: CreateWeeklyMenuRequest): Promise<{ success: boolean; error?: string; menu?: WeeklyMenu }> => {
        try {
            setLoading(true);
            setError(null);
            const menu = await api.put<WeeklyMenu>(`/admin/weekly-menus/${id}`, menuData);
            return { success: true, menu };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update menu';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const deleteMenu = async (id: number): Promise<{ success: boolean; error?: string }> => {
        try {
            setLoading(true);
            setError(null);
            await api.delete(`/admin/weekly-menus/${id}`);
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete menu';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createMenu,
        activateMenu,
        getMenuById,
        updateMenu,
        deleteMenu,
    };
}
