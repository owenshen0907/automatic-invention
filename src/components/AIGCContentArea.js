// src/components/AIGCContentArea.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Typography, Box, Avatar, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { styled } from '@mui/system';
import { ContentCopy, CheckCircle, Refresh } from '@mui/icons-material';
import Markdown from 'markdown-to-jsx';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import userAvatar from '../assets/user-avatar.png';
import botAvatar from '../assets/bot-avatar.png';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// 文件类型图标映射
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

// 样式定义
const fixedAvatarDistance = 6; // 6px

const MessageContainer = styled(Box)(({ theme, sender }) => ({
    display: 'flex',
    flexDirection: sender === 'bot' ? 'row' : 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
    width: '100%',
}));

const MessageBubble = styled(Box)(({ theme, sender }) => ({
    maxWidth: sender === 'bot' ? '90%' : '75%', // Bot 消息宽度设置为 90%
    width: 'auto',
    padding: theme.spacing(1.5, 2),
    borderRadius: 12, // 圆角
    backgroundColor: sender === 'user' ? '#f0f0f0' : '#ffffff', // 简洁背景色
    color: '#333',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    boxShadow: 'none', // 去除阴影
    position: 'relative',
    paddingBottom: sender === 'bot' ? theme.spacing(4) : theme.spacing(1.5),
    fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif', // 统一字体
}));

const CopyButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(0.5),
    right: theme.spacing(4), // 留出空间给 Regenerate 按钮
}));

const RegenerateButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(0.5),
    right: theme.spacing(0.5), // 紧靠复制按钮
}));

const CodeCopyButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(0.5),
    right: theme.spacing(0.5),
}));

const IconButtonStyled = styled(IconButton)(({ theme }) => ({
    padding: '4px',
    color: theme.palette.text.secondary,
    '&:hover': {
        color: theme.palette.primary.main,
    },
}));

const MarkdownContainer = styled(Box)(({ theme }) => ({
    '& p': {
        margin: 0,
        marginBottom: '0.1em', // 减小段落间距
        lineHeight: 1.4, // 调整行高
    },
    '& li': {
        marginBottom: '0.1em', // 减小列表项间距
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
        margin: 0,
        marginBottom: '0.2em', // 减小标题间距
        lineHeight: 1.3, // 调整行高
    },
    // 其他元素的样式调整（如需要）
}));

