import { useState } from 'react';
import { useMenu } from '../hooks/useMenu';
import MealCard from '../components/MealCard';

const MAX_SELECTIONS = 10;

export default function MenuPage() {
    const { menu, loading, error } = useMenu();
    const [selectedMealIds, setSelectedMealIds] = useState<Set<number>>(new Set());

    const handleToggleSelect = (mealId: number) => {
        setSelectedMealIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(mealId)) {
                newSet.delete(mealId);
            } else {
                if (newSet.size < MAX_SELECTIONS) {
                    newSet.add(mealId);
                }
            }
            return newSet;
        });
    };

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

    const isLimitReached = selectedMealIds.size >= MAX_SELECTIONS;

    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-thin tracking-tight mb-4">This Week's Menu</h1>
                    <p className="text-sm font-light text-gray-600 uppercase tracking-wide">
                        {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
                    </p>

                    {/* Selection Counter */}
                    <div className="mt-4">
                        <p className="text-sm font-light">
                            <span className={`font-normal ${isLimitReached ? 'text-red-500' : 'text-black'}`}>
                                {selectedMealIds.size}
                            </span>
                            {' '}/{MAX_SELECTIONS} meals selected
                        </p>
                        {isLimitReached && (
                            <p className="text-xs text-red-500 mt-1">Maximum selection reached</p>
                        )}
                    </div>
                </div>

                {/* Meal Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menu.meals.map((weeklyMenuMeal, index) => (
                        <MealCard
                            key={weeklyMenuMeal.meal.id}
                            meal={weeklyMenuMeal.meal}
                            index={index}
                            isSelected={selectedMealIds.has(weeklyMenuMeal.meal.id)}
                            onToggleSelect={handleToggleSelect}
                            isLimitReached={isLimitReached}
                        />
                    ))}
                </div>

                {/* Checkout Button */}
                {selectedMealIds.size > 0 && (
                    <div className="mt-12 text-center">
                        <button className="bg-black text-white px-12 py-4 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors">
                            Continue to Checkout ({selectedMealIds.size} meals)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
