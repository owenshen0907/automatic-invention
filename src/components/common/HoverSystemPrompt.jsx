// src/components/common/HoverSystemPrompt.jsx

import React, { useEffect,useState } from 'react';
import { Box, Typography, TextField, Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';

const HoverSystemPrompt = ({ systemPrompt, setSystemPrompt }) => {
    // 定义各个预设的系统提示
    const prompts = {
        '通用': '你是一个智能助手，能进行自然对话、图像分析、逻辑推理、代码编写、联网搜索和娱乐互动。你理解上下文，提供简洁、准确的回复，帮助用户完成从专业问题到日常任务的多种需求。',
        '聊天对话': '你是个灵活、有个性的助手，随用户情绪变化调整回应，保持自然流畅的交流。你会保持幽默感、亲和力，并通过拟人化的互动，营造自然的交流氛围。无论是正式回答还是轻松对话，你都能根据用户需求进行调整，给予贴心而有趣的回应。',
        '文本处理': '你擅长文本分析，能够快速识别、提炼出重要的关键词、核心思想，并生成简明的总结。你能有效地简化复杂文本，帮助用户理解要点，并为内容的进一步分析和优化提供建议。你的目标是让繁杂的信息更易于吸收，为用户节省时间。',
        '图像处理': '你具备先进的图像处理能力，能够识别图片中的文字、环境信息、主要物体和背景。你可以将图像内容提炼为简洁的描述，帮助用户快速获取关键信息。你还能根据用户需求提供场景细节和对象的深入分析，帮助他们深入理解图片内容。',
        '编程': '你是一名熟练的编程助手，能够从开发者的角度出发，分析代码、调试问题，并提供有效的改进建议。你理解编程的逻辑与实践，能解释复杂的技术概念，并根据问题所在推荐优化或修复方法。你致力于为用户提供清晰、实用的技术支持和解决方案。'
    };

    const promptOptions = ['通用', '聊天对话', '文本处理', '图像处理', '编程', '自定义'];
    const defaultOption = '通用';
    const defaultText = prompts[defaultOption];

    const [selectedOption, setSelectedOption] = useState(defaultOption);
    // 初始化时，检查并设置默认值
    useEffect(() => {
        const storedPrompt = localStorage.getItem('aigcSystemPrompt');
        if (storedPrompt === null) { // 仅在首次加载时设置默认值
            setSystemPrompt(defaultText);
            setSelectedOption(defaultOption);
        }else {
            // 检查存储的prompt是否匹配预定义的选项
            const matchedOption = Object.keys(prompts).find(option => prompts[option] === storedPrompt);
            if (matchedOption) {
                setSelectedOption(matchedOption);
            } else {
                setSelectedOption('自定义');
            }
        }
    }, [setSystemPrompt]);

    // 当输入发生变化时，更新状态并自动保存
    const handleInputChange = (event) => {
        const userInput = event.target.value;
        setSystemPrompt(userInput);
    };

    // 当选项变化时，更新systemPrompt
    const handleOptionChange = (event) => {
        const option = event.target.value;
        setSelectedOption(option);
        if (option === '自定义') {
            setSystemPrompt('');
        } else {
            setSystemPrompt(prompts[option]);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                position: 'relative',
                padding: 1, // 添加适当的内边距
            }}
        >
            {/* 前缀标签 */}
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                系统提示 (system_prompt):
            </Typography>
            {/* 单选按钮组 */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
                <RadioGroup row value={selectedOption} onChange={handleOptionChange}>
                    {promptOptions.map(option => (
                        <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={option}
                        />
                    ))}
                </RadioGroup>
            </FormControl>
            {/* 多行文本输入框 */}
            <TextField
                multiline
                variant="outlined"
                fullWidth
                rows={4} // 根据需要调整行数
                value={systemPrompt}
                onChange={handleInputChange}
                sx={{ flex: 1 }}
                aria-label="系统提示输入框"
                placeholder="例如：你是一个智能助手，能够帮助用户解答问题。"
            />
        </Box>
    );
};

export default HoverSystemPrompt;