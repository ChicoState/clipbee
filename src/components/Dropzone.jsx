import React, {useMemo,useState,useCallback} from 'react';
import {useDropzone} from 'react-dropzone';
import { pushFilestoStorage } from '../Firebase/firebaseData';

const baseStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    outline: 'none',
    transition: 'border .24s ease-in-out'
};

const focusedStyle = {
    borderColor: '#2196f3'
};

const acceptStyle = {
    borderColor: '#00e676'
};

const rejectStyle = {
    borderColor: '#ff1744'
};

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
  
  const removeButtonHoverStyle = {
    backgroundColor: '#d32f2f',
  };

function Dropzone({activeFolder, onPublish}) {
    //hold the files
    const [files, setFiles] = useState([]);

    //remove the files
    const removeFile = useCallback((fileid) => {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== fileid));
    }, []);

    //To see the size of the files
    const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept:
            {
                'text/plain': ['.txt'],
                'text/csv': ['.csv'],
                //for images 
                'image/*': ['.png', '.jpg', '.jpeg'],
                //Pdfs, docs, and powerpoint
                'application/pdf': ['.pdf'],
                'application/msword': ['.doc'],
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                'application/vnd.ms-powerpoint': ['.ppt'],
                'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
                //Code Files
                'application/javascript': ['.js'],
                'application/json': ['.json'],
                'text/css': ['.css'],
                'text/html': ['.html', '.htm'],
                'text/markdown': ['.md'],
                'text/x-python': ['.py'],
                'text/x-java-source': ['.java'],
                'text/x-c++src': ['.cpp'],
                'text/x-csrc': ['.c'],          
                'text/x-chdr': ['.h'], 
                //Unsure how they will affect the firestore for storage
                // 'audio/*': ['.mp3', '.wav', '.ogg'],
                // 'video/*': ['.mp4', '.webm', '.mov', '.avi'],
                //Media files 
                //compressed files 
                // 'application/zip': ['.zip'],
                // 'application/x-tar': ['.tar'],
            },
            multiple: true,
            maxFiles: 5,
        //dropping files,allows mutiple files, shows name
        onDrop: acceptedFiles => {
                console.log("Accepted files:", acceptedFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));  
            //Allowing only 5 files to upload a one time
            if (files.length + acceptedFiles.length <= 5) {
                const newFiles = acceptedFiles.map(file => ({
                    //get a unique id for file to remove if needed
                    id: `${file.name}-${file.size}-${Date.now()}`,
                    file,
                    name: file.name,
                    size: file.size,
            }));
            setFiles(prevFiles => [...prevFiles, ...newFiles]); 
            } else {
            alert("You can only upload up to 5 files at once.");
            }
        },
        //If the files extension is not allowed reject
        onDropRejected: (rejectedFiles) => {
            console.log("Rejected files:", rejectedFiles);
            let message = "Some files were rejected:\n";
            rejectedFiles.forEach(({file, errors}) => {
              message += `- ${file.name}: ${errors.map(e => e.message).join(', ')}\n`;
            });
            alert(message);
        }
    });

    const style = useMemo(() => ({
        ...baseStyle,
        ...(isFocused ? focusedStyle : {}),
        ...(isDragAccept ? acceptStyle : {}),
        ...(isDragReject ? rejectStyle : {})
    }), [
        isFocused,
        isDragAccept,
        isDragReject
    ]);

    return (
        <div className="container">
            <div {...getRootProps({style})}>
                <input {...getInputProps()} />
                <p>Drag some files here, or click to select files (Max 5)</p>
                </div>   
                {files.length > 0 && (
                 <aside style={{ marginTop: '20px' }}>
                    <h4>Files ({files.length} / 5)</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {files.map((fileInfo) => ( 
                            <li key={fileInfo.name} style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '10px 14px',
                                marginBottom: '8px',
                                borderRadius: '8px',
                                backgroundColor: '#f1f3f5',
                                border: '1px solid #e0e0e0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                position: 'relative',
                                transition: 'background-color 0.2s ease'
                            }}>
                                <div>
                                    <span style={{ fontSize: '14px', wordBreak: 'break-all' }}>
                                        {fileInfo.name}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'gray', display: 'block' }}>
                                        {formatBytes(fileInfo.size)} 
                                    </span>
                                </div>
                                {/* Remove Button 
                                    remove staged files*/}
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFile(fileInfo.id); }}
                                    title="Remove file"
                                    style={{
                                        ...removeButtonStyle,
                                        marginLeft: '10px',
                                        position: 'static',
                                      }}
                                >
                                    X
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-2xl shadow hover:bg-blue-700 transition duration-200"
                        onClick={async () => {
                            try {
                              //Push files to selected folder 
                              const folderToUse = activeFolder || 'Default';
                              await pushFilestoStorage(files.map(f => f.file),folderToUse);
                              //Refresh the file list after publishing to firebase
                              if (onPublish) {
                                onPublish();
                              }
                            } catch (err) {
                              console.error("Publish failed:", err);
                            }
                            files.forEach(r_file => removeFile(r_file.id));
                          }}
                    >
                        Publish
                    </button>
                </aside>
            )}
        </div>
    );
}

export default Dropzone;