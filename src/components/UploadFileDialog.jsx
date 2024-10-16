// src/components/UploadFileDialog.jsx
import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions as MuiDialogActions,
    Button,
    CircularProgress,
    Box,
    Typography,
    LinearProgress
} from '@mui/material';
import axios from 'axios';

const UploadFileDialog = ({
                              open,
                              onClose,
                              knowledgeBaseId, // 接收知识库的ID
                              modelOwner, // 新增: 接收模型所有者
                              setSnackbarMessage,
                              setSnackbarSeverity,
                              setSnackbarOpen,
                              onFileUploaded // 上传成功后回调
                          }) => {
    const [fileName, setFileName] = useState('');
    const [fileDescription, setFileDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); // 上传进度
    const fileInputRef = useRef(null);

    // 处理文件选择
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileName(file.name); // 根据文件名自动填充
        }
    };

    // 提交上传文件
    const handleUploadFile = async () => {
        if (!selectedFile) {
            setSnackbarMessage('请先选择文件');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const formData = new FormData();
        formData.append('vector_store_id', knowledgeBaseId); // 传入知识库的ID
        formData.append('file', selectedFile);
        formData.append('file_name', fileName); // 用户输入的文件名
        formData.append('file_description', fileDescription); // 用户输入的文件描述
        formData.append('model_owner', modelOwner); // 新增: 传入模型所有者

        try {
            setLoading(true);
            setSnackbarMessage(`正在上传文件: ${fileName}`);
            setSnackbarSeverity('info');
            setSnackbarOpen(true);
            setUploadProgress(0); // 重置上传进度

            // 发起文件上传请求
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/knowledge-uploads-file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            // 上传成功处理
            setSnackbarMessage(`文件上传成功: ${response.data.file_id}`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
            onFileUploaded(); // 调用回调函数刷新文件列表等
            onClose(); // 关闭弹框
        } catch (error) {
            console.error('上传文件失败:', error);
            setSnackbarMessage(`文件上传失败: ${error.response?.data?.error || error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            setFileName('');
            setFileDescription('');
            setSelectedFile(null);
            setUploadProgress(0);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>上传文件</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Button
                        variant="contained"
                        component="label"
                    >
                        选择文件
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            onChange={handleFileChange}
                        />
                    </Button>
                    {selectedFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            已选择文件: {selectedFile.name}
                        </Typography>
                    )}
                </Box>

                <TextField
                    margin="dense"
                    label="文件名"
                    fullWidth
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    helperText="可以编辑文件名"
                />
                <TextField
                    margin="dense"
                    label="文件描述"
                    fullWidth
                    multiline
                    rows={3}
                    value={fileDescription}
                    onChange={(e) => setFileDescription(e.target.value)}
                    helperText="可选，描述文件内容"
                />

                {/* 显示上传进度条 */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <Box sx={{ width: '100%', p: 1 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                        <Typography variant="caption" color="text.secondary">
                            上传进度: {uploadProgress}%
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <MuiDialogActions>
                <Button onClick={handleClose} color="secondary" disabled={loading}>
                    取消
                </Button>
                <Button onClick={handleUploadFile} color="primary" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : '上传'}
                </Button>
            </MuiDialogActions>
        </Dialog>
    );
};

export default UploadFileDialog;