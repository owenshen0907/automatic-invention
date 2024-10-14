// src/components/InputArea.js
import React, { useState } from 'react';
import { Box, TextField, IconButton, Button, Paper } from '@mui/material';
import { AttachFile } from '@mui/icons-material';

const InputArea = ({ onSend }) => {
    console.log('InputArea received onSend:', onSend); // 调试日志

    const [inputValue, setInputValue] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSendClick = () => {
        if (inputValue.trim() === '' && !selectedFile) {
            // 可以添加提示用户输入内容或选择文件
            return;
        }
        onSend(inputValue, selectedFile); // 调用 onSend
        // 清空输入框和附件
        setInputValue('');
        setSelectedFile(null);
    };

    const handleFileChange = (event) => {
        if (event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // 阻止默认的回车换行行为
            handleSendClick(); // 发送消息
        }
    };

    return (
        <Paper
            elevation={1}
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: 1,
                borderRadius: 1,
                border: '1px solid #ccc',
                height: '60px', // 固定高度
            }}
        >
            <IconButton component="label">
                <AttachFile />
                <input type="file" hidden onChange={handleFileChange} />
            </IconButton>
            <TextField
                variant="outlined"
                placeholder="输入内容..."
                fullWidth
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                sx={{ mx: 1 }}
                size="small"
                onKeyDown={handleKeyDown} // 添加键盘事件处理
                // 如果需要支持多行输入，可以启用以下属性
                multiline
                maxRows={4}
            />
            <Button variant="contained" color="primary" onClick={handleSendClick}>
                发送
            </Button>
        </Paper>
    );
};

export default InputArea;