// src/components/CreateKnowledgeBase.jsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    Chip,
    DialogActions as MuiDialogActions,
    Box,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Typography // Import Typography
} from '@mui/material';
import axios from 'axios';

const CreateKnowledgeBase = ({
                                 open,
                                 onClose,
                                 onAddKnowledgeBase,
                                 setSnackbarMessage,
                                 setSnackbarSeverity,
                                 setSnackbarOpen
                             }) => {
    const [newKnowledgeBaseIdentifier, setNewKnowledgeBaseIdentifier] = useState('');
    const [newKnowledgeBaseDisplayName, setNewKnowledgeBaseDisplayName] = useState('');
    const [newKnowledgeBaseDescription, setNewKnowledgeBaseDescription] = useState('');
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddTag = () => {
        const trimmedTag = newTag.trim();
        if (!trimmedTag) {
            setSnackbarMessage('标签不能为空');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (trimmedTag.length > 6) {
            setSnackbarMessage('标签最多6个汉字');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (tags.length >= 4) {
            setSnackbarMessage('最多只能添加4个标签');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (tags.includes(trimmedTag)) {
            setSnackbarMessage('标签已存在');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const updatedTags = [...tags, trimmedTag];
        setTags(updatedTags);
        setNewTag('');
    };

    const handleDeleteTag = (tagToDelete) => {
        const updatedTags = tags.filter(tag => tag !== tagToDelete);
        setTags(updatedTags);
    };

    const handleModelChange = (event) => {
        setSelectedModel(event.target.value);
    };

    const handleCreateKnowledgeBase = async () => {
        if (!newKnowledgeBaseIdentifier.trim()) {
            setSnackbarMessage('知识库标识不能为空');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        const identifierRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]*$/;
        if (!identifierRegex.test(newKnowledgeBaseIdentifier.trim())) {
            setSnackbarMessage('知识库标识只能包含字母、数字和下划线，且不能以下划线开头');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (!newKnowledgeBaseDisplayName.trim()) {
            setSnackbarMessage('知识库名称不能为空');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        if (tags.length > 4) {
            setSnackbarMessage('最多只能添加4个标签');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        for (let tag of tags) {
            if (tag.length > 6) {
                setSnackbarMessage('每个标签最多6个汉字');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
                return;
            }
        }

        if (!selectedModel) {
            setSnackbarMessage('请选择所属模型');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        try {
            setLoading(true);
            const apiUrl = process.env.REACT_APP_API_BASE_URL;
            const response = await axios.post(`${apiUrl}/api/create-vector-store`, {
                name: newKnowledgeBaseIdentifier.trim(),
                display_name: newKnowledgeBaseDisplayName.trim(),
                description: newKnowledgeBaseDescription.trim(),
                tags: tags.join(','),
                model_owner: selectedModel
            });
            if (response.status === 200 || response.status === 201) {
                const newKnowledgeBase = response.data;
                onAddKnowledgeBase({
                    id: newKnowledgeBase.id,
                    name: newKnowledgeBase.name,
                    display_name: newKnowledgeBase.display_name,
                    description: newKnowledgeBase.description,
                    tags: newKnowledgeBase.tags || "",
                    model_owner: newKnowledgeBase.model_owner
                });
                setNewKnowledgeBaseIdentifier('');
                setNewKnowledgeBaseDisplayName('');
                setNewKnowledgeBaseDescription('');
                setTags([]);
                setSelectedModel('');
                onClose();
                setSnackbarMessage('知识库创建成功');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error('创建知识库失败:', error);
            const errorMessage = error.response?.data?.details || '创建知识库失败，请重试';
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
            setNewKnowledgeBaseIdentifier('');
            setNewKnowledgeBaseDisplayName('');
            setNewKnowledgeBaseDescription('');
            setTags([]);
            setNewTag('');
            setSelectedModel('');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>创建知识库</DialogTitle>
            {/* Added Instruction Prompt */}
            <DialogContent>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    【所属模型】支持阶跃，智普，月之暗面，百川提供的知识库接口。自定义：可以自选向量模型，并支持基于文件的RAG。
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        flexWrap: 'nowrap', // Prevent wrapping
                        alignItems: 'flex-start',
                        mt: 2
                    }}
                >
                    {/* 所属模型选择框 */}
                    <FormControl
                        margin="dense"
                        variant="outlined"
                        required
                        sx={{flex: 1, minWidth: 200 }}
                    >
                        <InputLabel id="select-model-label">所属模型 *</InputLabel>
                        <Select
                            labelId="select-model-label"
                            value={selectedModel}
                            onChange={handleModelChange}
                            label="所属模型 *"
                        >
                            <MenuItem value="stepfun">stepfun</MenuItem>
                            <MenuItem value="zhipu">zhipu</MenuItem>
                            <MenuItem value="moonshot">moonshot</MenuItem>
                            <MenuItem value="baichuan">baichuan</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        margin="dense"
                        label="知识库名称 *"
                        type="text"
                        value={newKnowledgeBaseDisplayName}
                        onChange={(e) => setNewKnowledgeBaseDisplayName(e.target.value)}
                        helperText="必填项"
                        required
                        sx={{ flex: 1, minWidth: 200 }}
                    />
                    <TextField
                        margin="dense"
                        label="知识库标识 *"
                        type="text"
                        value={newKnowledgeBaseIdentifier}
                        onChange={(e) => setNewKnowledgeBaseIdentifier(e.target.value)}
                        helperText="只能包含字母、数字和下划线，且不能以下划线开头"
                        required
                        sx={{ flex: 1, minWidth: 200 }}
                    />
                </Box>
                <TextField
                    margin="dense"
                    label="知识库描述"
                    type="text"
                    fullWidth
                    multiline
                    rows={3}
                    value={newKnowledgeBaseDescription}
                    onChange={(e) => setNewKnowledgeBaseDescription(e.target.value)}
                    helperText="可选"
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <TextField
                        label="添加标签"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        size="small"
                        inputProps={{ maxLength: 6 }}
                        helperText="最多6个汉字"
                    />
                    <Button onClick={handleAddTag} sx={{ ml: 1 }} variant="outlined" size="small">
                        确认添加
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: 2 }}>
                    {tags.map((tag, index) => (
                        <Chip
                            key={index}
                            label={tag}
                            onDelete={() => handleDeleteTag(tag)}
                            sx={{ margin: 0.5 }}
                        />
                    ))}
                </Box>
            </DialogContent>
            <MuiDialogActions>
                <Button onClick={handleClose} color="secondary" disabled={loading}>
                    取消
                </Button>
                <Button onClick={handleCreateKnowledgeBase} color="success" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : '创建'}
                </Button>
            </MuiDialogActions>
        </Dialog>
    );
};

export default CreateKnowledgeBase;
