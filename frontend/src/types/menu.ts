export interface Meal {
    id: number;
    name: string;
    description: string;
    image_url?: string;
    category?: string;
    price?: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
}

export interface WeeklyMenuMeal {
    meal: Meal;
    initial_stock: number;
    available_stock: number;
}

export interface WeeklyMenu {
    id: number;
    week_start_date: string;
    is_active: boolean;
    meals: WeeklyMenuMeal[];
}

export interface CreateWeeklyMenuRequest {
    week_start_date: string; // YYYY-MM-DD format
    meals: {
        meal_id: number;
        stock: number;
    }[];
}
