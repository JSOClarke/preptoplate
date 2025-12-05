import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
}

export default function SearchBar({
    value,
    onChange,
    placeholder = 'Search...',
    debounceMs = 300,
}: SearchBarProps) {
    const [localValue, setLocalValue] = useState(value);

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, debounceMs, onChange]);

    // Sync with external value changes
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <Search size={16} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-3 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
            />
            {localValue && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                    <X size={16} strokeWidth={1.5} />
                </button>
            )}
        </div>
    );
}
