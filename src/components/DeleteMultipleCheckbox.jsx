import React from 'react';
import { CheckSquare, Square } from 'lucide-react';

export default function DeleteMultipleCheckbox({ item, selectedItems, setSelectedItems }) {
    const isSelected = Array.from(selectedItems).some(selectedItem => selectedItem.item === item.item && selectedItem.index === item.index);
    return (
        <div className="pr-" data-testid="delete-multiple-checkbox" onClick={(e) => {
            e.stopPropagation();
            if (isSelected) {
                setSelectedItems(new Set([...selectedItems].filter(selectedItem => !(selectedItem.item === item.item && selectedItem.index === item.index))));
            } else {
                setSelectedItems(new Set([...selectedItems, item]));
            }
        }}>
            {isSelected ?
                <CheckSquare className="w-5 h-5 text-blue-500" /> :
                <Square className="w-5 h-5 text-gray-400" />
            }
        </div>
    )
}
