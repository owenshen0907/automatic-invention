// src/components/AIGCInputArea.js
import React, { useState } from 'react';
import {
    Box,
    TextField,
    IconButton,
    Button,
    Paper,
    Menu,
    MenuItem,
    Tooltip,
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
} from '@mui/material';
import { AttachFile, Close, Description } from '@mui/icons-material';
import imageCompression from 'browser-image-compression';
import useUploadFile from '../hooks/useUploadFile';

const SUPPORTED_FILE_FORMATS = [
    '.txt', '.md',
    '.pdf',
    '.doc', '.docx',
    '.xls', '.xlsx',
    '.ppt', '.pptx',
    '.csv',
    '.html', '.htm', '.xml',
    '.mp4'
];

const AIGCInputArea = ({ onSend }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileType, setFileType] = useState(null); // 'image' | 'file' | 'video'

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // 新增状态用于收集上传后的文件详情
    const [uploadedFileDetails, setUploadedFileDetails] = useState([]);

    // 添加 Snackbar 状态
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // 使用 useUploadFile 钩子
    const {
        fileNames,
        setFileNames,
        fileDescriptions,
        setFileDescriptions,
        selectedFiles: uploadSelectedFiles,
        setSelectedFiles: setUploadSelectedFiles,
        handleUploadFiles,
        loading,
        uploadProgresses,
        handleClose,
    } = useUploadFile({
        knowledgeBaseId: 'local', // vector_store_id
        modelOwner: 'local',
        setSnackbarMessage,
        setSnackbarSeverity,
        setSnackbarOpen,
        onFileUploaded: (file) => {
            // 收集上传后的文件详情，包括 file_id 和 file_web_path
            setUploadedFileDetails((prev) => [...prev, { ...file}]);
        },
        onClose: () => {
            // 上传完成后的回调，可以根据需要进行处理
        },
    });

    const handleSendClick = () => {
        if (inputValue.trim() === '' && uploadedFileDetails.length === 0) {
            setSnackbarMessage('请输入内容或选择要上传的文件。');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }
        onSend(inputValue, uploadedFileDetails, fileType, selectedFiles);
        setInputValue('');
        setSelectedFiles([]);
        setFileType(null);
        setUploadedFileDetails([]);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUploadImage = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 10) {
            alert('一次最多上传10张图片。');
            return;
        }

        const totalSize = files.reduce((acc, file) => acc + file.size, 0);
        let processedFiles = [...files];

        if (totalSize > 20 * 1024 * 1024) { // 20MB
            alert('图片总大小超过20MB，将自动进行压缩。');
            try {
                const options = {
                    maxSizeMB: 20 / files.length, // 平均每张图片的最大大小
                    maxWidthOrHeight: 1920, // 最大宽度或高度
                    useWebWorker: true,
                };

                const compressedFiles = await Promise.all(
                    files.map(file => imageCompression(file, options))
                );

                processedFiles = compressedFiles;
            } catch (error) {
                console.error('图片压缩失败：', error);
                alert('图片压缩失败，请重试。');
                return;
            }
        }

        setSelectedFiles(processedFiles);
        setFileType('image');
        handleMenuClose();

        setUploadSelectedFiles(processedFiles);
        setFileNames(processedFiles.map((file) => file.name));
        setFileDescriptions(processedFiles.map(() => ''));

        await handleUploadFiles(processedFiles, 'image'); // 传递类型 'image'
    };

    const handleUploadFile = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 10) {
            alert('一次最多上传10个文件。');
            return;
        }

        // 验证每个文件
        for (let file of files) {
            if (file.size > 64 * 1024 * 1024) { // 64MB
                alert(`文件 "${file.name}" 超过64MB限制。`);
                return;
            }
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (!SUPPORTED_FILE_FORMATS.includes(fileExtension)) {
                alert(`文件格式不支持: ${file.name}`);
                return;
            }
        }

        setSelectedFiles(files);
        setFileType('file');
        handleMenuClose();

        setUploadSelectedFiles(files);
        setFileNames(files.map((file) => file.name));
        setFileDescriptions(files.map(() => ''));

        await handleUploadFiles(files,'file'); // 不传递参数，使用 selectedFiles
    };

    // 新增 handleUploadVideo 方法
    const handleUploadVideo = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 1) {
            setSnackbarMessage('一次最多上传1个视频。');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }

        const file = files[0];
        if (file.size > 128 * 1024 * 1024) { // 128MB
            setSnackbarMessage(`文件 "${file.name}" 超过128MB限制。`);
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }

        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        if (fileExtension !== '.mp4') {
            setSnackbarMessage(`文件格式不支持: ${file.name}`);
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }

        setSelectedFiles([file]);
        setFileType('video');
        handleMenuClose();

        setUploadSelectedFiles([file]);
        setFileNames([file.name]);
        setFileDescriptions(['']);

        await handleUploadFiles([file],'video'); // 使用钩子上传视频
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendClick();
        }
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        if (selectedFiles.length === 1) {
            setFileType(null);
        }
        // 同时更新上传文件的状态
        setUploadSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        setFileNames(prevNames => prevNames.filter((_, i) => i !== index));
        setFileDescriptions(prevDescs => prevDescs.filter((_, i) => i !== index));
        // 从 uploadedFileDetails 中移除对应的文件详情
        setUploadedFileDetails(prevDetails => prevDetails.filter((_, i) => i !== index));
    };

    const renderFilePreview = (file, index) => {
        const isImage = file.type.startsWith('image/');
        const status = 'uploaded'; // 假设文件已上传成功
        return (
            <Box
                key={index}
                sx={{
                    position: 'relative',
                    marginRight: 1,
                    marginBottom: 1,
                }}
            >
                {isImage ? (
                    <img
                        src={URL.createObjectURL(file)}
                        alt={`selected-${index}`}
                        style={{
                            width: 80,
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 4,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            border: '1px solid #ccc',
                            borderRadius: 1,
                            backgroundColor: '#f5f5f5',
                            width: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <Description sx={{ marginRight: 1 }} />
                        <Typography variant="body2" noWrap>
                            {file.name}
                        </Typography>
                    </Box>
                )}
                {/* Remove Button */}
                <IconButton
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    }}
                >
                    <Close fontSize="small" />
                </IconButton>

                {/* Overlay for Loading or Success */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.6)',
                        borderRadius: 4,
                        pointerEvents: 'none',
                    }}
                >
                    {status === 'uploading' && <CircularProgress size={24} />}
                    {status === 'uploaded' && (
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: 'green',
                            }}
                        />
                    )}
                </Box>
            </Box>
        );
    };

    return (
        <Paper
            elevation={1}
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                padding: 1,
                borderRadius: 1,
                border: '1px solid #ccc',
            }}
        >
            {/* 显示已选择的文件 */}
            {selectedFiles.length > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        mb: 1,
                        justifyContent: 'flex-start',
                        width: '100%',
                    }}
                >
                    {selectedFiles.map((file, index) => renderFilePreview(file, index))}
                </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <IconButton onClick={handleMenuOpen}>
                    <AttachFile />
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                >
                    {fileType !== 'file' && (
                        <Tooltip
                            title={
                                <Box>
                                    <Typography variant="body2">
                                        支持格式：JPG/JPEG、PNG、静态GIF、WebP
                                    </Typography>
                                    <Typography variant="body2">
                                        最多一次上传10张照片
                                    </Typography>
                                    <Typography variant="body2">
                                        如果图片总大小超过20MB将被压缩
                                    </Typography>
                                </Box>
                            }
                            placement="right"
                            arrow
                        >
                            <MenuItem>
                                <label
                                    htmlFor="upload-image"
                                    style={{ cursor: 'pointer', width: '100%', display: 'block' }}
                                >
                                    上传图片
                                    <input
                                        id="upload-image"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        hidden
                                        onChange={handleUploadImage}
                                    />
                                </label>
                            </MenuItem>
                        </Tooltip>
                    )}
                    {fileType !== 'image' && (
                        <Tooltip
                            title={
                                <Box>
                                    <Typography variant="body2">
                                        支持格式：
                                        <br />
                                        纯文本（.txt, .md）
                                        <br />
                                        PDF（.pdf）
                                        <br />
                                        Word（.doc, .docx）
                                        <br />
                                        Excel（.xls, .xlsx）
                                        <br />
                                        PPT（.ppt, .pptx）
                                        <br />
                                        CSV（.csv）
                                        <br />
                                        HTML/XML（.html, .htm, .xml）
                                    </Typography>
                                </Box>
                            }
                            placement="right"
                            arrow
                        >
                            <MenuItem>
                                <label
                                    htmlFor="upload-file"
                                    style={{ cursor: 'pointer', width: '100%', display: 'block' }}
                                >
                                    上传文件
                                    <input
                                        id="upload-file"
                                        type="file"
                                        multiple
                                        hidden
                                        onChange={handleUploadFile}
                                        accept={SUPPORTED_FILE_FORMATS.join(',')}
                                    />
                                </label>
                            </MenuItem>
                        </Tooltip>
                    )}
                    {/* 新增上传视频的选项 */}
                    {fileType !== 'video' && (
                        <Tooltip
                            title={
                                <Box>
                                    <Typography variant="body2">
                                        支持格式：MP4
                                    </Typography>
                                    <Typography variant="body2">
                                        最多一次上传1个视频
                                    </Typography>
                                    <Typography variant="body2">
                                        视频大小限制为128MB
                                    </Typography>
                                </Box>
                            }
                            placement="right"
                            arrow
                        >
                            <MenuItem>
                                <label
                                    htmlFor="upload-video"
                                    style={{ cursor: 'pointer', width: '100%', display: 'block' }}
                                >
                                    上传视频
                                    <input
                                        id="upload-video"
                                        type="file"
                                        accept="video/mp4"
                                        multiple={false} // 一次上传一个视频
                                        hidden
                                        onChange={handleUploadVideo}
                                    />
                                </label>
                            </MenuItem>
                        </Tooltip>
                    )}
                </Menu>

                <TextField
                    variant="outlined"
                    placeholder="输入内容..."
                    fullWidth
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    sx={{ mx: 1 }}
                    size="small"
                    onKeyDown={handleKeyDown}
                    multiline
                    maxRows={4}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSendClick}
                    disabled={loading} // 在上传过程中禁用发送按钮
                >
                    发送
                </Button>
            </Box>

            {/* Snackbar 提示 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default AIGCInputArea;