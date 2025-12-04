import { useMenu } from '../hooks/useMenu';
import MealCard from '../components/MealCard';

export default function MenuPage() {
    const { menu, loading, error } = useMenu();

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <p className="text-sm font-light tracking-wide uppercase">Loading menu...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <p className="text-sm font-light text-red-500">{error}</p>
            </div>
        );
    }

    if (!menu || !menu.meals || menu.meals.length === 0) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <p className="text-sm font-light tracking-wide uppercase">No meals available this week</p>
            </div>
        );
    }

    // Calculate week end date (7 days after start)
    const weekStart = new Date(menu.week_start_date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-thin tracking-tight mb-4">This Week's Menu</h1>
                    <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                        {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
                    </p>
                </div>

                {/* Meal Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menu.meals.map((weeklyMenuMeal, index) => (
                        <MealCard key={weeklyMenuMeal.meal.id} meal={weeklyMenuMeal.meal} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}
