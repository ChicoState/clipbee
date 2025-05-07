import React from 'react';

export default function OpenPopupButton() {
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
        <div className="mt-4 flex justify-center">
            <button
                onClick={openPopup}
                data-testid="open-popup-button"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Open Popup
            </button>
        </div>
    );
}