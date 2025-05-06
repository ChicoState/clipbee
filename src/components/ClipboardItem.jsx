import React from 'react';
import DeleteMultipleCheckbox from './DeleteMultipleCheckbox';
import DeleteButton from './DeleteButton';

export default function ClipboardItem({ item, deleteMultipleMode, selectedItems, setSelectedItems }) {
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
                    key={item.index}
                    onClick={() => copyToClipboard(item.item)}
                    className="w-4/5"
                    data-testid="clipboard-item"
                >
                    <div className="p-2 truncate">{item.item}</div>
                </li>
                {deleteMultipleMode ? (<DeleteMultipleCheckbox item={item.item} selectedItems={selectedItems} setSelectedItems={setSelectedItems} />) : (
                <DeleteButton
                    item={item}
                />
                )}
            </div>
        </div>
    )
}