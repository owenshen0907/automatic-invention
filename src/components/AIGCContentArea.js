// src/components/AIGCContentArea.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Typography, Box, Avatar, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import Markdown from 'markdown-to-jsx';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import userAvatar from '../assets/user-avatar.png';
import botAvatar from '../assets/bot-avatar.png';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const fixedAvatarDistance = 6; // 6px

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

const MessageContainer = styled(Box)(({ theme, sender }) => ({
    display: 'flex',
    flexDirection: sender === 'bot' ? 'row' : 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
    width: '100%',
}));

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

const CopyButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(0.5),
    right: theme.spacing(0.5),
}));

const CodeCopyButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
}));

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

    useLayoutEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const checkClipboardPermission = async () => {
        if (navigator.permissions) {
            try {
                const result = await navigator.permissions.query({ name: 'clipboard-write' });
                return result.state === 'granted' || result.state === 'prompt';
            } catch (err) {
                console.error('权限查询失败:', err);
                return false;
            }
        }
        return false; // Permissions API 不支持
    };

    const handleCopyText = async (text, identifier, type = 'message') => {
        const hasPermission = await checkClipboardPermission();
        if (!hasPermission) {
            console.warn('没有复制权限');
            // 可选：通知用户
        }

        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                if (type === 'message') {
                    setCopiedMessageId(identifier);
                    setTimeout(() => setCopiedMessageId(null), 2000);
                } else if (type === 'code') {
                    setCopiedCodeIds(prev => ({ ...prev, [identifier]: true }));
                    setTimeout(() => setCopiedCodeIds(prev => ({ ...prev, [identifier]: false })), 2000);
                }
            } catch (err) {
                console.error('复制失败:', err);
                fallbackCopyText(text, identifier, type);
            }
        } else {
            fallbackCopyText(text, identifier, type);
        }
    };

    const fallbackCopyText = (text, identifier, type) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                if (type === 'message') {
                    setCopiedMessageId(identifier);
                    setTimeout(() => setCopiedMessageId(null), 2000);
                } else if (type === 'code') {
                    setCopiedCodeIds(prev => ({ ...prev, [identifier]: true }));
                    setTimeout(() => setCopiedCodeIds(prev => ({ ...prev, [identifier]: false })), 2000);
                }
            } else {
                console.error('复制失败: execCommand 不成功');
            }
        } catch (err) {
            console.error('复制失败:', err);
        }

        document.body.removeChild(textarea);
    };

    const handleCopyMessage = (text, messageId) => {
        handleCopyText(text, messageId, 'message');
    };

    const handleCopyCode = (text, codeId) => {
        handleCopyText(text, codeId, 'code');
    };

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
                        <MessageBubble sender={msg.sender}>
                            {botLoading && msg.sender === 'bot' && !msg.content && (
                                <BreathingCircle />
                            )}
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
                                                    // 如有需要，添加图片点击处理逻辑
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}

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

                            {content && (
                                <Markdown options={markdownOptions}>
                                    {`${content}${loading && msg.sender === 'bot' ? '_' : ''}`}
                                </Markdown>
                            )}

                            {otherFiles.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        marginTop: content ? 1 : 0,
                                    }}
                                >
                                    {otherFiles.map((file, index) => {
                                        const fileExtension = file.name.split('.').pop().toLowerCase();
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

                            <Typography
                                variant="caption"
                                sx={{ display: 'block', marginTop: 1, color: 'text.secondary' }}
                            >
                                {msg.createdAt}
                            </Typography>

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
            <div ref={contentEndRef} />
        </Box>
    );
};

export default AIGCContentArea;