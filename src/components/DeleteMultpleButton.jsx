import React from 'react';
import { Trash } from 'lucide-react';

export default function DeleteMultipleButton({ selectedItems, setSelectedItems, setDeleteMultipleMode }) {

    const deleteMultipleItems = () => {
        const itemsToDelete = Array.from(selectedItems);
        if (itemsToDelete.length > 0) {
            sendRemoveMultipleItems(itemsToDelete);
            setSelectedItems(new Set());
        }
        setDeleteMultipleMode(false);
    };

    function sendRemoveMultipleItems(items) {
        chrome.runtime.sendMessage({ target: 'service-worker', action: 'REMOVE_MULTIPLE_ITEMS', data: items });
    }

    return (
        <div className="mt-4 flex justify-center">
            <button
                data-testid="delete-multiple-button"
                onClick={deleteMultipleItems}
                className={`px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 flex items-center ${selectedItems.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={selectedItems.size === 0}
            >
                <Trash className="mr-2 h-5 w-5" />
                Delete {selectedItems.size} {selectedItems.size === 1 ? 'Item' : 'Items'}
            </button>
        </div>
    );
}
