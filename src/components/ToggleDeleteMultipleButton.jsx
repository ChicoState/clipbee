import React from 'react';

export default function ToggleDeleteMultipleButton({ deleteMultipleMode, setDeleteMultipleMode }) {
    return (
        <button onClick={() => setDeleteMultipleMode(!deleteMultipleMode)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
            {deleteMultipleMode ? 'Cancel' : 'Delete Multiple'}
          </button>
    )
}
