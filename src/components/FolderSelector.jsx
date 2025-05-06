import React from 'react';

export default function FolderSelector({ folders, activeFolder, setActiveFolder }) {
   const changeFolder = (folder) => {
        setActiveFolder(folder);
        chrome.runtime.sendMessage({ action: 'SET_ACTIVE_FOLDER', folder: folder });
    }; 

    return (
        <div className="flex items-center space-x-2">
            <label className="text-sm font-semibold">Folder:</label>
            <select
                value={activeFolder}
                onChange={(e) => changeFolder(e.target.value)}
                className="text-sm border border-gray-300 rounded bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
                {folders.map((folder, index) => (
                    <option key={index} value={folder}>{folder}</option>
                ))}
            </select>
        </div>
    );
}