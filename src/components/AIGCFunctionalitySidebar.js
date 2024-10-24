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
    Chip,
    Tooltip,
    IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/system';
import { KnowledgeBaseContext } from '../context/KnowledgeBaseContext';
import useKnowledgeBaseFiles from '../hooks/useKnowledgeBaseFiles';

const SidebarContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    height: '100%', // 确保高度填满
    width: 240, // 确保宽度与导航侧边栏一致
    overflowY: 'auto',
    display: 'flex',            // 使用 flex 布局
    flexDirection: 'column',    // 使子元素垂直排列
    alignItems: 'flex-start',       // 居中子元素
}));

const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const FormControlStyled = styled(FormControl)(({ theme }) => ({
    backgroundColor: '#f9f9f9',
    width: 190, // 确保选择框占满宽度
    margin: '0 auto', // 水平居中
}));

const AIGCFunctionalitySidebar = ({
                                      selectedPipeline = '',
                                      onPipelineChange = () => {},
                                      onKnowledgeBaseChange = () => {},
                                      onWebSearchChange = () => {},
                                      enableWebSearch = false,
                                      onFileChange = () => {},
                                      setSnackbar = () => {},
                                      updateSnackbar = () => {},
                                      enableMemory = true,
                                      onMemoryChange = () => {},
                                  }) => {
    const { knowledgeBases, loading: kbLoading, refreshKnowledgeBases } = useContext(KnowledgeBaseContext);
    const [selectedKB, setSelectedKB] = useState('');
    const [pipelineOptions, setPipelineOptions] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const { files, loading: filesLoading, fetchFiles } = useKnowledgeBaseFiles('local20241015145535', true, setSnackbar);

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
                    onPipelineChange(defaultPipeline);
                }
            } catch (error) {
                console.error('解析 REACT_APP_PIPELINE_OPTIONS 失败:', error);
            }
        } else {
            console.error('REACT_APP_PIPELINE_OPTIONS 未定义或为空');
        }
    }, [selectedPipeline, onPipelineChange]);

    useEffect(() => {
        if (selectedPipeline !== 'StepFun') {
            setSelectedKB('');
            onKnowledgeBaseChange('');
            onWebSearchChange(false);
            onMemoryChange(true);
            setSelectedFiles([]);
            onFileChange([]);
        }
    }, [selectedPipeline, onKnowledgeBaseChange, onWebSearchChange, onMemoryChange, onFileChange]);

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

    const handleMemoryToggle = (event) => {
        const isEnabled = event.target.checked;
        if (onMemoryChange) {
            onMemoryChange(isEnabled);
        }
    };

    const handleFileChangeLocal = (event) => {
        const { target: { value } } = event;
        const selectedIds = typeof value === 'string' ? value.split(',') : value;
        setSelectedFiles(selectedIds);
        onFileChange(selectedIds);
    };

    const [refreshing, setRefreshing] = useState(false);
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (refreshKnowledgeBases) {
                await refreshKnowledgeBases();
            }
            if (fetchFiles) {
                await fetchFiles();
            }
            updateSnackbar({ message: '刷新成功', severity: 'success' });
        } catch (error) {
            console.error('刷新数据失败:', error);
            updateSnackbar({ message: '刷新失败', severity: 'error' });
        } finally {
            setRefreshing(false);
        }
    };

    const filteredKnowledgeBases = knowledgeBases
        ? knowledgeBases.filter((kb) => kb.model_owner !== 'local')
        : [];
    const filteredFiles = files ? files.filter((file) => file.vector_file_id) : [];

    useEffect(() => {
        console.log('Selected KB:', selectedKB);
    }, [selectedKB, filteredFiles]);


    return (
        <SidebarContainer>
            <Header>
                <Typography variant="h5">功能区</Typography>
                <Tooltip title="刷新">
                    <span>
                        <IconButton
                            onClick={handleRefresh}
                            disabled={refreshing || kbLoading || filesLoading}
                            size="small"
                            aria-label="refresh"
                        >
                            {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Header>

            {/* Pipeline 选择 */}
            <Box sx={{ marginBottom: 3, width: '100%' }}>
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
                    <Box sx={{ marginBottom: 3 , width: '100%'}}>
                        <FormControlStyled fullWidth variant="outlined" size="small">
                            <InputLabel id="knowledge-base-select-label">选择知识库</InputLabel>
                            <Select
                                labelId="knowledge-base-select-label"
                                value={selectedKB}
                                onChange={handleKBChange}
                                label="选择知识库"
                                disabled={kbLoading}
                            >
                                <MenuItem value="">清除选择</MenuItem>
                                {filteredKnowledgeBases.map((kb) => (
                                    <MenuItem key={kb.id} value={kb.id}>
                                        <Tooltip title={kb.description || '无描述'} placement="right" arrow>
                                            <span>{kb.display_name}</span>
                                        </Tooltip>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControlStyled>
                    </Box>

                    {/* 文件选择框，独立于知识库选择 */}
                    <Box sx={{ marginBottom: 3 , width: '100%'}}>
                        {filesLoading ? (
                            <CircularProgress size={24} />
                        ) : (
                            <FormControlStyled fullWidth variant="outlined" size="small">
                                <InputLabel id="file-select-label">选择文件</InputLabel>
                                <Select
                                    labelId="file-select-label"
                                    multiple
                                    value={selectedFiles}
                                    onChange={handleFileChangeLocal}
                                    label="选择文件"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const file = filteredFiles.find(f => f.vector_file_id === value);
                                                return (
                                                    <Chip key={value} label={file ? file.file_name : value} />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
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
                    <Box sx={{ marginBottom: 1, width: 200 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enableWebSearch}
                                    onChange={handleWebSearchToggle}
                                    color="primary"
                                />
                            }
                            label="是否启用联网"
                        />
                    </Box>

                    {/* 是否启用记忆 */}
                    <Box sx={{ marginBottom: 1, width: 200 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={enableMemory}
                                    onChange={handleMemoryToggle}
                                    color="primary"
                                />
                            }
                            label="是否启用记忆"
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
    enableWebSearch: PropTypes.bool,
    setSnackbar: PropTypes.func,
    updateSnackbar: PropTypes.func,
    onFileChange: PropTypes.func.isRequired,
    enableMemory: PropTypes.bool,
    onMemoryChange: PropTypes.func,
};

export default AIGCFunctionalitySidebar;