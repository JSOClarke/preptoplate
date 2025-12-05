import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';

interface DashboardStats {
    totalMeals: number;
    activeMenuExists: boolean;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({ totalMeals: 0, activeMenuExists: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Fetch total meals
            const meals = await api.get<any[]>('/meals');

            // Check if active menu exists
            let activeMenuExists = false;
            try {
                await api.get('/menu');
                activeMenuExists = true;
            } catch {
                activeMenuExists = false;
            }

            setStats({
                totalMeals: meals?.length || 0,
                activeMenuExists,
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <p className="text-sm font-light tracking-wide uppercase">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-white py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-16 text-center">
                    <h1 className="text-4xl font-thin tracking-tight mb-4">Admin Dashboard</h1>
                    <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                        Manage meals and weekly menus
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="mb-16 grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <div className="border border-black p-6">
                        <p className="text-xs font-light text-gray-600 uppercase tracking-wide mb-2">
                            Total Meals
                        </p>
                        <p className="text-3xl font-thin">{stats.totalMeals}</p>
                    </div>
                    <div className="border border-black p-6">
                        <p className="text-xs font-light text-gray-600 uppercase tracking-wide mb-2">
                            Active Menu
                        </p>
                        <p className="text-3xl font-thin">
                            {stats.activeMenuExists ? 'Yes' : 'No'}
                        </p>
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Meal Management Card */}
                    <Link
                        to="/admin/meals"
                        className="group border border-black p-8 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <UtensilsCrossed size={48} strokeWidth={1} className="text-black" />
                        </div>
                        <h2 className="text-xl font-normal text-center mb-3 uppercase tracking-wide">
                            Meal Management
                        </h2>
                        <p className="text-sm font-light text-gray-600 text-center">
                            Create, edit, and manage meal offerings
                        </p>
                        <div className="mt-6 text-center">
                            <span className="text-xs font-light uppercase tracking-wide border-b border-black group-hover:border-gray-600 transition-colors">
                                View →
                            </span>
                        </div>
                    </Link>

                    {/* Menu Management Card */}
                    <Link
                        to="/admin/menus"
                        className="group border border-black p-8 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <CalendarDays size={48} strokeWidth={1} className="text-black" />
                        </div>
                        <h2 className="text-xl font-normal text-center mb-3 uppercase tracking-wide">
                            Weekly Menus
                        </h2>
                        <p className="text-sm font-light text-gray-600 text-center">
                            Create and manage weekly menu schedules
                        </p>
                        <div className="mt-6 text-center">
                            <span className="text-xs font-light uppercase tracking-wide border-b border-black group-hover:border-gray-600 transition-colors">
                                View →
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
