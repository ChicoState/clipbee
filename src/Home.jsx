import React, { useState } from 'react';
import { useClipboardData } from './Popup/useClipboardData.jsx';
import Background from "./components/Background.jsx";
import ClipboardItem from './components/ClipboardItem.jsx';
import DeleteMultipleButton from './components/DeleteMultpleButton.jsx';
import SidePanelButton from './components/SidePanelButton.jsx';
import SignOutButton from './components/SignOutButton.jsx';
import ClearHistoryButton from './components/ClearHistoryButton.jsx';
import ToggleDeleteMultipleButton from './components/ToggleDeleteMultipleButton.jsx';
import SortHistoryButton from './components/SortHistoryButton.jsx';
import DetachedWindowButton from './components/DetachedWindowButton.jsx';
import AddFolderButton from './components/AddFolderButton.jsx';
import FolderSelector from './components/FolderSelector.jsx';
import SearchBar from './components/SearchBar.jsx';

const Main = () => {
  const [deleteMultipleMode, setDeleteMultipleMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const {clipboardHistory,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    folders,
    activeFolder,
    setActiveFolder,
    setClipboardHistory,
    getFilteredSortedHistory,
    getHistoryItems
    } = useClipboardData();


  // Get current clipboard item (always the first item)
  const currentClipboardItem = clipboardHistory.length > 0 ? clipboardHistory[0] : '';
  const displayItems = getFilteredSortedHistory().slice(0, 5);
  const totalFilteredItems = getFilteredSortedHistory().length;

  return (
    <Background>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xl font-bold">Clipbee</h3>
        </div>
        <div className="space-x-2">
          <SidePanelButton />
          <DetachedWindowButton />
          <SignOutButton />
        </div>
      </div>

      {/* Folder Selector */}
      <div className="mt-2 flex justify-between items-center">
        <FolderSelector folders={folders} activeFolder={activeFolder} setActiveFolder={setActiveFolder} />
        <AddFolderButton folders={folders} setActiveFolder={setActiveFolder} />
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

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="text-xs text-gray-600 mt-1 mb-2">
          {totalFilteredItems} {totalFilteredItems === 1 ? 'item' : 'items'} found
        </div>

        {displayItems.length > 0 ? (
          <>
          <ul className="mt-2 space-y-2">
            {displayItems.map((item) => (
              <ClipboardItem
                item={item}
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