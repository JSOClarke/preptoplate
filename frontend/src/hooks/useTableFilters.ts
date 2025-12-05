import { useState, useMemo } from 'react';

export interface NumericFilters {
    calories?: { min?: number; max?: number };
    protein?: { min?: number; max?: number };
    carbs?: { min?: number; max?: number };
    fat?: { min?: number; max?: number };
    price?: { min?: number; max?: number };
}

interface UseTableFiltersOptions<T> {
    data: T[];
    searchFields: (keyof T)[];
}

export function useTableFilters<T extends Record<string, any>>({
    data,
    searchFields,
}: UseTableFiltersOptions<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [numericFilters, setNumericFilters] = useState<NumericFilters>({});

    // Count active filters
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchTerm) count++;

        Object.values(numericFilters).forEach((filter) => {
            if (filter?.min !== undefined || filter?.max !== undefined) count++;
        });

        return count;
    }, [searchTerm, numericFilters]);

    // Filter data
    const filteredData = useMemo(() => {
        return data.filter((item) => {
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                const matchesSearch = searchFields.some((field) => {
                    const value = item[field];
                    return value && String(value).toLowerCase().includes(searchLower);
                });
                if (!matchesSearch) return false;
            }

            // Numeric filters
            for (const [field, range] of Object.entries(numericFilters)) {
                if (!range) continue;

                const value = item[field];
                if (value === undefined || value === null) continue;

                if (range.min !== undefined && value < range.min) return false;
                if (range.max !== undefined && value > range.max) return false;
            }

            return true;
        });
    }, [data, searchTerm, numericFilters, searchFields]);

    const updateNumericFilter = (field: keyof NumericFilters, min?: number, max?: number) => {
        setNumericFilters((prev) => ({
            ...prev,
            [field]: { min, max },
        }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setNumericFilters({});
    };

    return {
        searchTerm,
        setSearchTerm,
        numericFilters,
        updateNumericFilter,
        filteredData,
        activeFilterCount,
        clearFilters,
        totalCount: data.length,
        filteredCount: filteredData.length,
    };
}
