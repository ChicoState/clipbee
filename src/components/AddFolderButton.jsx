import React from 'react';

export default function AddFolderButton({ folders, setActiveFolder }) {
    const handleAddFolder = () => {
        const name = prompt("Enter new folder name:");
        if (!name) return;
        if (folders.some(folder => folder === name)) {
            alert("Folder already exists!");
            return;
        }
        else{
            chrome.runtime.sendMessage({ action: 'ADD_FOLDER', folderName: name });
        }
    };

    return (
        <button
            onClick={handleAddFolder}
            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">
            + Add Folder
        </button>
    );
};