const AIGCContentArea = ({ messages, loading, onRegenerate }) => {
    const contentEndRef = useRef(null);
    const scrollContainerRef = useRef(null);
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [copiedCodeIds, setCopiedCodeIds] = useState({});
    const [botLoading, setBotLoading] = useState(false);
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    // 状态管理菜单
    const [anchorEls, setAnchorEls] = useState({}); // { [msg.id]: anchorEl }

    useLayoutEffect(() => {
        if (scrollContainerRef.current) {
            if (!isUserScrolling) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
            }
        }
    }, [messages, loading, isUserScrolling]);

    // 监听滚动事件，判断用户是否在滚动
    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const {scrollTop, scrollHeight, clientHeight} = scrollContainerRef.current;
                const isAtBottom = scrollHeight - scrollTop - clientHeight < 50; // 阈值50px
                setIsUserScrolling(!isAtBottom);
            }
        };

        const scrollContainer = scrollContainerRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const handleCopyText = async (text, identifier, type = 'message') => {
        if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                if (type === 'message') {
                    setCopiedMessageId(identifier);
                    setTimeout(() => setCopiedMessageId(null), 2000);
                } else if (type === 'code') {
                    setCopiedCodeIds(prev => ({...prev, [identifier]: true}));
                    setTimeout(() => setCopiedCodeIds(prev => ({...prev, [identifier]: false})), 2000);
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
                    setCopiedCodeIds(prev => ({...prev, [identifier]: true}));
                    setTimeout(() => setCopiedCodeIds(prev => ({...prev, [identifier]: false})), 2000);
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

    // 处理菜单打开
    const handleOpenMenu = (event, messageId) => {
        setAnchorEls(prev => ({...prev, [messageId]: event.currentTarget}));
    };

    // 处理菜单关闭
    const handleCloseMenu = (messageId) => {
        setAnchorEls(prev => ({...prev, [messageId]: null}));
    };

    // 处理重新生成选项
    const handleRegenerate = (messageId, option) => {
        handleCloseMenu(messageId);
        if (onRegenerate) {
            onRegenerate(messageId, option);
        }
    };

    // 预处理内容，移除多余空行
    const processContent = (content) => {
        // 移除连续三个及以上的换行符，替换为两个换行符
        return content.replace(/(\r?\n){3,}/g, '\n\n');
    };

    // 自定义 Markdown 渲染器组件
    const markdownOptions = {
        overrides: {
            // 处理代码块
            pre: {
                component: ({children, ...props}) => {
                    const code = children.props.children;
                    const match = /language-(\w+)/.exec(children.props.className || '');
                    const language = match ? match[1] : '';

                    const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
                    return (
                        <Box key={codeId} sx={{position: 'relative'}}>
                            <SyntaxHighlighter language={language} style={atomOneLight} PreTag="div" {...props}>
                                {code}
                            </SyntaxHighlighter>
                            {/* 代码块复制按钮 */}
                            <CodeCopyButtonContainer>
                                <Tooltip title="复制代码">
                                    <IconButtonStyled
                                        size="small"
                                        onClick={() => handleCopyCode(code, codeId)}
                                        aria-label="复制代码"
                                    >
                                        {copiedCodeIds[codeId] ? (
                                            <CheckCircle fontSize="small" color="success"/>
                                        ) : (
                                            <ContentCopy fontSize="small"/>
                                        )}
                                    </IconButtonStyled>
                                </Tooltip>
                            </CodeCopyButtonContainer>
                        </Box>
                    );
                },
            },
            // 处理内联代码
            code: {
                component: ({children, ...props}) => (
                    <code
                        {...props}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif',
                        }}
                    >
                        {children}
                    </code>
                ),
            },
            // 处理链接
            a: {
                component: ({children, ...props}) => (
                    <a
                        {...props}
                        style={{
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
            // 处理段落
            p: {
                component: ({children, ...props}) => (
                    <Typography
                        variant="body1"
                        component="p"
                        sx={{
                            margin: 0,
                            marginBottom: '0.1em', // 减小段落间距
                            lineHeight: 1.4, // 调整行高
                        }}
                        {...props}
                    >
                        {children}
                    </Typography>
                ),
            },
            // 处理列表项
            li: {
                component: ({children, ...props}) => (
                    <li style={{marginBottom: '0.1em'}} {...props}>
                        {children}
                    </li>
                ),
            },
            // 处理标题 h1
            h1: {
                component: ({children, ...props}) => (
                    <Typography
                        variant="h6" // 使用较小的标题级别
                        component="h1"
                        sx={{
                            margin: 0,
                            marginBottom: '0.2em', // 减小标题间距
                            lineHeight: 1.3, // 调整行高
                        }}
                        {...props}
                    >
                        {children}
                    </Typography>
                ),
            },
            // 处理标题 h2
            h2: {
                component: ({children, ...props}) => (
                    <Typography
                        variant="subtitle1" // 使用较小的标题级别
                        component="h2"
                        sx={{
                            margin: 0,
                            marginBottom: '0.2em', // 减小标题间距
                            lineHeight: 1.3, // 调整行高
                        }}
                        {...props}
                    >
                        {children}
                    </Typography>
                ),
            },
            // 其他自定义渲染器（如需要）
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
                fontFamily: 'Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif', // 统一字体
            }}
        >
            {messages.map((msg) => {
                const rawContent = msg.content || '';
                const content = processContent(rawContent);

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
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            backgroundColor: '#1976d2',
                                            animation: 'breathing 1.5s infinite',
                                        }}
                                    />
                                </Box>
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
                                                    borderRadius: 8, // 增加圆角
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s',
                                                }}
                                                onMouseOver={(e) => (e.target.style.transform = 'scale(1.05)')}
                                                onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
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
                                                    borderRadius: 8, // 增加圆角
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s',
                                                }}
                                                controls
                                                onMouseOver={(e) => (e.target.style.transform = 'scale(1.02)')}
                                                onMouseOut={(e) => (e.target.style.transform = 'scale(1)')}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {content && (
                                <MarkdownContainer>
                                    <Markdown options={markdownOptions}>
                                        {`${content}${loading && msg.sender === 'bot' ? '_' : ''}`}
                                    </Markdown>
                                </MarkdownContainer>
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
                                                <Typography variant="body2" sx={{marginTop: 1}}>
                                                    <a
                                                        href={file.file_web_path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{textDecoration: 'none', color: '#1976d2'}}
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
                                        <IconButtonStyled
                                            size="small"
                                            onClick={() => handleCopyMessage(msg.content || '', msg.id)}
                                            aria-label="复制内容"
                                        >
                                            {copiedMessageId === msg.id ? (
                                                <CheckCircle fontSize="small" color="success"/>
                                            ) : (
                                                <ContentCopy fontSize="small"/>
                                            )}
                                        </IconButtonStyled>
                                    </Tooltip>
                                </CopyButtonContainer>
                            )}
                            {/* 重新生成按钮 */}
                            {msg.sender === 'bot' && (
                                <RegenerateButtonContainer>
                                    <Tooltip title="重新生成">
                                        <IconButtonStyled
                                            size="small"
                                            onClick={(e) => handleOpenMenu(e, msg.id)}
                                            aria-label="重新生成"
                                        >
                                            <Refresh/>
                                        </IconButtonStyled>
                                    </Tooltip>
                                    <Menu
                                        anchorEl={anchorEls[msg.id]}
                                        open={Boolean(anchorEls[msg.id])}
                                        onClose={() => handleCloseMenu(msg.id)}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'left',
                                        }}
                                        transformOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                    >
                                        <MenuItem onClick={() => handleRegenerate(msg.id, '极速')}>极速</MenuItem>
                                        <MenuItem onClick={() => handleRegenerate(msg.id, '均衡')}>均衡</MenuItem>
                                        <MenuItem onClick={() => handleRegenerate(msg.id, '高级')}>高级</MenuItem>
                                    </Menu>
                                </RegenerateButtonContainer>
                            )}

                            <Typography
                                variant="caption"
                                sx={{display: 'block', marginTop: 1, color: 'text.secondary'}}
                            >
                                {msg.createdAt}
                            </Typography>

                            {msg.sender === 'bot' && msg.model && (
                                <Box sx={{marginTop: 1}}>
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
            <div ref={contentEndRef}/>
        </Box>
    );
};
export default AIGCContentArea;