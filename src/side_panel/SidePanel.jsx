import React, { useEffect, useState } from 'react';
import Dropzone from "../components/Dropzone.jsx";
import ClipboardItem from '../components/ClipboardItem.jsx';
import ToggleDeleteMultipleButton from '../components/ToggleDeleteMultipleButton.jsx';
import ClearHistoryButton from '../components/ClearHistoryButton.jsx';
import DeleteMultipleButton from '../components/DeleteMultpleButton.jsx';
import { useClipboardData } from '../Popup/useClipboardData.jsx';
import {displayFiles, removeFilefromFirestore, removeFilefromStorage, deleteFolderContents}  from '../Firebase/firebaseData.jsx';
import SortHistoryButton from '../components/SortHistoryButton.jsx';
import FolderSelector from '../components/FolderSelector.jsx';
import AddFolderButton from '../components/AddFolderButton.jsx';
import SearchBar from '../components/SearchBar.jsx';

function SidePanel() {
    const [deleteMultipleMode, setDeleteMultipleMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState(new Set());
    const {clipboardHistory,
        searchQuery,
        setSearchQuery,
        sortOrder,
        setSortOrder,
        folders,
        activeFolder,
        setActiveFolder,
        setClipboardHistory,
        getFilteredSortedHistory
    } = useClipboardData();
    const currentClipboardItem = clipboardHistory.length > 0 ? clipboardHistory[0] : '';
    const [fileList, setFileList] = useState([]);//Track files
    
    //Get the files from the folder
    async function fetchFiles() {
        //Run displayFiles to store all files names for displaying
        const files = await displayFiles(activeFolder);
        setFileList(files || []);
    }
    useEffect(() => {
        //If the folder is changed
        //new files updated
        if (activeFolder ) {
            fetchFiles();
        }
    }, [activeFolder]);

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

    const displayItems = getFilteredSortedHistory();
    const totalFilteredItems = displayItems.length;

    //format the remove button
    const removeButtonStyle = {
        backgroundColor: '#ff1744',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '15px',
        height: '15px',
        padding: '0',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: '1',
        display: 'flex',
      };

    return (
        <div className="relative p-1 w-auto h-full bg-yellow-100 m-2 rounded-lg border border-gray-400 shadow-lg">
            {/* Clipboard Clip */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-5 bg-gray-600 rounded-b-lg flex justify-center items-center">
                <div className="w-8 h-3 bg-gray-500 rounded-b-lg"></div>
            </div>

            {/* Top Section */}
            <div className="mb-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Clipbee</h3>
                    <div className="flex space-x-2">
                        <ClearHistoryButton setClipboardHistory={setClipboardHistory} />
                        <DeleteMultipleButton
                            selectedItems={selectedItems}
                            setSelectedItems={setSelectedItems}
                            setDeleteMultipleMode={setDeleteMultipleMode}
                        />
                        <button
                            onClick={openPopup}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
                            Open Popup
                        </button>
                    </div>
                </div>

                {/* Folder Selector */}
                <div className="mt-2 flex justify-between items-center">
                    <FolderSelector folders={folders} activeFolder={activeFolder} setActiveFolder={setActiveFolder} />
                    <AddFolderButton folders={folders} setActiveFolder={setActiveFolder} />
                </div>
            </div>

            {/* Current Clipboard */}
            <div className="mb-4">
                <h4 className="font-semibold mt-2">Current Clipboard</h4>
                <p className="p-2 bg-gray-100 rounded truncate">{currentClipboardItem}</p>
            </div>

            {/* Dropzone */}
            <Dropzone activeFolder={activeFolder} onPublish={() => fetchFiles()} />

            {/* Display the Files*/}
            <div className="p-4">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Files in "{activeFolder}"</h3>
                    <p className="text-sm text-gray-600">
                    {fileList.length} {fileList.length === 1 ? 'item' : 'items'} found
                    </p>
                </div>

            {fileList.length == 0 ? (
                <p className="text-gray-500">No files found.</p>
            ) : (
                <ul className="space-y-2">
                {fileList.map((file, index) => (
                    <li
                    key={index}
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 flex justify-between items-center">
                    <span>{file.file_name}</span>
                        <a
                            href={file.download}
                            //Invokes download to device
                            download={file.file_name}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm">
                            Download
                            </a>
                            <div>
                                {/* Remove button for files in storage */}
                                <button
                                        onClick={async (e) => { 
                                            e.stopPropagation();
                                            try{
                                                if (!activeFolder) {
                                                    console.error("activeFolder is undefined. Skipping delete.");
                                                    return;
                                                }
                                                //Calling two functions
                                                //to remove from firestore and storage
                                                await removeFilefromStorage(file.file_name, activeFolder);
                                                await removeFilefromFirestore(file.file_name,activeFolder);
                                                setFileList(prevList => prevList.filter(f => f.file_name !== file.file_name));
                                            } catch (error) {
                                                console.error('Error deleting file:', error);
                                            }
                                        }}
                                        title="Remove file"
                                        style={{
                                            ...removeButtonStyle,
                                            marginLeft: '10px',
                                            position: 'static',
                                        }}
                                    >
                                    X
                                </button>
                            </div>
                    </li>
                ))}
                </ul>
            )}
            </div>
            {/* Clipboard History */}
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">Clipboard History</h3>
                    <SortHistoryButton sortOrder={sortOrder} setSortOrder={setSortOrder} />
                    <ToggleDeleteMultipleButton
                        deleteMultipleMode={deleteMultipleMode}
                        setDeleteMultipleMode={setDeleteMultipleMode}
                    />
                </div>

                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

                <div className="text-sm text-gray-600 mb-2">
                    {totalFilteredItems} {totalFilteredItems === 1 ? 'item' : 'items'} found
                </div>

                {totalFilteredItems > 0 ? (
                    <ul className="space-y-2">
                        {displayItems.map((item) => (
                            <ClipboardItem
                                item={item}
                                deleteMultipleMode={deleteMultipleMode}
                                selectedItems={selectedItems}
                                setSelectedItems={setSelectedItems}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">No clipboard history available.</p>
                )}
            </div>
        </div>
    );
}

export default SidePanel;