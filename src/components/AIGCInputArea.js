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
];

const AIGCInputArea = ({ onSend }) => {
    const [inputValue, setInputValue] = useState('');
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileType, setFileType] = useState(null); // 'image' or 'file'

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // 新增状态用于收集上传后的文件ID
    const [uploadedFileIds, setUploadedFileIds] = useState([]);

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
        knowledgeBaseId: 'local20241015145535', // vector_store_id
        modelOwner: 'local',
        setSnackbarMessage,
        setSnackbarSeverity,
        setSnackbarOpen,
        onFileUploaded: (fileId) => {
            // 收集上传后的文件ID
            setUploadedFileIds((prev) => [...prev, fileId]);
        },
        onClose: () => {
            // 上传完成后的回调，可以根据需要进行处理
        },
    });

    const handleSendClick = () => {
        if (inputValue.trim() === '' && uploadedFileIds.length === 0) {
            alert('请输入内容或选择要上传的文件。');
            return;
        }
        onSend(inputValue, uploadedFileIds,fileType);
        setInputValue('');
        setSelectedFiles([]);
        setFileType(null);
        setUploadedFileIds([]);
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

        await handleUploadFiles(processedFiles); // 不传递参数，使用 selectedFiles
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

        await handleUploadFiles(files); // 不传递参数，使用 selectedFiles
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
        // 从 uploadedFileIds 中移除对应的文件ID
        setUploadedFileIds(prevIds => prevIds.filter((_, i) => i !== index));
    };

    const renderFilePreview = (file, index) => {
        const isImage = file.type.startsWith('image/');
        if (isImage) {
            return (
                <Box
                    key={index}
                    sx={{
                        position: 'relative',
                        marginRight: 1,
                        marginBottom: 1,
                    }}
                >
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
                </Box>
            );
        } else {
            // 对于非图片文件，显示一个图标和文件名
            return (
                <Box
                    key={index}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        marginRight: 1,
                        marginBottom: 1,
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
                </Box>
            );
        }
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
                                    <Typography variant="body2">
                                        最多一次上传10个文件
                                    </Typography>
                                    <Typography variant="body2">
                                        单文件大小限制为64MB
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