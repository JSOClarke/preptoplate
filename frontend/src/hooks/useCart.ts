import { useState } from 'react';
import type { Cart, AddToCartRequest } from '../types/cart';
import type { Order, CheckoutRequest } from '../types/order';
import { api } from '../lib/api';

export function useCart() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getCart = async (): Promise<Cart | null> => {
        try {
            setLoading(true);
            setError(null);
            return await api.get<Cart>('/cart');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get cart');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (request: AddToCartRequest): Promise<Cart | null> => {
        try {
            setLoading(true);
            setError(null);
            // Backend returns the updated Cart after adding item
            return await api.post<Cart>('/cart/items', request);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add to cart');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearCart = async (): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            // Backend returns {"message": "cart cleared"}
            await api.delete<{ message: string }>('/cart');
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear cart');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const checkout = async (request: CheckoutRequest): Promise<Order | null> => {
        try {
            setLoading(true);
            setError(null);
            return await api.post<Order>('/orders/checkout', request);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Checkout failed');
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getCart,
        addToCart,
        clearCart,
        checkout,
    };
}
