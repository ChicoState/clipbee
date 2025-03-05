import React, { useEffect, useState } from 'react';
const ITEMSPERPAGE = 5;

function App() {

  function sendClearHistory() {
    chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLEAR_HISTORY' });
    setClipboardHistory(['']);
  }

  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [clipboardPage, setClipboardPage] = useState(0);

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

  return (
      <div className="h-auto w-[300px] bg-white shadow-lg">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Clipbee</h3>
          <button
              onClick={openSidePanel}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Open Side Panel
          </button>
        </div>

        <h4 className="font-semibold mt-4">Current Clipboard</h4>
        <div className="p-2 bg-gray-100 rounded">
          <p className="truncate">{clipboardHistory[0]}</p>
        </div>

        {clipboardHistory.length - 1 > 0 &&
            <div className="clipboard-history mt-4">
              <h4 className="font-semibold">Clipboard History</h4>
              {clipboardHistory.length - 1 > ITEMSPERPAGE ? (
                  <>
                    <ul className="mt-2 space-y-2">
                      {clipboardHistory.slice((clipboardPage * ITEMSPERPAGE) + 1, ((clipboardPage + 1) * ITEMSPERPAGE) + 1).map((item, index) => (
                          <li key={index}
                              onClick={() => copyToClipboard(item)}
                              className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">
                            <div className="truncate">{item}</div>
                          </li>
                      ))}
                    </ul>
                    <div className="flex space-x-2 mt-4">
                      <button
                          onClick={() => setClipboardPage(clipboardPage - 1)}
                          disabled={clipboardPage === 0}
                          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50">
                        Previous Page
                      </button>
                      <button
                          onClick={() => setClipboardPage(clipboardPage + 1)}
                          disabled={clipboardHistory.length - 1 <= ((clipboardPage+1) * ITEMSPERPAGE)}
                          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded disabled:opacity-50">
                        Next Page
                      </button>
                    </div>
                  </>
              ) : (
                  <ul className="mt-2 space-y-2">
                    {clipboardHistory.slice(1, clipboardHistory.length).map((item, index) => (
                        <li key={index}
                            onClick={() => copyToClipboard(item)}
                            className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer">
                          <div className="truncate">{item}</div>
                        </li>
                    ))}
                  </ul>
              )
              }
              <button
                  onClick={sendClearHistory}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                Clear History
              </button>
            </div>
        }
      </div>
      </div>
  );
}

export default App;