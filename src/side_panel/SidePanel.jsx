import React, { useEffect, useState } from 'react';
import Dropzone from "../components/Dropzone.jsx";

function SidePanel() {
    const [clipboardHistory, setClipboardHistory] = useState([]);

    function sendClearHistory() {
        chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLEAR_HISTORY' });
        setClipboardHistory(['']);
    }

    useEffect(() => {
        // Get clipboard history from background script
        chrome.runtime.sendMessage({
            target: 'service-worker',
            action: 'CLIPBOARD_HISTORY_REACT_LOAD'
        });

        // Listen for updates from background script
        const messageListener = (message) => {
            if (message.type === 'CLIPBOARD_HISTORY') {
                setClipboardHistory(message.data);
            }
        };

        chrome.runtime.onMessage.addListener(messageListener);

        // Clean up listener
        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

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

    return (
        <div className="p-1 w-auto h-full bg-white m-2">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Clipbee</h3>
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
            <div className="mb-4">
                <h4 className="font-semibold mt-2">Current Clipboard</h4>
                <p className="p-2 bg-gray-100 rounded truncate">{clipboardHistory[0]}</p>
            </div>

            <Dropzone />

            <div className="mt-2">
                <h3 className="text-lg font-semibold mb-2">Recent Clipboard Items</h3>
                {clipboardHistory.length > 0 ? (
                    <ul className="space-y-2">
                        {clipboardHistory.map((item, index) => (
                            <li
                                key={index}
                                className="p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                                onClick={() => copyToClipboard(item)}>
                                <div className="truncate">{item}</div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No clipboard history yet</p>
                )}
            </div>
        </div>
    );
}

export default SidePanel;