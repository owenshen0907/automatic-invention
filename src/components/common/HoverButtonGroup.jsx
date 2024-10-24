// src/components/common/HoverButtonGroup.jsx

import React from 'react';
import { Box, Button,IconButton, Tooltip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';

const HoverButtonGroup = ({
                              onSave,
                              conversations,
                              selectedConversationId,
                              onSelectConversation,
                              onClearChat
                          }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                minWidth:'320px',
                width: '100%', // 填满父容器
                justifyContent: 'flex-end',
                height: '50px',
                alignItems: 'center', // 垂直居中
                padding: 1, // 添加适当的内边距
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // 可选：增加背景以更好地显示
                borderRadius: '8px', // 可选：圆角
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', // 可选：阴影效果
                position: 'absolute', // 绝对定位
                right: 0, // 固定在右侧
                top: 0, // 可选：固定在顶部
            }}
        >
            {/* 保存会话按钮 */}
            <Tooltip title="点击后保存当前对话到缓存" arrow>
                <IconButton
                    color="primary"
                    onClick={onSave}
                    sx={{
                        flex: '1 1 16.66%',
                        justifyContent: 'center',
                        padding: 1, // 调整内边距
                        minWidth: '40px', // 设置最小宽度
                        height: '100%' // 使按钮高度填满父容器
                    }}
                    aria-label="保存会话"
                    size="small"
                >
                    <SaveIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            {/* 选择会话下拉菜单 */}
            <FormControl variant="outlined" sx={{ flex: '5 1 83.33%' }} size="small">
                <InputLabel id="select-conversation-label">选择会话</InputLabel>
                <Select
                    labelId="select-conversation-label"
                    value={selectedConversationId}
                    onChange={onSelectConversation}
                    label="选择会话"
                    sx={{ textAlign: 'left' }}
                    aria-label="选择会话"
                >
                    {conversations.length === 0 ? (
                        <MenuItem value="">
                            <em>无已保存对话</em>
                        </MenuItem>
                    ) : (
                        conversations.map((conv) => (
                            <MenuItem key={conv.id} value={conv.id}>
                                {conv.name}
                            </MenuItem>
                        ))
                    )}
                </Select>
            </FormControl>
            {/* 清除会话按钮 */}
            <Tooltip title="点击后清空当前对话" arrow>
                <IconButton
                    color="secondary"
                    onClick={onClearChat}
                    sx={{
                        flex: '1 1 16.66%',
                        justifyContent: 'center',
                        padding: 1, // 调整内边距
                        minWidth: '40px', // 设置最小宽度
                        height: '100%' // 使按钮高度填满父容器
                    }}
                    aria-label="清除会话"
                    size="small"
                >
                    <ClearIcon fontSize="small"/>
                </IconButton>
            </Tooltip>
        </Box>
    );
};

export default HoverButtonGroup;