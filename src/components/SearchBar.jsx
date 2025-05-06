import React from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery }) {
    return (
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search clipboard history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 pr-4 py-1.5 w-full text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
    )
};