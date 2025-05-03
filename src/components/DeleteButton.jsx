import React, { useState } from 'react';
import { Trash } from 'lucide-react';

const DeleteButton = ({ item, clipboardHistory, setClipboardHistory}) => {
    const [deleteButtonHover, setDeleteButtonHover] = useState(false);

    function sendRemoveSingleItem(item) {
        chrome.runtime.sendMessage({ target: 'service-worker', action: 'REMOVE_SINGLE_ITEM', item });
        // disregard current clipboard item
        const newClipboardHistory = clipboardHistory.slice(1);
        setClipboardHistory(newClipboardHistory.filter(item => item !== item));
    }

    return (
        <button
            onClick={() => sendRemoveSingleItem(item)}
            onMouseEnter={() => setDeleteButtonHover(true)}
            onMouseLeave={() => setDeleteButtonHover(false)}
        >
            {deleteButtonHover ? <Trash color='red' className='h-5 w-5 scale-125' /> : <Trash color="black" className='h-5 w-5' />}
        </button>
    );
}

export default DeleteButton;