import React, { useRef, useState } from 'react';
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
    LinearProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import useUploadFile from '../../hooks/useUploadFile';

const UploadFile = ({
                        open,
                        onClose,
                        knowledgeBaseId,
                        modelOwner,
                        onFileUploaded,
                    }) => {
    const fileInputRef = useRef(null);

    // 定义 Snackbar 状态
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const {
        fileNames,
        setFileNames,
        fileDescriptions,
        setFileDescriptions,
        selectedFiles,
        handleFileChange,
        handleUploadFiles,
        loading,
        uploadProgresses,
        handleClose,
    } = useUploadFile({
        knowledgeBaseId,
        modelOwner,
        setSnackbarMessage,
        setSnackbarSeverity,
        setSnackbarOpen,
        onFileUploaded,
        onClose,
    });

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>上传文件</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Button variant="contained" component="label">
                        选择文件
                        <input
                            type="file"
                            ref={fileInputRef}
                            hidden
                            onChange={handleFileChange}
                            multiple
                        />
                    </Button>
                </Box>

                {selectedFiles &&
                    selectedFiles.length > 0 &&
                    selectedFiles.map((file, index) => (
                        <Box key={index} sx={{ mt: 2 }}>
                            <Typography variant="subtitle1">
                                文件 {index + 1}: {file.name}
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 2,
                                    alignItems: 'flex-start',
                                }}
                            >
                                <TextField
                                    margin="dense"
                                    label="文件名"
                                    fullWidth
                                    value={fileNames[index] !== undefined ? fileNames[index] : file.name}
                                    onChange={(e) => {
                                        const newFileNames = [...fileNames];
                                        newFileNames[index] = e.target.value;
                                        setFileNames(newFileNames);
                                        console.log(`Updated fileNames[${index}] to:`, e.target.value);
                                    }}
                                    helperText="可以编辑文件名"
                                />
                                <TextField
                                    margin="dense"
                                    label="文件描述"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={fileDescriptions[index] !== undefined ? fileDescriptions[index] : ''}
                                    onChange={(e) => {
                                        const newFileDescriptions = [...fileDescriptions];
                                        newFileDescriptions[index] = e.target.value;
                                        setFileDescriptions(newFileDescriptions);
                                        console.log(`Updated fileDescriptions[${index}] to:`, e.target.value);
                                    }}
                                    helperText="可选，描述文件内容"
                                />
                            </Box>

                            {uploadProgresses[index] > 0 &&
                                uploadProgresses[index] < 100 && (
                                    <Box sx={{ width: '100%', p: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={uploadProgresses[index]}
                                        />
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            上传进度: {uploadProgresses[index]}%
                                        </Typography>
                                    </Box>
                                )}
                        </Box>
                    ))}
            </DialogContent>
            <MuiDialogActions>
                <Button
                    onClick={handleClose}
                    color="secondary"
                    disabled={loading}
                >
                    取消
                </Button>
                <Button
                    onClick={() => handleUploadFiles()}
                    color="primary"
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : '上传'}
                </Button>
            </MuiDialogActions>

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
        </Dialog>
    );
};

export default UploadFile;