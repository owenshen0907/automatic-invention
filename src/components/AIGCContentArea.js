// src/components/AIGCContentArea.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Typography, Box, Avatar, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import Markdown from 'markdown-to-jsx';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// 使用 hljs 风格库的 atomOneLight 主题
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import userAvatar from '../assets/user-avatar.png';
import botAvatar from '../assets/bot-avatar.png';

// 导入 MUI 图标
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const fixedAvatarDistance = 6; // 6px

// 定义呼吸圆圈动画样式
const BreathingCircle = styled(Box)(({ theme }) => ({
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: '#1976d2',
    animation: 'breathing 1.5s infinite',
    margin: 'auto',
    '@keyframes breathing': {
        '0%, 100%': {
            transform: 'scale(1)',
            opacity: 0.6,
        },
        '50%': {
            transform: 'scale(1.2)',
            opacity: 1,
        },
    },
}));

// 定义消息容器样式
const MessageContainer = styled(Box)(({ theme, sender }) => ({
    display: 'flex',
    flexDirection: sender === 'bot' ? 'row' : 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
    width: '100%',
}));

// 定义消息气泡样式
const MessageBubble = styled(Box)(({ theme, sender }) => ({
    maxWidth: sender === 'bot' ? '90%' : '70%',
    width: sender === 'bot' ? '100%' : 'auto',
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    backgroundColor: sender === 'user' ? '#f0f0f0' : '#ffffff',
    color: '#333',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'relative',
    '& pre': {
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '8px',
        position: 'relative',
    },
    '& code': {
        wordBreak: 'break-word',
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        padding: '2px 4px',
        borderRadius: '4px',
    },
    '& ul, & ol': {
        listStyleType: 'disc',
        marginLeft: theme.spacing(2),
        paddingLeft: 0,
    },
    '& li': {
        marginBottom: theme.spacing(0.25),
    },
    '& p': {
        margin: 0,
        marginBottom: theme.spacing(0.25),
    },
}));

// 定义复制按钮容器样式
const CopyButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(0.5),
    right: theme.spacing(0.5),
}));

// 定义代码块复制按钮容器样式
const CodeCopyButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
}));

// 文件类型与图标的映射
const fileTypeIcons = {
    pdf: <PictureAsPdfIcon fontSize="large" color="action" />,
    doc: <DescriptionIcon fontSize="large" color="action" />,
    docx: <DescriptionIcon fontSize="large" color="action" />,
    xls: <InsertDriveFileIcon fontSize="large" color="action" />,
    xlsx: <InsertDriveFileIcon fontSize="large" color="action" />,
    ppt: <InsertDriveFileIcon fontSize="large" color="action" />,
    pptx: <InsertDriveFileIcon fontSize="large" color="action" />,
    txt: <DescriptionIcon fontSize="large" color="action" />,
    md: <DescriptionIcon fontSize="large" color="action" />,
    default: <InsertDriveFileIcon fontSize="large" color="action" />,
};

