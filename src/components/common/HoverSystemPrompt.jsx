// src/components/common/HoverSystemPrompt.jsx

import React, { useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';

const HoverSystemPrompt = ({ systemPrompt, setSystemPrompt }) => {
    const defaultText = '你是一个智能助手，能进行自然对话、图像分析、逻辑推理、代码编写、联网搜索和娱乐互动。你理解上下文，提供简洁、准确的回复，帮助用户完成从专业问题到日常任务的多种需求。';
    // 初始化时，检查并设置默认值
    useEffect(() => {
        const storedPrompt = localStorage.getItem('aigcSystemPrompt');
        if (storedPrompt === null) { // 仅在首次加载时设置默认值
            setSystemPrompt(defaultText);
        }
    }, [setSystemPrompt]);

    // 当输入发生变化时，更新状态并自动保存
    const handleInputChange = (event) => {
        const userInput = event.target.value;
        setSystemPrompt(userInput);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                position: 'relative',
                padding: 1, // 添加适当的内边距
            }}
        >
            {/* 前缀标签 */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                系统提示 (system_prompt):
            </Typography>
            {/* 多行文本输入框 */}
            <TextField
                multiline
                variant="outlined"
                fullWidth
                rows={4} // 根据需要调整行数
                value={systemPrompt}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
                aria-label="系统提示输入框"
                placeholder="例如：你是一个智能助手，能够帮助用户解答问题。"
            />
        </Box>
    );
};

export default HoverSystemPrompt;