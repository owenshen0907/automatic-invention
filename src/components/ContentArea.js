import React, { useEffect, useRef } from 'react';
import { Typography, Box, Avatar } from '@mui/material';
import { styled } from '@mui/system';
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
    maxWidth: sender === 'user' ? '70%' : '90%',
    padding: theme.spacing(1, 2),
    borderRadius: 16,
    backgroundColor: sender === 'user' ? '#FFC0CB' : theme.palette.grey[300], // 用户消息设置为浅粉色
    color: sender === 'user' ? '#fff' : '#000',
    wordBreak: 'break-word', // 防止长单词或链接导致布局问题
}));

const ContentArea = ({ messages, loading }) => {
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
                height: '100%',
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
                        <Typography variant="body1">
                            {msg.content}
                            {/* 如果正在加载，显示一个下划线占位符 */}
                            {loading && msg.sender === 'bot' && '_'}
                        </Typography>
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

export default ContentArea;