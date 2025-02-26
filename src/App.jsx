// React component (in your app.js or relevant component)
import React, { useEffect, useState } from 'react';

function App() {
  const [clipboardContent, setClipboardContent] = useState('');
  
  useEffect(() => {
    // listen for messages from service worker
    const messageListener = (message) => {
      if (message.type === 'CLIPBOARD_CHANGE') {
        setClipboardContent(message.data);
        console.log('Clipboard changed:', message.data);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);
  
  return (
    <div>
      <h3>Clipbee</h3>
      <p>{clipboardContent}</p>
    </div>
  );
}

export default App;