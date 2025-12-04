import type { Meal } from '../types/menu';

const pastelColors = [
    'bg-[#FFE5E5]', // Pastel Pink
    'bg-[#E5F5FF]', // Pastel Blue
    'bg-[#E5FFE5]', // Pastel Green
    'bg-[#FFF5E5]', // Pastel Peach
    'bg-[#F5E5FF]', // Pastel Purple
    'bg-[#FFFFE5]', // Pastel Yellow
];

interface MealCardProps {
    meal: Meal;
    index: number;
}

export default function MealCard({ meal, index }: MealCardProps) {
    const bgColor = pastelColors[index % pastelColors.length];

    return (
        <div
            className={`${bgColor} p-6 aspect-square flex flex-col justify-between transition-opacity hover:opacity-90 cursor-pointer`}
        >
            <div>
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
