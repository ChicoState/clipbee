import React, { useEffect, useState } from 'react';
import { Search, Clock, ArrowUpDown } from 'lucide-react';
import {useNavigate } from 'react-router-dom';
import { getAuth,signOut } from 'firebase/auth';

import { app }from './firebaseConfig';
import Header from './components/Header.jsx'

const ITEMSPERPAGE = 5;

const auth = getAuth(app);

const Main = () => {
  const navigate = useNavigate();

  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [clipboardPage, setClipboardPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  function sendClearHistory() {
    chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLEAR_HISTORY' });
    setClipboardHistory(['']);
  }

  useEffect(() => {
    //on load get current clipboard content
    chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLIPBOARD_HISTORY_REACT_LOAD' });
    // listen for messages from service worker
    const messageListener = (message) => {
      if (message.type === 'CLIPBOARD_CURRENT') {
        setClipboardContent(message.data);
      }
      if (message.type === 'CLIPBOARD_HISTORY') {
        setClipboardHistory(message.data);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);

    // Clean up listener on unmount
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  

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
  
  // Get history items (all items except the first one)
  const getHistoryItems = () => {
    if (clipboardHistory.length <= 1) return [];
    return clipboardHistory.slice(1);
  };

  // Filter and sort history items
  const getFilteredAndSortedHistory = () => {
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

  // Get paginated items
  const getPagedItems = () => {
    const filteredAndSortedItems = getFilteredAndSortedHistory();
    const startIndex = clipboardPage * ITEMSPERPAGE;
    const endIndex = startIndex + ITEMSPERPAGE;

    return filteredAndSortedItems.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredItems = getFilteredAndSortedHistory();
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
             navigate('/start');
          } catch (error) {
            console.error("Error signing out:", error);
          }
    };

  // Reset page when search changes
  useEffect(() => {
    setClipboardPage(0);
  }, [searchQuery]);

  const displayItems = getPagedItems();
  const totalPages = getTotalPages();
  const totalFilteredItems = getFilteredAndSortedHistory().length;

  return (
    <div className="h-auto w-[320px] bg-yellow-100 shadow-lg rounded-lg border border-gray-300 relative">
    <div className="w-full h-6 bg-gray-700 rounded-t-lg flex justify-center items-center">
      <div className="w-12 h-4 bg-gray-500 rounded-b-lg">
      </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Header />
          <button
              onClick={openSidePanel}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Side Panel
          </button>
          <button
            onClick = {handleSignOut}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Sign Out
          </button>
        </div>

        <h4 className="font-semibold mt-4">Current Clipboard</h4>
          <div className="p-2 bg-gray-100 rounded">
            <p className="truncate">{currentClipboardItem}</p>
          </div>

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
            </div>

            {/* Search Input */}
            <div className="relative mt-2">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-500" />
              <input
                  type="text"
                  placeholder="Search clipboard history..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 pr-4 py-1.5 w-full text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"/>
            </div>

            <div className="text-xs text-gray-600 mt-1 mb-2">
              {totalFilteredItems} {totalFilteredItems === 1 ? 'item' : 'items'} found
            </div>

            {totalFilteredItems > 0 ? (
                <>
                  <ul className="mt-2 space-y-2">
                    {displayItems.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => copyToClipboard(item)}
                            className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">
                          <div className="truncate">{item}</div>
                        </li>
                    ))}
                  </ul>

                  {totalPages > 1 && (
                      <div className="flex space-x-2 mt-4 justify-between items-center">
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

            {getHistoryItems().length > 0 && (
                <button
                    onClick={sendClearHistory}
                    className="mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                  Clear History
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

export default Main;