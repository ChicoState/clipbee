import React, { useEffect, useState } from 'react';
import { useClipboardModel } from './Popup/useClipboardData.jsx';
import { Search, Clock, ArrowUpDown, Trash, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { app } from './firebaseConfig';
import Background from "./components/Background.jsx";
import DeleteButton from './components/DeleteButton.jsx';
import DeleteMultipleButton from './components/DeleteMultpleButton.jsx';

const ITEMSPERPAGE = 5;

const auth = getAuth(app);

const Main = () => {
  const navigate = useNavigate();
  const [deleteMultipleMode, setDeleteMultipleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const {clipboardHistory,
    clipboardPage,
    setClipboardPage,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    folders,
    activeFolder,
    setActiveFolder,
    setFolders,
    setClipboardHistory,
    filteredAndSortedHistory,
    pagedItems,
    getHistoryItems
    } = useClipboardModel();

  

  function sendClearHistory() {
    chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLEAR_HISTORY' });
    setClipboardHistory([]);
  }
  
  function sendRemoveSingleItem(item) {
    chrome.runtime.sendMessage({ target: 'service-worker', action: 'REMOVE_SINGLE_ITEM', item });
    setClipboardHistory(clipboardHistory.filter(item => item !== item));
  }

  // Set the active folder and load its history
  const changeFolder = (folder) => {
    setActiveFolder(folder);
    chrome.runtime.sendMessage({ action: 'SET_ACTIVE_FOLDER', Folder: folder });
  };
  const handleAddFolder = () => {
    const name = prompt("Enter new folder name:");
    if (!name) return;
    if (folders.some(f => f.name === name)) {
      alert("Folder already exists!");
      return;
    }
    chrome.runtime.sendMessage({ action: 'ADD_FOLDER', folderName: name }
      , () => {
        setFolders((prev) => [...prev, { name }]);
        changeFolder(name);
      });
  };

  // Function to open the side panel
  const openSidePanel = async () => {
    try {
      // Get the current window ID
      const currentWindow = await chrome.windows.getCurrent();

      // Send message to background script to open side panel
      chrome.runtime.sendMessage({
        target: 'service-worker',
        action: 'OPEN_SIDEPANEL',
        windowId: currentWindow.id
      });
    } catch (error) {
      console.error('Error opening side panel:', error);
    }
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

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
  };

  // Get current clipboard item (always the first item)
  const currentClipboardItem = clipboardHistory.length > 0 ? clipboardHistory[0] : '';

  // Calculate total pages
  const getTotalPages = () => {
    const filteredItems = filteredAndSortedHistory();
    return Math.ceil(filteredItems.length / ITEMSPERPAGE);
  };

  // Handle page change
  const handlePreviousPage = () => {
    setClipboardPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setClipboardPage(prev => {
      const totalPages = getTotalPages();
      return prev + 1 < totalPages ? prev + 1 : prev;
    });
  };

  //Signs user out
  const handleSignOut = async () => {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      await signOut(auth);
      console.log("User signed out successfully");
      //chrome.runtime.sendMessage({ type: 'SIGN_OUT' });
      chrome.runtime.sendMessage({
        target: 'service-worker',
        action: 'CLOSE_SIDEPANEL',
        windowId: currentWindow.id
      });
      //Send user back to start page
      navigate('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Reset page when search changes
  useEffect(() => {
    setClipboardPage(0);
  }, [searchQuery]);

  const displayItems = pagedItems();
  const totalPages = getTotalPages();
  const totalFilteredItems = filteredAndSortedHistory().length;

  return (
    <Background>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold">Clipbee</h3>
        </div>
        <div className="space-x-2">
          <button
            onClick={openSidePanel}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Open Side Panel
          </button>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
            Sign Out
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
          className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded">
          + Add Folder
        </button>
      </div>

      {/* Current Clipboard */}
      <h4 className="font-semibold mt-4">Current Clipboard</h4>
      <div className="p-2 bg-gray-100 rounded">
        <p className="truncate">{currentClipboardItem}</p>
      </div>

      {/* Clipboard History */}
      <div className="clipboard-history mt-4">
        <div className="flex justify-between items-center">
          <h4 className="font-semibold">Clipboard History</h4>
          <button
            onClick={toggleSortOrder}
            className="flex items-center space-x-1 text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
            <Clock className="h-3 w-3" />
            <span>{sortOrder === 'newest' ? 'Newest' : 'Oldest'}</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
          <button onClick={() => setDeleteMultipleMode(!deleteMultipleMode)} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
            {deleteMultipleMode ? 'Cancel' : 'Delete Multiple'}
          </button>
        </div>

        {/* Search Input */}
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

        <div className="text-xs text-gray-600 mt-1 mb-2">
          {totalFilteredItems} {totalFilteredItems === 1 ? 'item' : 'items'} found
        </div>


        {displayItems.length > 0 ? (
          <>
          <ul className="mt-2 space-y-2">
            {displayItems.map((item, index) => (
              <div className='p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer'>
                <div className='flex justify-between'>
                  {deleteMultipleMode && (
                    <div className="pr-2" onClick={(e) => {
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
                  )}
                  <li
                    key={index}
                    onClick={() => copyToClipboard(item)}
                    className="w-4/5">
                    <div className="p-2 truncate">{item}</div>
                  </li>
                  <DeleteButton item={item} sendRemoveSingleItem={sendRemoveSingleItem} />
                </div>
              </div>
            ))}
          </ul>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={clipboardPage === 0}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50 text-sm">
                    Previous
                </button>
                <span className="text-sm">
                    Page {clipboardPage + 1} of {totalPages}
                </span>
                <button
                    onClick={handleNextPage}
                    disabled={clipboardPage + 1 >= totalPages}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50 text-sm">
                    Next
                </button>
            </div>
        )}
        </>
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            {getHistoryItems().length === 0 ? "No clipboard history yet" : "No matching clipboard items found"}
          </p>
        )}

        {deleteMultipleMode && (
          <DeleteMultipleButton 
            selectedItems={selectedItems}>
          </DeleteMultipleButton>
        )}

        {getHistoryItems().length > 0 && (
          <button
            onClick={sendClearHistory}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
            Clear History
          </button>
        )}
      </div>
    </Background>
  );
}

export default Main;