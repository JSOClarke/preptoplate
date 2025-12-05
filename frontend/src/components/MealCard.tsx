import type { Meal } from '../types/menu';
import { Minus } from 'lucide-react';

const pastelColors = [
    'bg-[#FFE5E5]', // Pastel Pink
    'bg-[#E5F5FF]', // Pastel Blue
    'bg-[#E5FFE5]', // Pastel Green
    'bg-[#FFF5E5]', // Pastel Peach
    'bg-[#F5E5FF]', // Pastel Purple
    'bg-[#FFFFE5]', // Pastel Yellow
];

// Complementary/opposite pastels for selection highlights
const highlightColors = [
    'border-[#FFB3B3]', // Deeper Pink
    'border-[#99D6FF]', // Deeper Blue
    'border-[#99FF99]', // Deeper Green
    'border-[#FFCC99]', // Deeper Peach
    'border-[#CC99FF]', // Deeper Purple
    'border-[#FFFF99]', // Deeper Yellow
];

interface MealCardProps {
    meal: Meal;
    index: number;
    quantity: number;
    onIncrement: (mealId: number) => void;
    onDecrement: (mealId: number) => void;
    isLimitReached?: boolean;
}

export default function MealCard({ meal, index, quantity, onIncrement, onDecrement, isLimitReached = false }: MealCardProps) {
    const bgColor = pastelColors[index % pastelColors.length];
    const highlightColor = highlightColors[index % highlightColors.length];
    const isSelected = quantity > 0;

    const handleCardClick = () => {
        // Allow increment if limit not reached or if already selected
        if (isSelected || !isLimitReached) {
            onIncrement(meal.id);
        }
    };

    const handleDecrementClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        onDecrement(meal.id);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`${bgColor} p-6 aspect-square flex flex-col justify-between transition-all cursor-pointer relative
        ${isSelected ? `border-4 ${highlightColor} shadow-lg scale-[1.02]` : 'border-4 border-transparent hover:opacity-90'}
        ${!isSelected && isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            {/* Quantity Badge */}
            {isSelected && (
                <div className="absolute top-2 right-2 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {quantity}
                </div>
            )}

            {/* Minus Button */}
            {isSelected && (
                <button
                    onClick={handleDecrementClick}
                    className="absolute top-2 left-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label="Decrease quantity"
                >
                    <Minus size={16} strokeWidth={3} />
                </button>
            )}

            <div className="relative">
                <span className="text-xs font-light tracking-widest uppercase text-gray-600 mb-2 block">
                    {meal.category || 'N/A'}
                </span>
                <h3 className="text-xl font-normal mb-2">{meal.name}</h3>
                <p className="text-sm font-light text-gray-700 leading-relaxed">
                    {meal.description}
                </p>
            </div>

            <div className="space-y-2">
                {meal.calories !== undefined && (
                    <div className="flex justify-between items-center text-xs font-light">
                        <span className="tracking-wide uppercase">Calories</span>
                        <span>{meal.calories}</span>
                    </div>
                )}
                {meal.protein !== undefined && (
                    <div className="flex justify-between items-center text-xs font-light">
                        <span className="tracking-wide uppercase">Protein</span>
                        <span>{meal.protein}g</span>
                    </div>
                )}
                {meal.price !== undefined && (
                    <div className="flex justify-between items-center text-xs font-light">
                        <span className="tracking-wide uppercase">Price</span>
                        <span className="font-normal">${meal.price.toFixed(2)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
