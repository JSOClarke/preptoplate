import { X } from 'lucide-react';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    confirmText?: string; // Default: "Delete"
    cancelText?: string;  // Default: "Cancel"
}

export default function ConfirmDeleteModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    loading = false,
    confirmText = 'Delete',
    cancelText = 'Cancel',
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white border border-black p-8 max-w-md w-full mx-4">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-black hover:text-gray-600 transition-colors"
                >
                    <X size={20} strokeWidth={1.5} />
                </button>

                {/* Content */}
                <h2 className="text-xl font-normal uppercase tracking-wide mb-4">
                    {title}
                </h2>
                <p className="text-sm font-light mb-8">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 border border-black bg-white text-black py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 bg-black text-white py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
