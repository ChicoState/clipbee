import React from 'react';
import DeleteMultipleCheckbox from './DeleteMultipleCheckbox';
import DeleteButton from './DeleteButton';

export default function ClipboardItem({ item, index, clipboardHistory, setClipboardHistory, deleteMultipleMode, selectedItems, setSelectedItems }) {
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
        <div className='p-2 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer'>
            <div className='flex justify-between'>
                <li
                    key={index}
                    onClick={() => copyToClipboard(item)}
                    className="w-4/5">
                    <div className="p-2 truncate">{item}</div>
                </li>
                {deleteMultipleMode ? (<DeleteMultipleCheckbox item={item} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />) : (
                <DeleteButton
                    item={item}
                    clipboardHistory={clipboardHistory}
                    setClipboardHistory={setClipboardHistory}
                />
                )}
            </div>
        </div>
    )
}