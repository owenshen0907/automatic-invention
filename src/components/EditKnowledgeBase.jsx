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
    CircularProgress,
    Typography,
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
    const [modelOwner, setModelOwner] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (knowledgeBase) {
            setIdentifier(knowledgeBase.name || '');
            setDisplayName(knowledgeBase.display_name || '');
            setDescription(knowledgeBase.description || '');
            setTags(knowledgeBase.tags ? knowledgeBase.tags.split(',') : []);
            setModelOwner(knowledgeBase.model_owner || ''); // 初始化 modelOwner
        }
    }, [knowledgeBase]);

    // 添加标签的处理函数
    const handleTagChange = (event) => {
        if (event.key === 'Enter' && event.target.value.trim()) {
            setTags((prevTags) => [...prevTags, event.target.value.trim()]);
            event.target.value = ''; // 添加标签后清空输入框
        }
    };

    // 删除标签的处理函数
    const handleDeleteTag = (tagToDelete) => {
        setTags((prevTags) => prevTags.filter((tag) => tag !== tagToDelete));
    };

    const handleSave = async () => {
        if (!displayName.trim()) {
            setSnackbarMessage('知识库名称不能为空');
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

        try {
            setLoading(true);
            const apiUrl = process.env.REACT_APP_API_BASE_URL;
            const response = await axios.put(`${apiUrl}/api/update-vector-store/${knowledgeBase.name}`, {
                display_name: displayName.trim(),
                description: description.trim(),
                tags: tags.join(','), // 保存时包含标签
            });
            if (response.status === 200) {
                const updatedKB = response.data;
                onUpdateKnowledgeBase({
                    id: updatedKB.id,
                    name: updatedKB.name,
                    display_name: updatedKB.display_name,
                    description: updatedKB.description,
                    tags: updatedKB.tags || "",
                    model_owner: modelOwner, // 保持原有的 model_owner
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
                setModelOwner(knowledgeBase.model_owner || ''); // 重置所属模型
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
                        InputProps={{ readOnly: true }} // 设置标识为只读
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
                        label="添加标签"
                        placeholder="按回车添加标签"
                        onKeyDown={handleTagChange}
                        size="small"
                    />
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            onDelete={() => handleDeleteTag(tag)} // 添加删除功能
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
                {/* 所属模型只读显示 */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" color="text.secondary">
                        所属模型: {modelOwner || '未知模型'}
                    </Typography>
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
