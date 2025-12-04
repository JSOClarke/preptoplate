import type { Meal } from './menu';

export interface CartItem {
    id: number;
    meal: Meal;
    quantity: number;
    created_at: string;
}

export interface Cart {
    id: number;
    user_id: number;
    items: CartItem[];
    total_items: number;
    total_price: number; // in cents
    created_at: string;
    updated_at: string;
}

export interface AddToCartRequest {
    meal_id: number;
    quantity: number;
}

export interface UpdateCartItemRequest {
    quantity: number;
}
