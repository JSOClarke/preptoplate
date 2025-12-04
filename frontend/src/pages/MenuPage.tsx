import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMenu } from '../hooks/useMenu';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import MealCard from '../components/MealCard';

const MAX_TOTAL_ITEMS = 10;

export default function MenuPage() {
    const { menu, loading, error } = useMenu();
    const { addToCart, clearCart, loading: cartLoading } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [mealQuantities, setMealQuantities] = useState<Map<number, number>>(new Map());
    const [cartError, setCartError] = useState<string | null>(null);

    // Calculate total items across all meals
    const totalItems = Array.from(mealQuantities.values()).reduce((sum, qty) => sum + qty, 0);
    const isLimitReached = totalItems >= MAX_TOTAL_ITEMS;

    const handleIncrement = (mealId: number) => {
        if (totalItems < MAX_TOTAL_ITEMS) {
            setMealQuantities((prev) => {
                const newMap = new Map(prev);
                const currentQty = newMap.get(mealId) || 0;
                newMap.set(mealId, currentQty + 1);
                return newMap;
            });
        }
    };

    const handleDecrement = (mealId: number) => {
        setMealQuantities((prev) => {
            const newMap = new Map(prev);
            const currentQty = newMap.get(mealId) || 0;
            if (currentQty > 1) {
                newMap.set(mealId, currentQty - 1);
            } else {
                newMap.delete(mealId);
            }
            return newMap;
        });
    };

    const handleCheckout = async () => {
        setCartError(null);

        // Check authentication
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/menu' } } });
            return;
        }

        // Clear cart first
        const cleared = await clearCart();
        if (!cleared) {
            setCartError('Failed to clear cart. Please try again.');
            return;
        }

        // Add items to cart
        let success = true;
        for (const [mealId, quantity] of mealQuantities.entries()) {
            const added = await addToCart({ meal_id: mealId, quantity });
            if (!added) {
                success = false;
                break;
            }
        }

        if (success) {
            navigate('/checkout');
        } else {
            setCartError('Failed to add items to cart. Please try again.');
        }
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
                                {totalItems}
                            </span>
                            {' '}/{MAX_TOTAL_ITEMS} meals selected
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
                            quantity={mealQuantities.get(weeklyMenuMeal.meal.id) || 0}
                            onIncrement={handleIncrement}
                            onDecrement={handleDecrement}
                            isLimitReached={isLimitReached}
                        />
                    ))}
                </div>

                {/* Cart Error */}
                {cartError && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-light text-center max-w-md mx-auto">
                        {cartError}
                    </div>
                )}

                {/* Checkout Button */}
                {totalItems > 0 && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={handleCheckout}
                            disabled={cartLoading}
                            className="bg-black text-white px-12 py-4 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cartLoading ? 'Processing...' : `Continue to Checkout (${totalItems} ${totalItems === 1 ? 'meal' : 'meals'})`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
