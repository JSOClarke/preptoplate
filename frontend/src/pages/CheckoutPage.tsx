import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import type { Cart } from '../types/cart';

export default function CheckoutPage() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [deliveryDate, setDeliveryDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { getCart, checkout } = useCart();
    const navigate = useNavigate();

    // Load cart on mount
    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        const cartData = await getCart();
        if (cartData && cartData.items && cartData.items.length > 0) {
            setCart(cartData);
        } else {
            // No items in cart, redirect to menu
            navigate('/menu');
            return;
        }
        setLoading(false);
    };

    // Set default delivery date to next week
    useEffect(() => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setDeliveryDate(nextWeek.toISOString().split('T')[0]);
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        const order = await checkout({ delivery_date: deliveryDate });

        if (order) {
            navigate('/order-confirmation', { state: { order } });
        } else {
            setError('Failed to place order. Please try again.');
        }

        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
                <p className="text-sm font-light tracking-wide uppercase">Loading...</p>
            </div>
        );
    }

    if (!cart) {
        return null;
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-white py-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-thin tracking-tight mb-12 text-center">Checkout</h1>

                {/* Cart Summary */}
                <div className="mb-12 border border-black p-6">
                    <h2 className="text-xl font-normal mb-6 uppercase tracking-wide">Order Summary</h2>

                    <div className="space-y-4">
                        {cart.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div className="flex-1">
                                    <p className="font-normal">{item.meal.name}</p>
                                    <p className="text-xs font-light text-gray-600 uppercase">{item.meal.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-light">Qty: {item.quantity}</p>
                                    {item.meal.price && (
                                        <p className="text-xs font-light">${(item.meal.price * item.quantity).toFixed(2)}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-lg font-normal uppercase tracking-wide">Total</span>
                        <span className="text-2xl font-normal">${(cart.total_price / 100).toFixed(2)}</span>
                    </div>

                    <p className="mt-4 text-xs font-light text-gray-600">
                        Total items: {cart.total_items}
                    </p>
                </div>

                {/* Delivery Date Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-light">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="deliveryDate" className="block text- font-light uppercase tracking-wide mb-2">
                            Delivery Date
                        </label>
                        <input
                            id="deliveryDate"
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                        />
                        <p className="mt-2 text-xs font-light text-gray-600">
                            Select your preferred delivery date (must be in the future)
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/menu')}
                            className="flex-1 bg-white text-black border border-black py-4 text-sm font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors"
                        >
                            Back to Menu
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 bg-black text-white py-4 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
