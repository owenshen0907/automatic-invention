// src/pages/AIGCPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import {
    Box,
    Paper,
    Snackbar,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Slide, // 引入 Slide 组件用于动画
    Typography,
    IconButton,
} from '@mui/material';
import { Save as SaveIcon, Clear as ClearIcon, KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { nanoid } from 'nanoid'; // 使用 nanoid 生成唯一 ID
import AIGCContentArea from '../components/AIGCContentArea';
import AIGCInputArea from '../components/AIGCInputArea';
import AIGCFunctionalitySidebar from '../components/AIGCFunctionalitySidebar';
import HoverSlide from '../components/common/HoverSlide'; // 引入通用 HoverSlide 组件
import HoverButtonGroup from '../components/common/HoverButtonGroup'; // 引入 HoverButtonGroup 组件
import HoverSystemPrompt from '../components/common/HoverSystemPrompt'; // 引入 HoverSystemPrompt 组件
import { KnowledgeBaseContext } from '../context/KnowledgeBaseContext';

const AIGCPage = () => {
    const [messages, setMessages] = useState([]); // 当前对话消息
    const [loading, setLoading] = useState(false); // 初始为空
    const [error, setError] = useState(null);
    const [selectedPipeline, setSelectedPipeline] = useState(''); // 初始为空
    const [selectedKB, setSelectedKB] = useState(''); // 新增：选中的知识库 ID
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [enableWebSearch, setEnableWebSearch] = useState(false); // 新增: 是否启用联网搜索
    const [selectedVectorFileIds, setSelectedVectorFileIds] = useState([]); // 解析文档的文档ID数组
    const [enableMemory, setEnableMemory] = useState(true);
    const [systemPrompt, setSystemPrompt] = useState(''); // 父组件管理 systemPrompt 状态

    // 新增状态变量
    const [conversations, setConversations] = useState([]); // 已保存的对话列表
    const [selectedConversationId, setSelectedConversationId] = useState('');
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [newConversationName, setNewConversationName] = useState('');

    // 新增: 性能级别状态
    const [performanceLevel, setPerformanceLevel] = useState('fast'); // 默认值为 'fast'

    // 新增：添加 username 状态
    const [username, setUsername] = useState('未知'); // 默认用户名

    // 新增：存储上传文件的详细信息
    const [uploadedFileDetails, setUploadedFileDetails] = useState([]);

    // 定义 setSnackbar 函数
    const setSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };
    const handleMemoryChange = (newValue) => {
        setEnableMemory(newValue);
        // 其他逻辑，例如显示通知
    };

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
    // 处理文件选择变化
    const handleFileChange = (VectorFileIds) => {
        setSelectedVectorFileIds(VectorFileIds);
        console.log('Selected VectorFileIds:', VectorFileIds);
    };

    // 处理联网搜索变化
    const handleWebSearchChange = (isEnabled) => {
        setEnableWebSearch(isEnabled); // 更新启用联网搜索的状态
        console.log('Enable Web Search:', isEnabled);
    };

    // 处理性能级别变化
    const handlePerformanceLevelChange = (newLevel) => {
        setPerformanceLevel(newLevel);
        // 显示通知或其他逻辑
        setSnackbar(`性能级别已设置为 "${getPerformanceLabel(newLevel)}"。`, 'info');
    };
    // 辅助函数：根据性能级别值获取标签
    const getPerformanceLabel = (level) => {
        switch (level) {
            case 'fast':
                return '极速';
            case 'balanced':
                return '均衡';
            case 'advanced':
                return '高级';
            default:
                return '';
        }
    };

    // 辅助函数：将 messages 转换为 StepFunMessage 结构，仅包含文本内容
    const transformMessagesToStepFun = (messages) => {
        return messages.map(msg => {
            if (msg.sender === 'user') {
                return {
                    role: 'user',
                    content: msg.content ? msg.content : '', // 仅包含文本内容
                };
            } else if (msg.sender === 'bot') {
                return {
                    role: 'assistant',
                    content: msg.content ? msg.content : '', // 仅包含文本内容
                };
            } else {
                // 如果有系统消息
                return {
                    role: 'system',
                    content: typeof msg.content === 'string' ? msg.content : '',
                };
            }
        }).filter(msg => msg.content); // 过滤掉内容为空的消息
    };
    // 新增：从缓存中获取用户名
    useEffect(() => {
        const cachedUsername = localStorage.getItem('username');
        if (cachedUsername) {
            setUsername(cachedUsername);
        } else {
            setUsername('未知'); // 如果缓存中没有，则设置为默认值
        }
    }, []);
    // 发送消息的处理函数

    const handleSend = async (inputValue, uploadedFileDetails, fileType, selectedFiles) => {
        console.log('Uploaded File Details:', uploadedFileDetails);
        if (inputValue.trim() === '' && uploadedFileDetails.length === 0) {
            // 添加提示用户输入内容或选择文件
            setSnackbarMessage('请输入内容或选择文件后再发送。');
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
            return;
        }

        // 创建包含必要信息的 files 数组，包括本地 URL 和 file_web_path
        // 首先，确保 uploadedFileDetails 和 selectedFiles 数量一致
        if (uploadedFileDetails.length !== selectedFiles.length) {
            console.error('文件数量不匹配');
            return;
        }
        // 创建包含必要信息的 files 数组，包括本地 URL 和 file_web_path
        const files = selectedFiles.map((file, index) => ({
            local_url: URL.createObjectURL(file), // 生成本地 URL
            file_web_path: uploadedFileDetails[index].file_web_path, // 后端文件路径
            name: file.name,
            type: file.type, // 包含文件类型
        }));
        // 创建包含 files 数组的用户消息对象
        const userMessage = {
            id: nanoid(),
            sender: 'user',
            type: 'text',
            content: inputValue.trim() !== '' ? inputValue : null,
            fileIds: uploadedFileDetails.map(file => file.file_id) || [],
            files, // 包含 files 数组
            createdAt: new Date().toLocaleTimeString(),
        };

        // 将用户消息添加到消息数组
        setMessages(prevMessages => [...prevMessages, userMessage]);

        setLoading(true);
        setError(null);

        // 计算输入字数
        const inputCharacterCount = systemPrompt.trim().length +
            inputValue.trim().length +
            transformMessagesToStepFun(messages).reduce((sum, msg) => sum + msg.content.length, 0);

        // Initialize variables to capture model and usage
        let capturedModel = '';
        let capturedPromptTokens = 0;
        let capturedCompletionTokens = 0;

        try {
            // 获取选中的知识库详情
            const selectedKnowledgeBase = knowledgeBases.find(kb => kb.id === selectedKB);
            const systemPromptContent = systemPrompt.trim(); // 直接使用系统提示内容，可以为空

            // 构建 user_prompt 数组
            const userPrompt = [];

            if (inputValue.trim() !== '') {
                userPrompt.push({
                    type: 'text',
                    text: inputValue.trim(),
                });
            }
            // 根据每个文件的类型添加相应的内容，使用 file.type 而不是全局 fileType
            uploadedFileDetails.forEach(file => {
                if (file.type === 'image') {
                    userPrompt.push({
                        type: 'image_url',
                        image_url: {
                            url: file.file_web_path,
                            detail: 'high',
                        },
                    });
                } else if (file.type === 'video') {
                    userPrompt.push({
                        type: 'video_url',
                        video_url: {
                            url: file.file_web_path,
                        },
                    });
                } else {
                    userPrompt.push({
                        type: 'file_url',
                        file_url: {
                            url: file.file_web_path,
                        },
                    });
                }
            });

            // 构建调用 API 的请求数据
            const data = {
                inputs: {},
                system_prompt: systemPromptContent,
                query: inputValue,
                response_mode: "streaming",
                conversation_id: "",
                user: username,
                vector_store_id: selectedKB, // 添加 vector_store_id
                vector_file_ids: selectedVectorFileIds,
                file_ids: uploadedFileDetails.map(file => file.file_id) || [], // 将文件 IDs 传递给后端
                web_search: enableWebSearch,
                file_type: '', // 初始化 file_type
                performance_level: performanceLevel, // 添加性能级别
                user_prompt: {
                    role: 'user',
                    content: userPrompt,
                },
            };

            // 根据文件类型设置 file_type 字段
            if (fileType === 'image') {
                data.file_type = 'img';
            } else if (fileType === 'video') {
                data.file_type = 'video';
            } else {
                data.file_type = 'file';
            }

            // 动态添加知识库字段，只有在知识库不为空时才添加
            if (selectedKnowledgeBase) {
                const { name, description } = selectedKnowledgeBase;
                if (name) data.name = name;
                if (description) data.description = description;
            }

            // 如果启用了记忆功能，则添加对话历史，仅包含文本内容
            if (enableMemory) {
                data.conversation_history = transformMessagesToStepFun(messages);
            }

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
                credentials: 'include', // 新增：携带凭证（Cookie）
                body: JSON.stringify(data)
            });

            console.log('收到响应:', response);

            if (!response.ok) {
                const errorText = await response.text();
                if (response.status === 501) {
                    throw new Error(`Pipeline "${selectedPipeline}" 暂未实现。`);
                } else {
                    throw new Error(`HTTP 错误！状态: ${response.status}, 信息: ${errorText}`);
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
                        console.log("接收到的行: ", line);
                        if (!line.startsWith('data:')) {
                            console.log("该行不以 'data:' 开头，跳过...");
                            continue;
                        }

                        // 移除 'data:' 前缀和可能的空格
                        const jsonString = line.replace(/^data:\s*/, '');
                        console.log("移除 'data: ' 后的字符串: ", jsonString);

                        if (jsonString === '[DONE]') {
                            doneReading = true;
                            break;
                        }

                        if (jsonString === '') {
                            console.log("空的 jsonString，跳过...");
                            continue; // 跳过空的 jsonString
                        }

                        try {
                            const parsed = JSON.parse(jsonString);
                            console.log("解析后的响应: ", parsed);
                            // 捕获模型和使用情况
                            if (parsed.model) {
                                capturedModel = parsed.model;
                            }
                            if (parsed.usage) {
                                capturedPromptTokens = parsed.usage.prompt_tokens;
                                capturedCompletionTokens = parsed.usage.completion_tokens;
                            }

                            // 处理解析后的对象
                            if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                const content = parsed.choices[0].delta.content;
                                console.log("接收到的内容: ", content);

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
                                                id: nanoid(),
                                                sender: 'bot',
                                                content: content,
                                                createdAt: new Date().toLocaleTimeString(),
                                            }
                                        ];
                                    }
                                });

                                // 动态更新最后一条机器人消息的额外字段
                                setMessages(prevMessages => {
                                    const lastMessage = prevMessages[prevMessages.length - 1];
                                    if (lastMessage && lastMessage.sender === 'bot') {
                                        return prevMessages.map(msg =>
                                            msg.id === lastMessage.id
                                                ? {
                                                    ...msg,
                                                    model: capturedModel,
                                                    inputCharacterCount: inputCharacterCount,
                                                    inputTokenCount: capturedPromptTokens,
                                                    outputCharacterCount: msg.content ? msg.content.length : 0,
                                                    outputTokenCount: capturedCompletionTokens,
                                                }
                                                : msg
                                        );
                                    }
                                    return prevMessages;
                                });
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
            setSnackbarMessage(`请求失败：${err.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const handleCloseError = () => {
        setError(null);
    };
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    // 在组件挂载时加载已保存的对话和当前对话
    useEffect(() => {
        // 加载已保存的对话列表
        const cachedConversations = localStorage.getItem('aigcConversations');
        if (cachedConversations) {
            setConversations(JSON.parse(cachedConversations));
        }
        // 加载当前对话消息
        const cachedMessages = localStorage.getItem('aigcCurrentMessages');
        if (cachedMessages) {
            setMessages(JSON.parse(cachedMessages));
        }
        const cachedSystemPrompt = localStorage.getItem('aigcSystemPrompt');
        if (cachedSystemPrompt !== null) { // 存在，即使为空
            setSystemPrompt(cachedSystemPrompt);
        } else {
            setSystemPrompt(''); // 初始化为空，让子组件设置默认值
        }
        // 加载性能级别
        const cachedPerformanceLevel = localStorage.getItem('aigcPerformanceLevel');
        if (cachedPerformanceLevel) {
            setPerformanceLevel(cachedPerformanceLevel);
        }
        // 加载上传文件详情
        const cachedUploadedFiles = localStorage.getItem('aigcUploadedFileDetails');
        if (cachedUploadedFiles) {
            setUploadedFileDetails(JSON.parse(cachedUploadedFiles));
        }
    }, []);

    // 在 messages、systemPrompt 和 performanceLevel 状态变化时保存当前对话、系统提示和性能级别
    useEffect(() => {
        const messagesToSave = messages.map(msg => {
            if (msg.files) {
                const files = msg.files.map(file => ({
                    file_web_path: file.file_web_path,
                    name: file.name,
                    type: file.type,
                }));
                return { ...msg, files };
            }
            return msg;
        });
        localStorage.setItem('aigcCurrentMessages', JSON.stringify(messages));
        localStorage.setItem('aigcSystemPrompt', systemPrompt);
        localStorage.setItem('aigcPerformanceLevel', performanceLevel);
        localStorage.setItem('aigcUploadedFileDetails', JSON.stringify(uploadedFileDetails)); // 保存上传文件详情
    }, [messages, systemPrompt, performanceLevel, uploadedFileDetails]);

    // 在 conversations 状态变化时保存已保存的对话列表
    useEffect(() => {
        localStorage.setItem('aigcConversations', JSON.stringify(conversations));
    }, [conversations]);

    // 新增：保存对话函数
    const handleSaveConversation = () => {
        setSaveDialogOpen(true);
    };

    const handleCloseSaveDialog = () => {
        setSaveDialogOpen(false);
        setNewConversationName('');
    };


    const handleConfirmSaveConversation = () => {
        if (newConversationName.trim() === '') {
            setSnackbar('对话名称不能为空。', 'warning');
            return;
        }

        // 创建新的对话对象
        const newConversation = {
            id: nanoid(),
            name: newConversationName.trim(),
            messages: messages,
            timestamp: new Date().toISOString(),
        };

        // 更新对话列表
        setConversations(prevConversations => [...prevConversations, newConversation]);

        setSnackbar('对话已保存。', 'success');
        handleCloseSaveDialog();
    };

    // 新增：选择对话函数
    const handleSelectConversation = (event) => {
        const conversationId = event.target.value;
        setSelectedConversationId(conversationId);

        const selectedConversation = conversations.find(conv => conv.id === conversationId);
        if (selectedConversation) {
            setMessages(selectedConversation.messages);
            setUploadedFileDetails(selectedConversation.messages
                .filter(msg => msg.sender === 'user' && msg.files)
                .flatMap(msg => msg.files.map(file => ({
                    file_id: file.fileIds,
                    file_web_path: file.url,
                    type: file.type,
                })))
            );
            setSnackbar(`已加载对话：“${selectedConversation.name}”。`, 'success');
        } else {
            setSnackbar('未找到选定的对话。', 'error');
        }
    };


    // 新增：清空当前对话函数
    const handleClearChat = () => {
        setMessages([]);
        setUploadedFileDetails([]);
        localStorage.removeItem('aigcCurrentMessages');
        localStorage.removeItem('aigcUploadedFileDetails');
        setSnackbar('当前对话已清空。', 'info');
    };

    return (
        <Box sx={{ display: 'flex', flexGrow: 1, height: '100vh', overflow: 'hidden', position: 'relative' }}>
            {/* 左侧内容区域与输入框 */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mr: 2, minWidth: 0 }}>
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
                        position: 'relative', // 为按钮容器定位做准备
                        minWidth: 0, // 防止收缩
                    }}
                >
                    {/* 右上角 HoverSlide 控制按钮组 HoverButtonGroup  */}
                    <HoverSlide
                        triggerWidth="20%" // 根据需要调整触发区域宽度
                        triggerHeight="5px"
                        triggerColor="#cccccc"
                        slideDirection="down"
                        position="absolute"
                        top={0}
                        right={0}
                        display="flex"
                        sx={{
                            zIndex: 10, // 确保 z-index 足够高
                        }}

                    >
                        <HoverButtonGroup
                            onSave={handleSaveConversation}
                            conversations={conversations}
                            selectedConversationId={selectedConversationId}
                            onSelectConversation={handleSelectConversation}
                            onClearChat={handleClearChat}
                        />
                    </HoverSlide>

                    {/* 中间上方 HoverSlide 控制系统提示输入框 */}
                    <HoverSlide
                        triggerWidth="60%" // 根据需要调整触发区域宽度
                        triggerHeight="5px"
                        triggerColor="#555"
                        slideDirection="down"
                        position="absolute"
                        top={16}
                        left="50%"
                        sx={{ transform: 'translateX(-50%)', zIndex: 10, top: 0, }}
                    >
                        <HoverSystemPrompt
                            systemPrompt={systemPrompt} // 传递 systemPrompt
                            setSystemPrompt={setSystemPrompt} // 传递 setSystemPrompt
                        />
                    </HoverSlide>
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
                    enableMemory={enableMemory}
                    onMemoryChange={handleMemoryChange}
                    setSnackbar={setSnackbar} // 传递 setSnackbar
                    performanceLevel={performanceLevel} // 传递性能级别
                    onPerformanceLevelChange={handlePerformanceLevelChange} // 传递性能级别变化回调
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
            {/* 保存对话对话框 */}
            <Dialog
                open={saveDialogOpen}
                onClose={handleCloseSaveDialog}
                aria-labelledby="save-conversation-dialog-title"
                aria-describedby="save-conversation-dialog-description"
            >
                <DialogTitle id="save-conversation-dialog-title">保存当前对话</DialogTitle>
                <DialogContent>
                    <DialogContentText id="save-conversation-dialog-description">
                        请输入对话名称，以便将当前对话保存为一个会话。
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="conversation-name"
                        label="对话名称"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newConversationName}
                        onChange={(e) => setNewConversationName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSaveDialog}>取消</Button>
                    <Button onClick={handleConfirmSaveConversation} color="primary">
                        保存
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
export default AIGCPage;