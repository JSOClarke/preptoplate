import { useState, useEffect } from 'react';
import type { WeeklyMenu } from '../types/menu';

export function useMenu() {
    const [menu, setMenu] = useState<WeeklyMenu | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/menu');
            if (!response.ok) {
                throw new Error('Failed to fetch menu');
            }
            const data = await response.json();
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
