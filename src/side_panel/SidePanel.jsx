import React, { useEffect, useState } from 'react';
import Dropzone from "../components/Dropzone.jsx";
import { Search, Clock, ArrowUpDown } from "lucide-react";

function SidePanel() {
    const [clipboardHistory, setClipboardHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [isSignedIn, setIsSignedIn] = useState(true);
    const [folders, setFolders] = useState([{ name: "Default" }, { name: "Work" }]);  // Updated to support folders
    const [activeFolder, setActiveFolder] = useState("Default");  // Track active folder



    function sendClearHistory() {
        chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLEAR_HISTORY' });
        setClipboardHistory([]);
    }

    useEffect(() => {
        // Fetch folders on mount
        chrome.runtime.sendMessage({ action: 'GET_FOLDERS' }, (response) => {
            setFolders(response.folders || [{ name: 'Default' }]);
            setActiveFolder(response.activeFolder || 'Default');
        });
    
        // Fetch clipboard history on mount
        chrome.runtime.sendMessage({ action: 'GET_CLIPBOARD_HISTORY' }, (response) => {
            setClipboardHistory(response.history || []);
        });
    
        // Listener for updates
        const messageListener = (message) => {
            if (message.type === 'CLIPBOARD_HISTORY') {
                setClipboardHistory(message.data);
            }
            if (message.type === 'FOLDER_UPDATE') {
                setFolders(message.folders.map(folder => ({ name: folder })));
                setActiveFolder(message.activeFolder);
            }
        };
        chrome.runtime.onMessage.addListener(messageListener);
    
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    // Set the active folder and load its history
    const changeFolder = (folder) => {
        setActiveFolder(folder);
        chrome.runtime.sendMessage({ action: 'SET_ACTIVE_FOLDER', folder });
    };
    
    const handleAddFolder = () => {
        const name = prompt("Enter new folder name:");
        if (!name) return;
        if (folders.some(f => f.name === name)) {
            alert("Folder already exists!");
            return;
        }
        // Send the folder creation message to the background
        chrome.runtime.sendMessage({ action: 'ADD_FOLDER', folderName: name });
    };
       

    // Function to copy item to clipboard
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('Text copied to clipboard');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
            });
    };

    const openPopup = async () => {
        try {
            // Send message to background script to open popup
            chrome.runtime.sendMessage({
                target: 'service-worker',
                action: 'OPEN_POPUP',
            });
        } catch (error) {
            console.error('Error opening popup:', error);
        }
    };

    const toggleSortOrder = () => {
        setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
    };

    // Get current clipboard item (always the first item)
    const currentClipboardItem = clipboardHistory.length > 0 ? clipboardHistory[0] : '';

    // Get history items (all items except the first one)
    const getHistoryItems = () => {
        if (clipboardHistory.length <= 1) return [];
        return clipboardHistory.slice(1);
    };

    // Filter and sort history items
    const getFilteredSortedHistory = () => {
        // Get all history items (excluding current clipboard)
        const historyItems = getHistoryItems();

        // Filter by search query
        const filteredItems = historyItems.filter(item =>
            item && item.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Apply sorting
        if (sortOrder === 'oldest') {
            return [...filteredItems].reverse();
        }

        return filteredItems;
    };

    const displayItems = getFilteredSortedHistory();
    const totalFilteredItems = displayItems.length;

    //  if (!isSignedIn) {
    //     return null; // Return null to close the side panel when signed out

    // }

    return (
        <div className="relative p-1 w-auto h-full bg-yellow-100 m-2 rounded-lg border border-gray-400 shadow-lg">
            {/* Clipboard Clip */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-5 bg-gray-600 rounded-b-lg flex justify-center items-center">
                <div className="w-8 h-3 bg-gray-500 rounded-b-lg"></div>
            </div>

            {/* Top Section */}
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Clipbee</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={sendClearHistory}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                            Clear History
                        </button>
                        <button
                            onClick={openPopup}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                            Open Popup
                        </button>
                    </div>
                </div>

                {/* Folder Selector */}
                <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-semibold">Folder:</label>
                        <select
                            value={activeFolder}
                            onChange={(e) => changeFolder(e.target.value)}
                            className="text-sm border border-gray-300 rounded bg-white px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {folders.map((folder, index) => (
                                <option key={index} value={folder.name}>{folder.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAddFolder}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                    >
                        + Add Folder
                    </button>
                </div>
            </div>

            {/* Current Clipboard */}
            <div className="mb-4">
                <h4 className="font-semibold mt-2">Current Clipboard</h4>
                <p className="p-2 bg-gray-100 rounded truncate">{currentClipboardItem}</p>
            </div>

            {/* Dropzone */}
            <Dropzone />

            {/* Clipboard History */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Clipboard History</h3>
                    <button
                        onClick={toggleSortOrder}
                        className="flex items-center space-x-1 text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                        <Clock className="h-4 w-4" />
                        <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                        <ArrowUpDown className="h-3 w-3" />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-3">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search clipboard history..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 pr-4 py-2 w-full border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="text-sm text-gray-600 mb-2">
                    {totalFilteredItems} {totalFilteredItems === 1 ? 'item' : 'items'} found
                </div>

                {totalFilteredItems > 0 ? (
                    <ul className="space-y-2">
                        {displayItems.map((item, index) => (
                            <li
                                key={index}
                                className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                                onClick={() => copyToClipboard(item)}>
                                {item}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No clipboard history available.</p>
                )}
            </div>
        </div>
    );
}

export default SidePanel;