import React, { useState } from 'react';

export default function AddFolderButton({ folders }) {
    const [addingFolder, setAddingFolder] = useState(false);
    const [folderName, setFolderName] = useState('');
    const handleAddFolder = () => {
        setAddingFolder(false);
        if (folders.some(folder => folder === folderName)) {
            alert("Folder already exists!");
            setFolderName('');
            return;
        }
        else {
            chrome.runtime.sendMessage({ action: 'ADD_FOLDER', folderName: folderName });
            setFolderName('');
        }
    };
    return (
        addingFolder ? (
            <div className="flex flex-col col-span-2 items-center justify-center">
                <input
                    type="text"
                    placeholder="Enter new folder name:"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="p-2 mb-2 border bg-white hover:bg-gray-100 border-gray-300 rounded"
                />
                {folderName ? (
                    <button
                        onClick={handleAddFolder}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1.5 border border-blue-700 rounded">
                        Add
                    </button>
                ) : (
                    <button
                        onClick={() => setAddingFolder(false)}
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-1.5 border border-red-700 rounded">
                        Cancel
                    </button>
                )}
            </div>
        ) : (
            <button
                data-testid="add-folder-button"
                onClick={() => setAddingFolder(true)}
                className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">
                + Add Folder
            </button>
        )
    );
};
