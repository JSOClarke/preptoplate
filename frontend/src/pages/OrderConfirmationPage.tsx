import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import type { Order } from '../types/order';

export default function OrderConfirmationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const order = (location.state as any)?.order as Order | undefined;

    useEffect(() => {
        // Redirect to menu if no order data
        if (!order) {
            navigate('/menu');
        }
    }, [order, navigate]);

    if (!order) {
        return null;
    }

    const deliveryDate = new Date(order.delivery_date);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-white py-16">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Success Icon */}
                <div className="mb-8">
                    <div className="w-20 h-20 mx-auto bg-green-100 border-2 border-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-4xl font-thin tracking-tight mb-4">Order Confirmed!</h1>
                <p className="text-sm font-light text-gray-600 uppercase tracking-wide mb-12">
                    Order #{order.id}
                </p>

                {/* Order Details */}
                <div className="border border-black p-8 mb-8 text-left">
                    <h2 className="text-xl font-normal mb-6 uppercase tracking-wide text-center">Order Details</h2>

                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                            <span className="font-light text-gray-600 uppercase text-xs">Delivery Date:</span>
                            <span className="font-normal">{deliveryDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-light text-gray-600 uppercase text-xs">Status:</span>
                            <span className="font-normal capitalize">{order.status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-light text-gray-600 uppercase text-xs">Total Items:</span>
                            <span className="font-normal">{order.items.length}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 mb-6">
                        <h3 className="text-sm font-normal uppercase tracking-wide mb-4">Items:</h3>
                        <div className="space-y-3">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-normal">{item.meal.name}</p>
                                        <p className="text-xs font-light text-gray-600">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-light">${(item.price / 100).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                        <span className="text-lg font-normal uppercase tracking-wide">Total:</span>
                        <span className="text-2xl font-normal">${(order.total_price / 100).toFixed(2)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <p className="text-sm font-light text-gray-600">
                        We'll prepare your meals and deliver them on {deliveryDate.toLocaleDateString()}.
                    </p>
                    <Link
                        to="/menu"
                        className="inline-block bg-black text-white px-12 py-4 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors"
                    >
                        Back to Menu
                    </Link>
                </div>
            </div>
        </div>
    );
}
