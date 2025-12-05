import { useState, useEffect } from 'react';
import { ChevronDown, X as CloseIcon } from 'lucide-react';
import type { NumericFilters } from '../hooks/useTableFilters';

interface NutritionFiltersProps {
    filters: NumericFilters;
    onFilterChange: (field: keyof NumericFilters, min?: number, max?: number) => void;
    onClearAll: () => void;
    activeCount: number;
}

interface FilterField {
    key: keyof NumericFilters;
    label: string;
    min: number;
    max: number;
    step?: number;
    unit?: string;
}

const FILTER_FIELDS: FilterField[] = [
    { key: 'calories', label: 'Calories', min: 0, max: 1500, unit: 'kcal' },
    { key: 'protein', label: 'Protein', min: 0, max: 150, unit: 'g' },
    { key: 'carbs', label: 'Carbs', min: 0, max: 150, unit: 'g' },
    { key: 'fat', label: 'Fat', min: 0, max: 100, unit: 'g' },
    { key: 'price', label: 'Price', min: 0, max: 50, step: 0.01, unit: '$' },
];

export default function NutritionFilters({
    filters,
    onFilterChange,
    onClearAll,
    activeCount,
}: NutritionFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Local state for inputs (not applied until "Apply" is clicked)
    const [localFilters, setLocalFilters] = useState<NumericFilters>(filters);

    // Sync local filters with parent filters when they change externally (e.g., clear all)
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleToggle = () => {
        if (isMobile) {
            setIsMobileDrawerOpen(!isMobileDrawerOpen);
        } else {
            setIsOpen(!isOpen);
        }
    };

    const handleLocalMinChange = (field: keyof NumericFilters, value: string) => {
        const numValue = value === '' ? undefined : Number(value);
        setLocalFilters((prev) => ({
            ...prev,
            [field]: { ...prev[field], min: numValue },
        }));
    };

    const handleLocalMaxChange = (field: keyof NumericFilters, value: string) => {
        const numValue = value === '' ? undefined : Number(value);
        setLocalFilters((prev) => ({
            ...prev,
            [field]: { ...prev[field], max: numValue },
        }));
    };

    const handleApply = () => {
        // Read all input values from DOM before applying
        const tempFilters: NumericFilters = {};

        FILTER_FIELDS.forEach((field) => {
            const minInput = document.querySelector(`input[data-filter="${field.key}-min"]`) as HTMLInputElement;
            const maxInput = document.querySelector(`input[data-filter="${field.key}-max"]`) as HTMLInputElement;

            const minValue = minInput?.value ? Number(minInput.value) : undefined;
            const maxValue = maxInput?.value ? Number(maxInput.value) : undefined;

            if (minValue !== undefined || maxValue !== undefined) {
                tempFilters[field.key] = { min: minValue, max: maxValue };
            }
        });

        // Update local state
        setLocalFilters(tempFilters);

        // Clear all existing filters first
        FILTER_FIELDS.forEach((field) => {
            onFilterChange(field.key, undefined, undefined);
        });

        // Then apply new filters
        Object.entries(tempFilters).forEach(([field, range]) => {
            onFilterChange(field as keyof NumericFilters, range?.min, range?.max);
        });

        // Close mobile drawer after applying
        if (isMobile) {
            setIsMobileDrawerOpen(false);
        }
    };

    const handleClear = () => {
        setLocalFilters({});
        onClearAll();

        // Also clear DOM inputs
        FILTER_FIELDS.forEach((field) => {
            const minInput = document.querySelector(`input[data-filter="${field.key}-min"]`) as HTMLInputElement;
            const maxInput = document.querySelector(`input[data-filter="${field.key}-max"]`) as HTMLInputElement;
            if (minInput) minInput.value = '';
            if (maxInput) maxInput.value = '';
        });
    };

    const FilterContent = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-normal uppercase tracking-wide">Nutrition & Price Filters</h3>
            </div>

            {FILTER_FIELDS.map((field) => {
                const rangeFilter = localFilters[field.key];
                return (
                    <div key={field.key} className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-light text-gray-600 mb-1">
                                {field.label} Min {field.unit && `(${field.unit})`}
                            </label>
                            <input
                                type="number"
                                min={field.min}
                                max={field.max}
                                step={field.step || 1}
                                defaultValue={rangeFilter?.min ?? ''}
                                data-filter={`${field.key}-min`}
                                key={`${field.key}-min-${rangeFilter?.min}`}
                                onBlur={(e) => handleLocalMinChange(field.key, e.target.value)}
                                placeholder={String(field.min)}
                                className="w-full px-3 py-2 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-light text-gray-600 mb-1">
                                {field.label} Max {field.unit && `(${field.unit})`}
                            </label>
                            <input
                                type="number"
                                min={field.min}
                                max={field.max}
                                step={field.step || 1}
                                defaultValue={rangeFilter?.max ?? ''}
                                data-filter={`${field.key}-max`}
                                key={`${field.key}-max-${rangeFilter?.max}`}
                                onBlur={(e) => handleLocalMaxChange(field.key, e.target.value)}
                                placeholder={String(field.max)}
                                className="w-full px-3 py-2 border border-black text-sm font-light focus:outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                    </div>
                );
            })}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                    onClick={handleClear}
                    className="flex-1 border border-black bg-white text-black py-2 text-sm font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={handleApply}
                    className="flex-1 bg-black text-white py-2 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors"
                >
                    Apply Filters
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Filter Toggle Button */}
            <button
                onClick={handleToggle}
                className="border border-black bg-white px-4 py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
                Filters
                {activeCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-black text-white text-xs rounded-full">
                        {activeCount}
                    </span>
                )}
                <ChevronDown
                    size={16}
                    strokeWidth={1.5}
                    className={`transition-transform ${isOpen && !isMobile ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Desktop: Collapsible Panel */}
            {!isMobile && isOpen && (
                <div className="border border-black p-6 bg-white">
                    <FilterContent />
                </div>
            )}

            {/* Mobile: Drawer */}
            {isMobile && isMobileDrawerOpen && (
                <>
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setIsMobileDrawerOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black p-6 z-50 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-normal uppercase tracking-wide">Filters</h3>
                            <button
                                onClick={() => setIsMobileDrawerOpen(false)}
                                className="text-black hover:text-gray-600 transition-colors"
                            >
                                <CloseIcon size={20} strokeWidth={1.5} />
                            </button>
                        </div>
                        <FilterContent />
                        <button
                            onClick={handleApply}
                            className="w-full mt-6 bg-black text-white py-3 text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
