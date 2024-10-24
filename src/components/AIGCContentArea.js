// src/components/AIGCContentArea.jsx
import React, { useEffect, useRef } from 'react';
import { Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/system';
import { Description } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import userAvatar from '../assets/user-avatar.png'; // 用户头像图片
import botAvatar from '../assets/bot-avatar.png'; // 机器人头像图片

const fixedAvatarDistance = 6; // 6px

const MessageContainer = styled(Box)(({ theme, sender }) => ({
    display: 'flex',
    flexDirection: sender === 'bot' ? 'row' : 'row-reverse', // 机器人消息左对齐，用户消息右对齐
    alignItems: 'flex-start', // 头像和消息顶部对齐
    marginBottom: theme.spacing(2),
    width: '100%', // 占满容器宽度
}));

const MessageBubble = styled(Box)(({ theme, sender }) => ({
    maxWidth: sender === 'user' ? '70%' : '100%',
    padding: theme.spacing(1, 2),
    borderRadius: 16,
    backgroundColor: sender === 'user' ? '#FFC0CB' : theme.palette.grey[300], // 用户消息设置为浅粉色
    color: sender === 'user' ? '#fff' : '#000',
    wordBreak: 'break-word', // 防止长单词或链接导致布局问题
    overflowWrap: 'break-word', // 处理长单词的换行
    whiteSpace: 'pre-wrap', // 保留空白符并允许自动换行
    overflow: 'hidden', // 隐藏溢出内容
}));

const renderers = {
    code({ node, inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
            <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
            >
                {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
        ) : (
            <code className={className} {...props}>
                {children}
            </code>
        );
    },
    a: ({ node, ...props }) => (
        <a
            {...props}
            style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                // 添加其他样式以确保链接换行
            }}
            target="_blank"
            rel="noopener noreferrer"
        >
            {props.children}
        </a>
    ),
    p: ({ node, ...props }) => (
        <Typography variant="body1" component="p" {...props} />
    ),
};

const AIGCContentArea = ({ messages, loading }) => {
    const contentEndRef = useRef(null);

    useEffect(() => {
        if (contentEndRef.current) {
            contentEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                overflowY: 'auto',
                paddingLeft: `${fixedAvatarDistance}px`,
                paddingRight: `${fixedAvatarDistance}px`,
            }}
        >
            {messages.map((msg) => (
                <MessageContainer key={msg.id} sender={msg.sender}>
                    {/* 头像 */}
                    <Avatar
                        src={msg.sender === 'bot' ? botAvatar : userAvatar}
                        alt={msg.sender === 'bot' ? 'Bot' : 'User'}
                        sx={{
                            marginLeft: msg.sender === 'bot' ? 1 : 0, // 机器人头像右边距
                            marginRight: msg.sender === 'bot' ? 0 : 1, // 用户头像左边距
                            width: 40,
                            height: 40,
                            flexShrink: 0, // 防止头像缩小
                        }}
                    />
                    {/* 消息气泡 */}
                    <MessageBubble sender={msg.sender}>
                        {/* 文本内容 */}
                        {msg.content && (
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={renderers}
                            >
                                {`${msg.content}${loading && msg.sender === 'bot' ? '_' : ''}`}
                            </ReactMarkdown>
                        )}
                        {/* 文件或图片缩略图 */}
                        {msg.files && msg.files.length > 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    marginTop: msg.content ? 1 : 0,
                                }}
                            >
                                {msg.files.map((file, index) => (
                                    file.type === 'image' ? (
                                        <img
                                            key={index}
                                            src={file.url || file.previewUrl}
                                            alt={file.name}
                                            style={{
                                                maxWidth: '100px',
                                                maxHeight: '100px',
                                                marginRight: 8,
                                                marginBottom: 8,
                                                borderRadius: 4,
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginRight: 2,
                                                marginBottom: 2,
                                            }}
                                        >
                                            <Description sx={{ marginRight: 1 }} />
                                            <Typography variant="body2">
                                                <a href={file.url || '#'} target="_blank" rel="noopener noreferrer">
                                                    {file.name}
                                                </a>
                                            </Typography>
                                        </Box>
                                    )
                                ))}
                            </Box>
                        )}
                        <Typography variant="caption">
                            {msg.createdAt}
                        </Typography>
                    </MessageBubble>
                </MessageContainer>
            ))}

            {/* 滚动到内容末尾的占位元素 */}
            <div ref={contentEndRef} />
        </Box>
    );
};

export default AIGCContentArea;