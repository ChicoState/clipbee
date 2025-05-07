import React from 'react';

export default function ClearHistoryButton({ setClipboardHistory }) {  
    function sendClearHistory() {
        chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLEAR_HISTORY' });
        setClipboardHistory([]);
    };

    return (
        <button
            onClick={sendClearHistory}
            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
            Clear History
          </button>
    )
}