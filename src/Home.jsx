import React, { useEffect, useState } from 'react';
import { useClipboardData } from './Popup/useClipboardData.jsx';
import { Search } from 'lucide-react';
import Background from "./components/Background.jsx";
import ClipboardItem from './components/ClipboardItem.jsx';
import DeleteMultipleButton from './components/DeleteMultpleButton.jsx';
import SidePanelButton from './components/SidePanelButton.jsx';
import SignOutButton from './components/SignOutButton.jsx';
import ClearHistoryButton from './components/ClearHistoryButton.jsx';
import ToggleDeleteMultipleButton from './components/ToggleDeleteMultipleButton.jsx';
import SortHistoryButton from './components/SortHistoryButton.jsx';

const Main = () => {
  const [deleteMultipleMode, setDeleteMultipleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const {clipboardHistory,
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
    } = useClipboardData();

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

  // Get current clipboard item (always the first item)
  const currentClipboardItem = clipboardHistory.length > 0 ? clipboardHistory[0] : '';

  // Reset page when search changes
  useEffect(() => {
    setClipboardPage(0);
  }, [searchQuery]);

  const displayItems = pagedItems();
  const totalFilteredItems = filteredAndSortedHistory().length;

  return (
    <Background>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold">Clipbee</h3>
        </div>
        <div className="space-x-2">
          <SidePanelButton />
          <SignOutButton />
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
          <SortHistoryButton sortOrder={sortOrder} setSortOrder={setSortOrder} />
          <ToggleDeleteMultipleButton
            deleteMultipleMode={deleteMultipleMode}
            setDeleteMultipleMode={setDeleteMultipleMode}
          />
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
              <ClipboardItem
                item={item}
                index={index}
                clipboardHistory={clipboardHistory}
                setClipboardHistory={setClipboardHistory}
                deleteMultipleMode={deleteMultipleMode}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
              />
            ))}
          </ul>
        </>
        ) : (
          <p className="text-sm text-gray-500 mt-2">
            {getHistoryItems().length === 0 ? "No clipboard history yet" : "No matching clipboard items found"}
          </p>
        )}

        {deleteMultipleMode && (
          <DeleteMultipleButton 
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            clipboardHistory={clipboardHistory}
            setClipboardHistory={setClipboardHistory}
            setDeleteMultipleMode={setDeleteMultipleMode}>
          </DeleteMultipleButton>
        )}

        {getHistoryItems().length > 0 && (<ClearHistoryButton setClipboardHistory={setClipboardHistory} />)}
      </div>
    </Background>
  );
}

export default Main;