import { useState, useEffect } from 'react';
import type { WeeklyMenu } from '../types/menu';
import { api } from '../lib/api';

export function useMenu() {
    const [menu, setMenu] = useState<WeeklyMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const data = await api.get<WeeklyMenu>('/menu');
            console.log('Menu data:', data); // Debug log
            setMenu(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return { menu, loading, error, refetch: fetchMenu };
}
