import React from 'react';
import { PictureInPicture2 } from 'lucide-react';

export default function DetachedWindowButton() {
    // Function to open the detached window
    const openDetachedWindow = async () => {
        try {
          // Send message to background script to open window
          chrome.runtime.sendMessage({
            target: 'service-worker',
            action: 'OPEN_WINDOW',
          });
        } catch (error) {
          console.error('Error opening detached window:', error);
        }
      };

    return (
        <button
            onClick={openDetachedWindow}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            <PictureInPicture2 className="h-4 w-4" />
        </button>
    );
};