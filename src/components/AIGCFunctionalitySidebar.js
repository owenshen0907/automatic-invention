// src/components/AIGCFunctionalitySidebar.jsx

import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import { KnowledgeBaseContext } from '../context/KnowledgeBaseContext';
import useKnowledgeBaseFiles from '../hooks/useKnowledgeBaseFiles'; // Import the custom hook

// 自定义样式
const SidebarContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    height: '100%',
    overflowY: 'auto',
}));

const FormControlStyled = styled(FormControl)(({ theme }) => ({
    backgroundColor: '#f9f9f9',
}));

const AIGCFunctionalitySidebar = ({
                                      selectedPipeline = '',
                                      onPipelineChange = () => {},
                                      onKnowledgeBaseChange = () => {},
                                      onWebSearchChange = () => {},
                                      enableWebSearch = false, // 接收 enableWebSearch 作为 prop
                                      onFileChange = () => {}, // 新增 prop 以处理文件选择变化
                                      setSnackbar = () => {}, // 新增 prop 以处理 Snackbar 通知
                                  }) => {
    const { knowledgeBases, loading } = useContext(KnowledgeBaseContext);
    const [selectedKB, setSelectedKB] = useState('');
    const [pipelineOptions, setPipelineOptions] = useState([]);

    // 文件选择状态
    const [selectedFile, setSelectedFile] = useState('');

    // 使用 useKnowledgeBaseFiles 钩子，始终传入固定的 knowledgeBaseID
    const {
        files,
        loading: filesLoading,
        fetchFiles,
    } = useKnowledgeBaseFiles('local20241015145535', true, setSnackbar);
    // 说明：
    // - 始终获取 'local20241015145535' 的文件，与知识库选择无关。
    // 加载 Pipeline 选项
    useEffect(() => {
        const pipelineOptionsFromEnv = process.env.REACT_APP_PIPELINE_OPTIONS;
        console.log('pipelineOptionsFromEnv:', pipelineOptionsFromEnv);

        if (pipelineOptionsFromEnv) {
            try {
                const parsedOptions = JSON.parse(pipelineOptionsFromEnv);
                console.log('parsedOptions:', parsedOptions);

                setPipelineOptions(parsedOptions);

                if (parsedOptions.length > 0 && !selectedPipeline) {
                    const defaultPipeline = parsedOptions[0].value;
                    onPipelineChange(defaultPipeline); // 设置默认值
                }
            } catch (error) {
                console.error('解析 REACT_APP_PIPELINE_OPTIONS 失败:', error);
            }
        } else {
            console.error('REACT_APP_PIPELINE_OPTIONS 未定义或为空');
        }
    }, [selectedPipeline, onPipelineChange]);

    // 随着 pipeline 的改变，重置功能区的内容
    useEffect(() => {
        if (selectedPipeline !== 'StepFun') {
            setSelectedKB('');
            onKnowledgeBaseChange('');
            onWebSearchChange(false);
            setSelectedFile(''); // 重置文件选择
        }
    }, [selectedPipeline, onKnowledgeBaseChange, onWebSearchChange]);

    const handleKBChange = (event) => {
        const value = event.target.value;
        setSelectedKB(value);

        if (onKnowledgeBaseChange) {
            onKnowledgeBaseChange(value);
        }
    };

    const handlePipelineChangeLocal = (event) => {
        const newPipeline = event.target.value;
        if (onPipelineChange) {
            onPipelineChange(newPipeline);
        }
    };

    const handleWebSearchToggle = (event) => {
        const isEnabled = event.target.checked;
        if (onWebSearchChange) {
            onWebSearchChange(isEnabled);
        }
    };
    const handleFileChange = (event) => {
        const value = event.target.value;
        setSelectedFile(value);

        if (onFileChange) {
            onFileChange(value);
        }
    };
    // 过滤掉 model_owner 为 'local' 的知识库
    const filteredKnowledgeBases = knowledgeBases
        ? knowledgeBases.filter((kb) => kb.model_owner !== 'local')
        : [];
    // 过滤文件，只显示有 vector_file_id 的文件
    const filteredFiles = files ? files.filter((file) => file.vector_file_id) : [];

    // 调试：日志输出选中的知识库和过滤后的文件
    useEffect(() => {
        console.log('Selected KB:', selectedKB);
        // console.log('Filtered Files:', filteredFiles);
    }, [selectedKB]);

    return (
        <SidebarContainer>
            <Typography variant="h5" gutterBottom>
                功能区
            </Typography>

            {/* Pipeline 选择 */}
            <Box sx={{ marginBottom: 3 }}>
                <FormControlStyled fullWidth variant="outlined" size="small">
                    <InputLabel id="pipeline-select-label">选择 Pipeline</InputLabel>
                    <Select
                        labelId="pipeline-select-label"
                        value={selectedPipeline}
                        onChange={handlePipelineChangeLocal}
                        label="选择 Pipeline"
                    >
                        {pipelineOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControlStyled>
            </Box>

            {/* 条件渲染：仅当 Pipeline 为 'StepFun' 时显示 */}
            {selectedPipeline === 'StepFun' && (
                <>
                    {/* 知识库选择 */}
                    <Box sx={{ marginBottom: 3 }}>
                        <FormControlStyled fullWidth variant="outlined" size="small">
                            <InputLabel id="knowledge-base-select-label">选择知识库</InputLabel>
                            <Select
                                labelId="knowledge-base-select-label"
                                value={selectedKB}
                                onChange={handleKBChange}
                                label="选择知识库"
                                disabled={loading} // 禁用选择器在加载时
                            >
                                <MenuItem value="">清除选择</MenuItem> {/* 清除选项 */}
                                {filteredKnowledgeBases.map((kb) => (
                                    <MenuItem key={kb.id} value={kb.id}>
                                        {kb.display_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControlStyled>
                    </Box>
                    {/* 文件选择框，独立于知识库选择 */}
                    <Box sx={{ marginBottom: 3 }}>
                        {filesLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <FormControlStyled fullWidth variant="outlined" size="small">
                                <InputLabel id="file-select-label">选择文件</InputLabel>
                                <Select
                                    labelId="file-select-label"
                                    value={selectedFile}
                                    onChange={handleFileChange}
                                    label="选择文件"
                                >
                                    <MenuItem value="">清除选择</MenuItem> {/* 清除选项 */}
                                    {filteredFiles.length > 0 ? (
                                        filteredFiles.map((file) => (
                                            <MenuItem key={file.vector_file_id} value={file.vector_file_id}>
                                                {file.file_name}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>
                                            无可用文件
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControlStyled>
                        )}
                    </Box>

                    {/* 是否启用联网搜索 */}
                    <Box sx={{ marginBottom: 3 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enableWebSearch} // 使用来自父组件的值
                                    onChange={handleWebSearchToggle}
                                    color="primary"
                                />
                            }
                            label="是否启用联网搜索"
                        />
                    </Box>
                </>
            )}
        </SidebarContainer>
    );
};

// 定义 PropTypes
AIGCFunctionalitySidebar.propTypes = {
    selectedPipeline: PropTypes.string,
    onPipelineChange: PropTypes.func,
    onKnowledgeBaseChange: PropTypes.func,
    onWebSearchChange: PropTypes.func,
    enableWebSearch: PropTypes.bool, // 保持 PropType
    onFileChange: PropTypes.func, // 新增 PropType
    setSnackbar: PropTypes.func, // 新增 PropType
    onFileChange: PropTypes.func.isRequired,
};

export default AIGCFunctionalitySidebar;