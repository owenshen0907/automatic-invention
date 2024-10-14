// src/components/EditKnowledgeBase.jsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Chip,
    DialogActions as MuiDialogActions,
    Box,
    Button,
    CircularProgress
} from '@mui/material';
import axios from 'axios';

const EditKnowledgeBase = ({
                               open,
                               onClose,
                               knowledgeBase,
                               onUpdateKnowledgeBase,
                               setSnackbarMessage,
                               setSnackbarSeverity,
                               setSnackbarOpen
                           }) => {
    const [identifier, setIdentifier] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (knowledgeBase) {
            setIdentifier(knowledgeBase.name || '');
            setDisplayName(knowledgeBase.display_name || '');
            setDescription(knowledgeBase.description || '');
            setTags(knowledgeBase.tags ? knowledgeBase.tags.split(',') : []);
        }
    }, [knowledgeBase]);

    const handleSave = async () => {
        if (!identifier.trim()) {
            setSnackbarMessage('知识库标识不能为空');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const identifierRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]*$/;
        if (!identifierRegex.test(identifier.trim())) {
            setSnackbarMessage('知识库标识只能包含字母、数字和下划线，且不能以下划线开头');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (!displayName.trim()) {
            setSnackbarMessage('知识库名称不能为空');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        try {
            setLoading(true);
            const apiUrl = process.env.REACT_APP_API_BASE_URL;
            const response = await axios.put(`${apiUrl}/api/update-vector-store/${knowledgeBase.id}`, {
                name: identifier.trim(),
                display_name: displayName.trim(),
                description: description.trim(),
                // tags 不可编辑，因此不发送 tags
            });
            if (response.status === 200) {
                const updatedKB = response.data;
                onUpdateKnowledgeBase({
                    id: updatedKB.id,
                    name: updatedKB.name,
                    display_name: updatedKB.display_name,
                    description: updatedKB.description,
                    tags: updatedKB.tags || ""
                });
                onClose();
                setSnackbarMessage('知识库更新成功');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('更新知识库失败:', error);
            const errorMessage = error.response?.data?.details || '更新知识库失败，请重试';
            setSnackbarMessage(errorMessage);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            onClose();
            if (knowledgeBase) {
                setIdentifier(knowledgeBase.name || '');
                setDisplayName(knowledgeBase.display_name || '');
                setDescription(knowledgeBase.description || '');
                setTags(knowledgeBase.tags ? knowledgeBase.tags.split(',') : []);
            }
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>编辑知识库</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                        margin="dense"
                        label="知识库名称"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        helperText="必填项"
                        required
                        sx={{ flex: 1, minWidth: '200px' }}
                    />
                    <TextField
                        margin="dense"
                        label="知识库标识"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        helperText="只能包含字母、数字和下划线，且不能以下划线开头"
                        required
                        sx={{ flex: 1, minWidth: '200px' }}
                    />
                </Box>
                <TextField
                    margin="dense"
                    label="知识库描述"
                    type="text"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    helperText="可选"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TextField
                        label="标签"
                        value={''}
                        size="small"
                        disabled
                        helperText="标签为只读"
                    />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
            </DialogContent>
            <MuiDialogActions>
                <Button onClick={handleClose} color="secondary" disabled={loading}>
                    取消
                </Button>
                <Button onClick={handleSave} color="primary" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : '保存'}
                </Button>
            </MuiDialogActions>
        </Dialog>
    );
};

export default EditKnowledgeBase;