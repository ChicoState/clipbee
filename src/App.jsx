import React, { useEffect, useState } from 'react';
const ITEMSPERPAGE = 1;

function App() {

  function sendClearHistory() {
    chrome.runtime.sendMessage({ target: 'service-worker', action: 'CLEAR_HISTORY' });
    setClipboardHistory([]);
    setClipboardContent('');
  }

  const [clipboardContent, setClipboardContent] = useState('');
  const [clipboardHistory, setClipboardHistory] = useState([]);
  const [clipboardPage, setClipboardPage] = useState(0);

  useEffect(() => {
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
  }, []);
  
  return (
    <div>
      <h3>Clipbee</h3>
      <h4>Current Clipboard</h4>
      <p>{clipboardContent}</p>
      <h4>Clipboard History</h4>
      {clipboardHistory.length > 0 &&
        <div className="clipboard-history">
          {clipboardHistory.length > ITEMSPERPAGE ? (
            <>
            <ul>
              {clipboardHistory.slice(clipboardPage * ITEMSPERPAGE, (clipboardPage + 1) * ITEMSPERPAGE).map((item, index) => (
              <li key={index}>{item}</li>
             ))}
            </ul>
            {clipboardPage > 0 &&
              <button onClick={() => setClipboardPage(clipboardPage - 1)}>Previous Page</button>
            }
            {clipboardHistory.length > (clipboardPage + 1) * ITEMSPERPAGE &&
              <button onClick={() => setClipboardPage(clipboardPage + 1)}>Next Page</button>
            }
          </>
          ) : (
            <ul>
              {clipboardHistory.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )
        }
        <button onClick={sendClearHistory}>Clear History</button>
        </div>
      }
    </div>
  );
}

export default App;
