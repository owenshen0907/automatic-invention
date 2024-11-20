// src/components/CodeBlock.jsx
import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { ContentCopy, CheckCircle } from '@mui/icons-material';
import { styled } from '@mui/system';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// 定义复制按钮的容器样式
const CopyButtonContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

// 定义自定义的 IconButton 样式
const IconButtonStyled = styled(IconButton)(({ theme }) => ({
    padding: '4px',
    color: theme.palette.text.secondary,
    '&:hover': {
        color: theme.palette.primary.main,
    },
}));

const CodeBlock = ({ code, language }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000); // 2秒后恢复
            } catch (err) {
                console.error('复制失败:', err);
            }
        } else {
            // 兼容性处理
            const textarea = document.createElement('textarea');
            textarea.value = code;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('复制失败:', err);
            }
            document.body.removeChild(textarea);
        }
    };

    return (
        <Box sx={{ position: 'relative', marginTop: 2, marginBottom: 2 }}>
            <SyntaxHighlighter language={language} style={atomOneLight} PreTag="div">
                {code}
            </SyntaxHighlighter>
            <CopyButtonContainer>
                <Tooltip title={copied ? '已复制' : '复制代码'}>
                    <IconButtonStyled size="small" onClick={handleCopy} aria-label="复制代码">
                        {copied ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                    </IconButtonStyled>
                </Tooltip>
            </CopyButtonContainer>
        </Box>
    );
};

export default CodeBlock;