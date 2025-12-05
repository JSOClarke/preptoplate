import { useState } from 'react';
import { api } from '../lib/api';
import type { Meal } from '../types/menu';

export interface CreateMealRequest {
    name: string;
    description: string;
    image_url: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    price: number; // in cents
}

export interface UpdateMealRequest {
    name?: string;
    description?: string;
    image_url?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    price?: number; // in cents
}

export function useMealManagement() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createMeal = async (meal: CreateMealRequest): Promise<Meal | null> => {
        try {
            setLoading(true);
            setError(null);
            return await api.post<Meal>('/meals', meal);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create meal');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateMeal = async (id: number, meal: UpdateMealRequest): Promise<Meal | null> => {
        try {
            setLoading(true);
            setError(null);
            return await api.put<Meal>(`/meals/${id}`, meal);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update meal');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteMeal = async (id: number): Promise<{ success: boolean; error?: string }> => {
        try {
            setLoading(true);
            setError(null);
            await api.delete(`/meals/${id}`);
            return { success: true };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete meal';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        createMeal,
        updateMeal,
        deleteMeal,
    };
}
