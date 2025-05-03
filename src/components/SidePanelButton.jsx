import React from 'react';

export default function SidePanelButton() {
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
    return (
        <button
            onClick={openSidePanel}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Open Side Panel
        </button>
    );
}