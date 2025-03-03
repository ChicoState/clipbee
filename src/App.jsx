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
  }, []);
  
  return (
    <div>
      <h3>Clipbee</h3>
      <h4>Current Clipboard</h4>
      <p>{clipboardHistory[0]}</p>
      {clipboardHistory.length - 1 > 0 &&
        <div className="clipboard-history">
          <h4>Clipboard History</h4>
          {clipboardHistory.length - 1 > ITEMSPERPAGE ? (
            <>
            <ul>
              {clipboardHistory.slice((clipboardPage * ITEMSPERPAGE) + 1, ((clipboardPage + 1) * ITEMSPERPAGE) + 1).map((item, index) => (
              <li key={index}>{item}</li>
             ))}
            </ul>
            <button onClick={() => setClipboardPage(clipboardPage - 1) } disabled={clipboardPage === 0}>Previous Page</button>
            <button onClick={() => setClipboardPage(clipboardPage + 1)} disabled={clipboardHistory.length - 1 <= ((clipboardPage+1) * ITEMSPERPAGE)}>Next Page</button>
          </>
          ) : (
            <ul>
              {clipboardHistory.slice(1, clipboardHistory.length).map((item, index) => (
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
