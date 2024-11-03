// src/hooks/useUploadFile.js
import { useState } from 'react';
import axios from 'axios';

const useUploadFile = ({
                           knowledgeBaseId,
                           modelOwner,
                           setSnackbarMessage,
                           setSnackbarSeverity,
                           setSnackbarOpen,
                           onFileUploaded,
                           onClose,
                       }) => {
    const [fileNames, setFileNames] = useState([]);
    const [fileDescriptions, setFileDescriptions] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgresses, setUploadProgresses] = useState([]);
    const [fileIds, setFileIds] = useState([]); // 新增状态变量
    const [fileWebPaths, setFileWebPaths] = useState([]); // 新增：存储 file_web_path

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        console.log('Files selected:', files);
        if (files.length > 0) {
            setSelectedFiles(files);
            setFileNames(files.map((file) => file.name));
            setFileDescriptions(files.map(() => ''));
        }
    };

    // 将 filesToUpload 参数设为可选
    const handleUploadFiles = async (filesToUpload) => {
        console.log('handleUploadFiles called');
        const files = filesToUpload || selectedFiles; // 如果没有传入参数，使用 selectedFiles
        console.log('Files to upload:', files);
        if (!files || files.length === 0) {
            console.log('No files selected for upload');
            setSnackbarMessage('请先选择文件');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }
        const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/knowledge-uploads-file`;
        console.log('API URL:', apiUrl);

        setSelectedFiles(files); // 更新 selectedFiles
        setLoading(true);
        setSnackbarMessage(`正在上传文件...`);
        setSnackbarSeverity('info');
        setSnackbarOpen(true);
        setUploadProgresses(Array(files.length).fill(0));
        setFileIds(Array(files.length).fill(null)); // 初始化 fileIds

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('vector_store_id', knowledgeBaseId);
            formData.append('file', file);
            formData.append('file_name', fileNames[i] || file.name);
            formData.append('file_description', fileDescriptions[i] || '');
            formData.append('model_owner', modelOwner);

            try {
                const response = await axios.post(
                    apiUrl,
                    formData,
                    {
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setUploadProgresses((prevProgresses) => {
                                const newProgresses = [...prevProgresses];
                                newProgresses[i] = percentCompleted;
                                return newProgresses;
                            });
                        },
                    }
                );
                // 为当前文件存储 file_id
                setFileIds((prevFileIds) => {
                    const newFileIds = [...prevFileIds];
                    newFileIds[i] = response.data.file_id;
                    return newFileIds;
                });
                setFileWebPaths((prevPaths) => {
                    const newPaths = [...prevPaths];
                    newPaths[i] = response.data.file_web_path; // 假设后端返回 file_web_path
                    return newPaths;
                });

                setSnackbarMessage(`文件上传成功: ${response.data.file_id}`);
                setSnackbarSeverity('success');
                setSnackbarOpen(true);

                if (onFileUploaded) {
                    onFileUploaded({
                        file_id: response.data.file_id,
                        file_web_path: response.data.file_web_path, // 传递 file_web_path
                    });
                }
            } catch (error) {
                let errorMessage = '文件上传失败';
                if (error.response) {
                    // 服务器有响应
                    errorMessage += `: ${error.response.status} ${error.response.statusText}`;
                    if (error.response.data && error.response.data.error) {
                        errorMessage += ` - ${error.response.data.error}`;
                    }
                    console.error('服务器返回错误：', error.response.data);
                } else if (error.request) {
                    // 请求已发出，但没有收到响应
                    errorMessage += ': 没有收到服务器响应';
                    console.error('请求未收到响应：', error.request);
                } else {
                    errorMessage += `: ${error.message}`;
                    console.error('设置请求时发生错误：', error.message);
                }

                setSnackbarMessage(errorMessage);
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            }
        }

        setLoading(false);
        setUploadProgresses([]);
        setFileNames([]);
        setFileDescriptions([]);
        setSelectedFiles([]);
        setFileIds([]); // 重置 fileIds

        if (onClose) {
            onClose();
        }
    };

    // 关闭对话框并重置状态
    const handleClose = () => {
        if (!loading) {
            if (onClose) {
                onClose();
            }
            setFileNames([]);
            setFileDescriptions([]);
            setSelectedFiles([]);
            setUploadProgresses([]);
            setFileIds([]); // 重置 fileIds
        }
    };

    return {
        fileNames,
        setFileNames,
        fileDescriptions,
        setFileDescriptions,
        selectedFiles,
        setSelectedFiles,
        handleFileChange,
        handleUploadFiles,
        loading,
        uploadProgresses,
        handleClose,
        fileIds, // 如果需要，返回 fileIds
        fileWebPaths, // 返回 file_web_path
    };
};

export default useUploadFile;