const AIGCContentArea = ({ messages, loading }) => {
    const contentEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [copiedCodeIds, setCopiedCodeIds] = useState({});
    const [botLoading, setBotLoading] = useState(false);

    // 使用 useLayoutEffect 确保在 DOM 更新后立即滚动
    useLayoutEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleCopyMessage = async (text, messageId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedMessageId(messageId);
            setTimeout(() => {
                setCopiedMessageId(null);
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    const handleCopyCode = async (text, codeId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCodeIds((prev) => ({ ...prev, [codeId]: true }));
            setTimeout(() => {
                setCopiedCodeIds((prev) => ({ ...prev, [codeId]: false }));
            }, 2000);
        } catch (err) {
            console.error('复制失败:', err);
        }
    };

    // 自定义的 Markdown 渲染选项
    const markdownOptions = {
        overrides: {
            code: {
                component: ({ className, children, ...props }) => {
                    const language = (className || '')
                        .replace('lang-', '')
                        .replace('language-', '');
                    const codeText = Array.isArray(children)
                        ? children.join('')
                        : typeof children === 'string'
                            ? children
                            : ''; // 处理其他可能的类型

                    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                    return (
                        <Box key={codeId} sx={{ position: 'relative' }}>
                            <SyntaxHighlighter language={language} style={atomOneLight} {...props}>
                                {codeText}
                            </SyntaxHighlighter>
                            {/* 代码块复制按钮 */}
                            <CodeCopyButtonContainer>
                                <Tooltip title="复制代码">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCopyCode(codeText, codeId)}
                                        sx={{
                                            padding: '4px',
                                        }}
                                        aria-label="复制代码"
                                    >
                                        {copiedCodeIds[codeId] ? (
                                            <CheckCircle fontSize="small" color="success" />
                                        ) : (
                                            <ContentCopy fontSize="small" />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </CodeCopyButtonContainer>
                        </Box>
                    );
                },
            },
            a: {
                component: ({ children, ...props }) => (
                    <a
                        {...props}
                        style={{
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            color: '#1976d2',
                            textDecoration: 'none',
                        }}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {children}
                    </a>
                ),
            },
            p: {
                component: ({ children, ...props }) => (
                    <Typography
                        variant="body1"
                        component="p"
                        sx={{ margin: 0, marginBottom: '0.25em' }}
                        {...props}
                    >
                        {children}
                    </Typography>
                ),
            },
            li: {
                component: ({ children, ...props }) => (
                    <li style={{ marginBottom: '0.25em' }} {...props}>
                        {children}
                    </li>
                ),
            },
            // 您可以根据需要添加更多自定义渲染器
        },
    };

    // 检测机器人是否正在加载
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.sender === 'bot' && !lastMessage.content) {
            setBotLoading(true);
        } else {
            setBotLoading(false);
        }
    }, [messages]);

    return (
        <Box
            ref={scrollContainerRef}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                overflowY: 'auto',
                paddingLeft: `${fixedAvatarDistance}px`,
                paddingRight: `${fixedAvatarDistance}px`,
                backgroundColor: '#ffffff',
            }}
        >
            {messages.map((msg) => {
                const content = msg.content || '';

                // 分离图片、视频文件和其他文件
                const imageFiles = msg.files
                    ? msg.files.filter((file) => file.type.startsWith('image/'))
                    : [];
                const videoFiles = msg.files
                    ? msg.files.filter((file) => file.type.startsWith('video/'))
                    : [];
                const otherFiles = msg.files
                    ? msg.files.filter(
                        (file) =>
                            !file.type.startsWith('image/') && !file.type.startsWith('video/')
                    )
                    : [];

                return (
                    <MessageContainer key={msg.id} sender={msg.sender}>
                        {/* 头像 */}
                        <Avatar
                            src={msg.sender === 'bot' ? botAvatar : userAvatar}
                            alt={msg.sender === 'bot' ? 'Bot' : 'User'}
                            sx={{
                                marginLeft: msg.sender === 'bot' ? 1 : 0,
                                marginRight: msg.sender === 'bot' ? 0 : 1,
                                width: 40,
                                height: 40,
                                flexShrink: 0,
                            }}
                        />
                        {/* 消息气泡 */}
                        <MessageBubble sender={msg.sender}>
                            {/* 显示呼吸动画 */}
                            {botLoading && msg.sender === 'bot' && !msg.content && (
                                <BreathingCircle />
                            )}
                            {/* 图片缩略图 */}
                            {imageFiles.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        marginBottom: content ? 1 : 0,
                                    }}
                                >
                                    {imageFiles.map((file, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                position: 'relative',
                                                marginRight: 1,
                                                marginBottom: 1,
                                            }}
                                        >
                                            <img
                                                src={file.local_url || file.file_web_path}
                                                alt={file.name}
                                                onError={(e) => {
                                                    if (e.target.src !== file.file_web_path) {
                                                        e.target.src = file.file_web_path;
                                                    }
                                                }}
                                                style={{
                                                    maxWidth: '120px',
                                                    maxHeight: '120px',
                                                    borderRadius: 4,
                                                    objectFit: 'cover',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => {
                                                    // Implement image click handler if needed
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* 视频文件 */}
                            {videoFiles.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        marginBottom: content ? 1 : 0,
                                    }}
                                >
                                    {videoFiles.map((file, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                position: 'relative',
                                                marginRight: 1,
                                                marginBottom: 1,
                                            }}
                                        >
                                            <video
                                                src={file.local_url || file.file_web_path}
                                                onError={(e) => {
                                                    if (e.target.src !== file.file_web_path) {
                                                        e.target.src = file.file_web_path;
                                                    }
                                                }}
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '200px',
                                                    borderRadius: 4,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                }}
                                                controls
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {/* 文本内容 */}
                            {content && (
                                <Markdown options={markdownOptions}>
                                    {`${content}${loading && msg.sender === 'bot' ? '_' : ''}`}
                                </Markdown>
                            )}

                            {/* 其他文件 */}
                            {otherFiles.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        marginTop: content ? 1 : 0,
                                    }}
                                >
                                    {otherFiles.map((file, index) => {
                                        // 获取文件扩展名
                                        const fileExtension = file.name.split('.').pop().toLowerCase();
                                        // 获取对应的图标
                                        const fileIcon = fileTypeIcons[fileExtension] || fileTypeIcons['default'];
                                        return (
                                            <Box
                                                key={index}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    marginRight: 2,
                                                    marginBottom: 2,
                                                    width: 80,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <a href={file.file_web_path} target="_blank" rel="noopener noreferrer">
                                                    {fileIcon}
                                                </a>
                                                <Typography variant="body2" sx={{ marginTop: 1 }}>
                                                    <a
                                                        href={file.file_web_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ textDecoration: 'none', color: '#1976d2' }}
                                                    >
                                                        {file.name}
                                                    </a>
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {/* 消息复制按钮 */}
                            {!botLoading && content && (
                                <CopyButtonContainer>
                                    <Tooltip title="复制内容">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleCopyMessage(msg.content || '', msg.id)}
                                            sx={{
                                                padding: '4px',
                                            }}
                                            aria-label="复制内容"
                                        >
                                            {copiedMessageId === msg.id ? (
                                                <CheckCircle fontSize="small" color="success" />
                                            ) : (
                                                <ContentCopy fontSize="small" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </CopyButtonContainer>
                            )}
                            {/* 时间戳 */}
                            <Typography
                                variant="caption"
                                sx={{ display: 'block', marginTop: 1, color: 'text.secondary' }}
                            >
                                {msg.createdAt}
                            </Typography>

                            {/* 显示额外字段 */}
                            {msg.sender === 'bot' && msg.model && (
                                <Box sx={{ marginTop: 1 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        模型: {msg.model}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        输入字数: {msg.inputCharacterCount}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        输入token: {msg.inputTokenCount}｜
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        输出字数: {msg.outputCharacterCount}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        输出token: {msg.outputTokenCount}
                                    </Typography>
                                </Box>
                            )}
                        </MessageBubble>
                    </MessageContainer>
                );
            })}
            {/* 滚动到内容末尾的占位元素 */}
            <div ref={contentEndRef} />
        </Box>
    );
};

export default AIGCContentArea;