import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

export default function DeleteMultipleCheckbox({ item, selectedItems, setSelectedItems }) {
    return (
        <div className="pr-" data-testid="delete-multiple-checkbox" onClick={(e) => {
            e.stopPropagation();
            // Toggle selection logic here
            const newSelectedItems = new Set(selectedItems);
            if (newSelectedItems.has(item)) {
                newSelectedItems.delete(item);
            } else {
                newSelectedItems.add(item);
            }
            setSelectedItems(newSelectedItems);
        }}>
            {selectedItems.has(item) ?
                <CheckSquare className="w-5 h-5 text-blue-500" /> :
                <Square className="w-5 h-5 text-gray-400" />
            }
        </div>
    )
}
