// src/components/KnowledgeBaseManagement.jsx
import React from 'react';
import {
    Box,
    Typography,
    Button,
    Chip
} from '@mui/material';

const KnowledgeBaseManagement = ({
                                     selectedKnowledgeBase,
                                     onBack,
                                     setSnackbarMessage,
                                     setSnackbarSeverity,
                                     setSnackbarOpen
                                 }) => {
    if (!selectedKnowledgeBase) {
        return null;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5">管理知识库</Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1"><strong>名称:</strong> {selectedKnowledgeBase.display_name}</Typography>
                <Typography variant="subtitle1"><strong>标识:</strong> {selectedKnowledgeBase.name}</Typography>
                <Typography variant="subtitle1"><strong>描述:</strong> {selectedKnowledgeBase.description || '无'}</Typography>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle1"><strong>标签:</strong></Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {selectedKnowledgeBase.tags ? selectedKnowledgeBase.tags.split(',').map((tag, index) => (
                            <Chip key={index} label={tag} />
                        )) : '无'}
                    </Box>
                </Box>
            </Box>
            <Box sx={{ mt: 4 }}>
                <Button variant="contained" color="primary" onClick={onBack}>
                    返回列表
                </Button>
            </Box>
        </Box>
    );
};

export default KnowledgeBaseManagement;