// src/pages/AIGCPage.jsx

import React, { useState, useCallback, useContext } from 'react';
import { Box, Paper, Snackbar, Alert } from '@mui/material';
import AIGCContentArea from '../components/AIGCContentArea';
import AIGCInputArea from '../components/AIGCInputArea';
import AIGCFunctionalitySidebar from '../components/AIGCFunctionalitySidebar';
import { KnowledgeBaseContext } from '../context/KnowledgeBaseContext';

const AIGCPage = () => {
    const [messages, setMessages] = useState([]); // 消息数组
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState(''); // 初始为空
    const [selectedKB, setSelectedKB] = useState(''); // 新增：选中的知识库 ID
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [enableWebSearch, setEnableWebSearch] = useState(false); // 新增: 是否启用联网搜索
    const [selectedVectorFileId, setSelectedVectorFileId] = useState('');//解析文档的文档ID

    // 从 KnowledgeBaseContext 获取知识库数据和相关方法
    const { knowledgeBases, loading: kbLoading, error: kbError, fetchKnowledgeBases } = useContext(KnowledgeBaseContext);

    // 处理 Pipeline 变化
    const handlePipelineChange = (pipeline) => {
        setSelectedPipeline(pipeline);
    };

    // 处理知识库选择变化
    const handleKnowledgeBaseChange = (selectedKBId) => {
        setSelectedKB(selectedKBId);
        console.log('Selected Knowledge Base ID:', selectedKBId);
    };
    const handleFileChange = (VectorFileId) => {
        setSelectedVectorFileId(VectorFileId);
        console.log('Selected VectorFileId:', VectorFileId);
    };

    // 处理联网搜索变化
    const handleWebSearchChange = (isEnabled) => {
        setEnableWebSearch(isEnabled); // 更新启用联网搜索的状态
        console.log('Enable Web Search:', isEnabled);
    };

    // 发送消息的处理函数
    const handleSend = async (inputValue, selectedFile) => {
        if (inputValue.trim() === '' && !selectedFile) {
            // 添加提示用户输入内容或选择文件
            setSnackbarMessage('请输入内容或选择文件后再发送。');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }

        // 添加用户消息到消息数组
        const userMessage = {
            id: Date.now(), // 唯一标识
            sender: 'user',
            content: inputValue,
            createdAt: new Date().toLocaleTimeString(),
        };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        setLoading(true);
        setError(null);

        try {
            let fileUrl = '';
            if (selectedFile) {
                console.log('开始上传文件...');
                fileUrl = await uploadFileAndGetUrl(selectedFile); // 实现文件上传逻辑
                console.log('文件上传完成，URL:', fileUrl);
            }

            // 获取选中的知识库详情
            const selectedKnowledgeBase = knowledgeBases.find(kb => kb.id === selectedKB);

            // 构建调用 API 的请求数据
            const data = {
                inputs: {},
                query: inputValue,
                response_mode: "streaming",
                conversation_id: "",
                user: "abc-123",
                vector_store_id: selectedKB, // 添加 vector_store_id
                vector_file_id: selectedVectorFileId || '',
                files: selectedFile
                    ? [
                        {
                            type: selectedFile.type.startsWith('image/') ? "image" : "file",
                            transfer_method: "remote_url",
                            url: fileUrl
                        }
                    ]
                    : []
            };

            // 动态添加知识库字段，只有在知识库不为空时才添加
            if (selectedKnowledgeBase) {
                const { name, description } = selectedKnowledgeBase;
                if (name) data.name = name;
                if (description) data.description = description;
            }

            // 动态添加联网搜索字段，如果启用了联网搜索
            data.web_search = enableWebSearch; // 使用父组件的状态
            console.log('发送数据:', data);

            // 根据选择的 Pipeline 选择不同的 API 接口
            let apiUrl = '';
            if (selectedPipeline === 'Dify') {
                apiUrl = process.env.REACT_APP_API_DIFY_URL;
            } else if (selectedPipeline === 'StepFun') {
                apiUrl = process.env.REACT_APP_API_STEPFUN_URL;
            } else {
                throw new Error('未选择有效的 Pipeline');
            }

            console.log(`Selected Pipeline: ${selectedPipeline}`);
            console.log(`API URL: ${apiUrl}`);

            const response = await fetch(apiUrl, { // 使用选择的 API 路由
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            console.log('收到响应:', response);

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 501) {
                    throw new Error(`Pipeline "${selectedPipeline}" 暂未实现。`);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let doneReading = false;

            while (!doneReading) {
                const { value, done } = await reader.read();
                doneReading = done;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });

                    const lines = chunk.split('\n').filter(line => line.startsWith('data:'));

                    for (const line of lines) {
                        console.log("Received line: ", line);
                        if (!line.startsWith('data:')) {
                            console.log("Line does not start with 'data:', skipping...");
                            continue;
                        }

                        // 使用正则表达式移除 'data:' 和可能的空格
                        const jsonString = line.replace(/^data:\s*/, '');
                        console.log("After removing 'data: ': ", jsonString);

                        if (jsonString === '[DONE]') {
                            doneReading = true;
                            break;
                        }

                        if (jsonString === '') {
                            console.log("Empty jsonString, skipping...");
                            continue; // 跳过空的 jsonString
                        }

                        try {
                            const parsed = JSON.parse(jsonString);
                            console.log("Parsed Response: ", parsed);

                            // 处理 parsed 对象
                            if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                const content = parsed.choices[0].delta.content;
                                console.log("Received content: ", content);

                                // 添加或更新机器人消息
                                setMessages(prevMessages => {
                                    const lastMessage = prevMessages[prevMessages.length - 1];
                                    if (lastMessage && lastMessage.sender === 'bot') {
                                        // 更新最后一条机器人消息
                                        return prevMessages.map(msg =>
                                            msg.id === lastMessage.id
                                                ? { ...msg, content: msg.content + content }
                                                : msg
                                        );
                                    } else {
                                        // 添加新的机器人消息
                                        return [
                                            ...prevMessages,
                                            {
                                                id: Date.now() + Math.random(), // 唯一标识
                                                sender: 'bot',
                                                content: content,
                                                createdAt: new Date().toLocaleTimeString(),
                                            }
                                        ];
                                    }
                                });
                            } else if (parsed.event === 'message_end') {
                                setLoading(false);
                            }
                        } catch (err) {
                            console.error('解析 JSON 失败:', err);
                            console.error('原始 JSON 字符串:', jsonString);
                        }
                    }
                }
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(`请求失败：${err.message}`);
            setLoading(false);
        }
    };

    const handleCloseError = () => {
        setError(null);
    };
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', flexGrow: 1, height: '100vh', overflow: 'hidden' }}>
            {/* 左侧内容区域与输入框 */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mr: 2 }}>
                <Paper
                    elevation={3}
                    sx={{
                        flexGrow: 1,
                        padding: 2,
                        boxSizing: 'border-box',
                        borderRadius: 2,
                        border: '1px solid #ddd',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowX: 'hidden', // 防止水平溢出
                    }}
                >
                    <AIGCContentArea messages={messages} loading={loading} />
                </Paper>
                <Box sx={{ height: '10px' }} /> {/* 增加间距 */}
                <AIGCInputArea onSend={handleSend} /> {/* 传递 onSend */}
            </Box>
            {/* 右侧功能区 */}
            <Paper
                elevation={3}
                sx={{
                    width: 240,
                    flexShrink: 0, // 防止缩小
                    padding: 2,
                    boxSizing: 'border-box',
                    borderRadius: 2,
                    border: '1px solid #ddd',
                    height: '100%',
                    overflowY: 'auto',
                }}
            >
                <AIGCFunctionalitySidebar
                    selectedPipeline={selectedPipeline}
                    onPipelineChange={handlePipelineChange}
                    onKnowledgeBaseChange={handleKnowledgeBaseChange} // 传递知识库变化回调
                    onWebSearchChange={handleWebSearchChange} // 传递联网搜索变化回调
                    enableWebSearch={enableWebSearch} // 传递当前的 web_search 状态
                    onFileChange={handleFileChange} // Add this line
                />
            </Paper>
            {/* 错误提示 */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            {/* 成功提示 */}
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

// 示例文件上传函数
const uploadFileAndGetUrl = async (file) => {
    // 实现文件上传逻辑，如使用 AWS S3、Cloudinary 等服务
    // 这里以假设返回一个 URL 为例
    return 'https://example.com/path-to-uploaded-file.png';
};

export default AIGCPage;