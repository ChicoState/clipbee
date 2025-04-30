import { useEffect, useState } from 'react';

const ITEMSPERPAGE = 5;

export const useClipboardData = () => {
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [clipboardPage, setClipboardPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [folders, setFolders] = useState([{ name: "Default" }, { name: "Work" }]);
  const [activeFolder, setActiveFolder] = useState("Default");

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'GET_FOLDERS' }, (response) => {
      if (!chrome.runtime.lastError) {
        setFolders(response.folders || [{ name: 'Default' }]);
        setActiveFolder(response.activeFolder || 'Default');
      }
    });

    const messageListener = (message) => {
      if (message.type === 'CLIPBOARD_HISTORY') setClipboardHistory(message.data);
      if (message.type === 'FOLDER_UPDATE') setFolders(message.folders.map(name => ({ name })));
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const filteredAndSortedHistory = () => {
    const items = clipboardHistory.slice(1);
    const filtered = items.filter(item =>
      item && item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return sortOrder === 'oldest' ? [...filtered].reverse() : filtered;
  };

  const pagedItems = () => {
    const items = filteredAndSortedHistory();
    return items.slice(clipboardPage * ITEMSPERPAGE, (clipboardPage + 1) * ITEMSPERPAGE);
  };

  const getHistoryItems = () => {
    if (clipboardHistory.length <= 1) return [];
    return clipboardHistory.slice(1);
  };

  return {
    clipboardHistory,
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
    getHistoryItems,
  };
};
