import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
    const [lastSearchResult, setLastSearchResult] = useState(null);

    const updateLastSearchResult = (newSearchResults) => {
        setLastSearchResult(newSearchResults);
    };

    return (
        <SearchContext.Provider value={{ lastSearchResult, updateLastSearchResult }}>
            {children}
        </SearchContext.Provider>
    );
};

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
};