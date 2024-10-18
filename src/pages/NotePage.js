// src/pages/NotePage.js
import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

const NotePage = () => {
    return (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Paper
                elevation={3}
                sx={{
                    flexGrow: 1,
                    padding: 2,
                    boxSizing: 'border-box',
                    borderRadius: 2,
                    border: '1px solid #ddd',
                    overflowY: 'auto',
                }}
            >
                <Typography variant="h4" gutterBottom>
                    记事本
                </Typography>
                <Typography>
                    这是记事本页面的内容。您可以在这里添加和管理您的笔记。
                </Typography>
            </Paper>
            {/* 如果需要输入区域，可以添加 AIGCInputArea 组件 */}
        </Box>
    );
};

export default NotePage;