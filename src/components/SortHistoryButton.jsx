import React from "react";
import { Clock, ArrowUpDown } from "lucide-react";

export default function SortHistoryButton({ sortOrder, setSortOrder }) {
  return (
    <button
        data-testid="sort-history-button"
        onClick={() => (setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest'))}
        className="flex items-center space-x-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
        <Clock className="h-3 w-3" />
        <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
        <ArrowUpDown className="h-3 w-3" />
    </button>
  );
}