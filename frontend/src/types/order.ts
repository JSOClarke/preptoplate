import type { Meal } from './menu';

export interface OrderItem {
    meal: Meal;
    quantity: number;
    price: number; // in cents
}

export interface Order {
    id: number;
    user_id: number;
    week_id: number;
    status: string;
    total_price: number; // in cents
    delivery_date: string;
    items: OrderItem[];
    created_at: string;
}

export interface CheckoutRequest {
    delivery_date: string;
}
