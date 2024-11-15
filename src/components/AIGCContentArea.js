// src/components/AIGCContentArea.jsx
import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { Typography, Box, Avatar, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/system';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'; // 使用浅色主题
import userAvatar from '../assets/user-avatar.png'; // 用户头像图片
import botAvatar from '../assets/bot-avatar.png'; // 机器人头像图片

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
    flexDirection: sender === 'bot' ? 'row' : 'row-reverse', // 机器人消息左对齐，用户消息右对齐
    alignItems: 'flex-start', // 头像和消息顶部对齐
    marginBottom: theme.spacing(1),
    width: '100%', // 占满容器宽度
}));

// 定义消息气泡样式
const MessageBubble = styled(Box)(({ theme, sender }) => ({
    // 设置不同发送者的宽度
    maxWidth: sender === 'bot' ? '90%' : '70%', // bot 消息最大宽度为90%，user为70%
    width: sender === 'bot' ? '100%' : 'auto', // bot 消息占满最大宽度，user消息根据内容自动调整
    padding: theme.spacing(1.5, 2),
    borderRadius: 12,
    backgroundColor: sender === 'user' ? '#f0f0f0' : '#ffffff', // 用户消息使用更浅的灰色，机器人消息使用白色
    color: '#333', // 统一深色文字
    wordBreak: 'break-word', // 防止长单词或链接导致布局问题
    overflowWrap: 'break-word', // 处理长单词的换行
    whiteSpace: 'pre-wrap', // 保留空白符并允许自动换行
    overflowX: 'auto', // 允许横向滚动
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', // 添加轻微阴影以提升质感
    position: 'relative', // 为复制按钮定位提供参考
    '& pre': {
        // 确保 pre 块内容可横向滚动
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        backgroundColor: '#f5f5f5', // 代码块背景色
        padding: '10px',
        borderRadius: '8px',
        position: 'relative', // 为代码块复制按钮定位
    },
    '& code': {
        // 确保内联代码块不会打乱布局
        wordBreak: 'break-word',
        backgroundColor: 'rgba(0, 0, 0, 0.05)', // 半透明灰色背景
        padding: '2px 4px',
        borderRadius: '4px',
    },
    // 新增：列表样式
    '& ul, & ol': {
        listStyleType: 'disc', // 默认使用圆点，'ol' 会被自定义渲染器覆盖
        marginLeft: theme.spacing(2), // 左边距
        paddingLeft: 0,
    },
    '& li': {
        marginBottom: theme.spacing(0.25), // 列表项间距
    },
    // 自定义段落样式，减少上下边距
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
    default: <InsertDriveFileIcon fontSize="large" color="action" />, // 默认图标
};

const AIGCContentArea = ({ messages, loading }) => {
    const contentEndRef = useRef(null);
    const scrollContainerRef = useRef(null); // 添加滚动容器引用
    const [copiedMessageId, setCopiedMessageId] = useState(null);
    const [copiedCodeIds, setCopiedCodeIds] = useState({}); // 存储已复制的代码块ID
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
            }, 2000); // 2秒后重置
        } catch (err) {
            console.error('复制失败:', err);
            // 可选择显示错误提示
        }
    };

    const handleCopyCode = async (text, codeId) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedCodeIds((prev) => ({ ...prev, [codeId]: true }));
            setTimeout(() => {
                setCopiedCodeIds((prev) => ({ ...prev, [codeId]: false }));
            }, 2000); // 2秒后重置
        } catch (err) {
            console.error('复制失败:', err);
            // 可选择显示错误提示
        }
    };

    // 修改后的 preprocessContent 函数，接受 sender 参数
    const preprocessContent = (content, sender) => {
        // 确保 content 是字符串
        content = content ? String(content) : '';
        if (sender === 'bot') {
            // 替换多个连续的换行符为单个换行符
            let processed = content.replace(/\n{2,}/g, '\n');
            return processed;
        } else {
            // 对于用户消息，保持现有处理
            let processed = content.replace(/\n-\s/g, '- ');
            processed = processed.replace(/\n(\d+\.\s)/g, '$1');
            processed = processed.replace(/\n{2,}/g, '\n');
            return processed;
        }
    };

    // 过滤连续换行符消息的函数
    const filterConsecutiveLineBreaks = (messages) => {
        const filteredMessages = [];
        let previousWasLineBreak = false;

        messages.forEach(msg => {
            // 确保 msg.content 是字符串，避免 undefined 或 null 引发错误
            const content = msg.content ? String(msg.content) : '';
            const isLineBreak = /^\s*$/.test(content); // 判断消息内容是否仅包含空白字符
            if (msg.sender === 'bot') { // 只对机器人消息进行处理
                if (isLineBreak) {
                    if (!previousWasLineBreak) {
                        filteredMessages.push(msg);
                        previousWasLineBreak = true;
                    }
                    // 如果前一条也是换行符，则跳过当前消息
                } else {
                    // 对于有效内容消息，预处理内容后再判断是否为空
                    const processedContent = preprocessContent(content, msg.sender);
                    if (processedContent.trim() !== '') {
                        filteredMessages.push(msg);
                        previousWasLineBreak = false;
                    }
                    // 如果预处理后内容为空，则视为换行符消息
                    else {
                        if (!previousWasLineBreak) {
                            filteredMessages.push(msg);
                            previousWasLineBreak = true;
                        }
                    }
                }
            } else {
                // 用户消息不受影响，直接添加
                filteredMessages.push(msg);
                previousWasLineBreak = false;
            }
        });

        return filteredMessages;
    };

    // 自定义渲染器
    const renderersForMessage = {
        code({ node, inline, className, children, ...props }) {
            // 由于没有 msg 在这个作用域内，需要在外部传递 msg 或使用其他方法
            // 这里假设我们不需要 msg.id 来生成 codeId，可以使用 Math.random 或其他唯一标识符
            const match = /language-(\w+)/.exec(className || '');
            const codeId = `code-${Math.random().toString(36).substr(2, 9)}`; // 生成唯一ID
            if (!inline && match) {
                const language = match[1];
                const codeText = String(children).replace(/\n$/, '');
                return (
                    <Box key={codeId} sx={{ position: 'relative' }}>
                        <SyntaxHighlighter
                            style={oneLight} // 使用浅色主题
                            language={language}
                            PreTag="div"
                            {...props}
                        >
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
                                    aria-label="复制代码" // 增加无障碍标签
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
            } else {
                return (
                    <code
                        className={className}
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.05)', // 半透明灰色背景
                            padding: '2px 4px',
                            borderRadius: '4px',
                            color: '#333', // 深色文字
                        }}
                        {...props}
                    >
                        {children}
                    </code>
                );
            }
        },
        a: ({ node, ...props }) => (
            <a
                {...props}
                style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    color: '#1976d2', // 统一使用主题主色
                    textDecoration: 'none',
                }}
                target="_blank"
                rel="noopener noreferrer"
            >
                {props.children}
            </a>
        ),
        p: ({ node, ...props }) => (
            <Typography variant="body1" component="p" sx={{ margin: 0, marginBottom: '0.25em' }} {...props} />
        ),
        ol: ({ node, ...props }) => (
            <ol style={{ listStyleType: 'decimal', marginLeft: '1.5em', paddingLeft: '0.5em', marginTop: '0.25em', marginBottom: '0.25em' }} {...props} />
        ),
        ul: ({ node, ...props }) => (
            <ul style={{ listStyleType: 'disc', marginLeft: '1.5em', paddingLeft: '0.5em', marginTop: '0.25em', marginBottom: '0.25em' }} {...props} />
        ),
        li: ({ node, ...props }) => (
            <li style={{ marginBottom: '0.25em' }} {...props} />
        ),
    };

    // 使用 useMemo 缓存过滤后的消息，提高性能
    const filteredMessages = useMemo(() => filterConsecutiveLineBreaks(messages), [messages]);


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
            ref={scrollContainerRef} // 绑定滚动容器引用
            sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                overflowY: 'auto',
                paddingLeft: `${fixedAvatarDistance}px`,
                paddingRight: `${fixedAvatarDistance}px`,
                backgroundColor: '#ffffff', // 设置整体背景色为白色
            }}
        >
            {filteredMessages.map((msg) => {

                // 预处理消息内容
                const processedContent = preprocessContent(msg.content || '', msg.sender);
                // 如果预处理后的内容为空，则不渲染该消息
                if (processedContent.trim() === '' && msg.sender === 'bot' && !botLoading) {
                    return null;
                }

                // 分离图片、视频文件和其他文件
                const imageFiles = msg.files
                    ? msg.files.filter(file => file.type.startsWith('image/'))
                    : [];
                const videoFiles = msg.files
                    ? msg.files.filter(file => file.type.startsWith('video/'))
                    : [];
                const otherFiles = msg.files
                    ? msg.files.filter(
                        file =>
                            !file.type.startsWith('image/') &&
                            !file.type.startsWith('video/')
                    )
                    : [];

                return (
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
                            {/* 显示呼吸动画 */}
                            {botLoading && msg.sender === 'bot' && !msg.content && (
                                <BreathingCircle />
                            )}
                            {/* 图片缩略图 - 先渲染图片 */}
                            {imageFiles.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        marginBottom: processedContent ? 1 : 0,
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
                                                        e.target.src = file.file_web_path; // 回退到 file_web_path
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
                                                    // Implement image click handler if needed (e.g., open in modal)
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
                                        marginBottom: processedContent ? 1 : 0,
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
                                                        e.target.src = file.file_web_path; // 回退到 file_web_path
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
                            {processedContent && (
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm, remarkBreaks]}
                                    components={renderersForMessage}
                                >
                                    {`${processedContent}${loading && msg.sender === 'bot' ? '_' : ''}`}
                                </ReactMarkdown>
                            )}

                            {/* 其他文件 - 在文本内容下方渲染 */}
                            {otherFiles.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        marginTop: processedContent ? 1 : 0,
                                    }}
                                >
                                    {otherFiles.map((file, index) => {
                                        // 获取文件扩展名
                                        const fileExtension = file.name.split('.').pop().toLowerCase();
                                        // 获取对应的图标，如果没有对应图标则使用默认图标
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
                                                    width: 80, // 设置固定宽度
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {file.type.startsWith('video/') ? (
                                                    <video
                                                        src={file.local_url || file.file_web_path}
                                                        onError={(e) => {
                                                            if (e.target.src !== file.file_web_path) {
                                                                e.target.src = file.file_web_path; // 回退到 file_web_path
                                                            }
                                                        }}
                                                        style={{
                                                            width: '100%',
                                                            height: 'auto',
                                                            borderRadius: 4,
                                                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                                        }}
                                                        muted
                                                        controls
                                                    />
                                                ) : (
                                                    <a href={file.file_web_path} target="_blank"
                                                       rel="noopener noreferrer">
                                                        {fileIcon}
                                                    </a>
                                                )}
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
                            {!botLoading && processedContent && (
                            <CopyButtonContainer>
                                <Tooltip title="复制内容">
                                    <IconButton
                                        size="small"
                                        onClick={() => handleCopyMessage(msg.content || '', msg.id)}
                                        sx={{
                                            padding: '4px',
                                        }}
                                        aria-label="复制内容" // 更新无障碍标签
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
                            <Typography variant="caption" sx={{ display: 'block', marginTop: 1, color: 'text.secondary' }}>
                                {msg.createdAt}
                            </Typography>

                            {/* 显示额外字段仅在bot消息且字段存在 */}
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