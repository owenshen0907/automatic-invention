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
    CircularProgress,
    Chip,
    Tooltip,
    IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/system';
import { KnowledgeBaseContext } from '../context/KnowledgeBaseContext';
import useKnowledgeBaseFiles from '../hooks/useKnowledgeBaseFiles';
import pipelineConfig from '../config/pipelineConfig';
import PerformanceLevelControl from './pipelineControls/PerformanceLevelControl';
import WebSearchControl from './pipelineControls/WebSearchControl';
import MemoryControl from './pipelineControls/MemoryControl';
import CustomFeatureControl from './pipelineControls/CustomFeatureControl';
import KnowledgeBaseSelection from './pipelineControls/KnowledgeBaseSelection';
import FileSelection from './pipelineControls/FileSelection';

const SidebarContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.default,
    height: '100%',
    width: 240,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
}));

const Header = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
}));

const FormControlStyled = styled(FormControl)(({ theme }) => ({
    backgroundColor: '#f9f9f9',
    width: '100%',
}));

const AIGCFunctionalitySidebar = ({
                                      selectedPipeline = '',
                                      onPipelineChange = () => {},
                                      setSnackbar = () => {},
                                      updateSnackbar = () => {},
                                      performanceLevel = 'fast', // 新增
                                      onPerformanceLevelChange = () => {}, // 新增
                                  }) => {
    const { knowledgeBases, loading: kbLoading, refreshKnowledgeBases } = useContext(KnowledgeBaseContext);
    const [selectedKB, setSelectedKB] = useState('');
    const [pipelineOptions, setPipelineOptions] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const { files, loading: filesLoading, fetchFiles } = useKnowledgeBaseFiles('local20241015145535', true, setSnackbar);

    // 管理 Pipeline 控件的状态
    // const [performanceLevel, setPerformanceLevel] = useState('balanced');
    const [enableWebSearch, setEnableWebSearch] = useState(false);
    const [enableMemory, setEnableMemory] = useState(true);
    const [customFeatureEnabled, setCustomFeatureEnabled] = useState(false); // 新增状态

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
        // 根据选中的 Pipeline 重置相关状态
        if (pipelineConfig[selectedPipeline]) {
            // 初始化状态，根据需要可以添加更多逻辑
            // setPerformanceLevel('balanced');
            setEnableWebSearch(false);
            setEnableMemory(true);
            setCustomFeatureEnabled(false);
        } else {
            // 如果 Pipeline 不存在配置，重置所有状态
            setSelectedKB('');
            setEnableWebSearch(false);
            setEnableMemory(true);
            setSelectedFiles([]);
            setCustomFeatureEnabled(false);
        }
    }, [selectedPipeline]);

    const handleKBChange = (event) => {
        const value = event.target.value;
        setSelectedKB(value);
        // 您可以在此处添加回调或其他逻辑
    };

    const handlePipelineChangeLocal = (event) => {
        const newPipeline = event.target.value;
        if (onPipelineChange) {
            onPipelineChange(newPipeline);
        }
    };

    const handleFileChangeLocal = (event) => {
        const { target: { value } } = event;
        const selectedIds = typeof value === 'string' ? value.split(',') : value;
        setSelectedFiles(selectedIds);
        // 您可以在此处添加回调或其他逻辑
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
            <Box sx={{ marginBottom: 3, width: '85%' }}>
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

            {/* 动态渲染 Pipeline 特有的控件 */}
            {pipelineConfig[selectedPipeline] && (
                <>
                    {pipelineConfig[selectedPipeline].map((ControlComponent, index) => {
                        let componentProps = {};

                        // 根据组件类型传递不同的 props
                        if (ControlComponent === KnowledgeBaseSelection) {
                            componentProps = {
                                selectedKB: selectedKB,
                                onKBChange: handleKBChange,
                                knowledgeBases: knowledgeBases,
                                loading: kbLoading,
                            };
                        } else if (ControlComponent === FileSelection) {
                            componentProps = {
                                selectedFiles: selectedFiles,
                                onFileChange: handleFileChangeLocal,
                                files: files,
                                loading: filesLoading,
                            };
                        } else if (ControlComponent === PerformanceLevelControl) {
                            componentProps = {
                                value: performanceLevel, // 使用来自父组件的 performanceLevel
                                onChange: onPerformanceLevelChange, // 使用来自父组件的回调
                            };
                        } else if (ControlComponent === WebSearchControl) {
                            componentProps = {
                                enableWebSearch: enableWebSearch,
                                onWebSearchChange: setEnableWebSearch,
                            };
                        } else if (ControlComponent === MemoryControl) {
                            componentProps = {
                                enableMemory: enableMemory,
                                onMemoryChange: setEnableMemory,
                            };
                        } else if (ControlComponent === CustomFeatureControl) {
                            componentProps = {
                                customFeatureEnabled: customFeatureEnabled,
                                onCustomFeatureChange: setCustomFeatureEnabled,
                            };
                        }

                        return (
                            <ControlComponent
                                key={`${ControlComponent.name}-${index}`}
                                {...componentProps}
                            />
                        );
                    })}
                </>
            )}
        </SidebarContainer>
    );
};

// 定义 PropTypes
AIGCFunctionalitySidebar.propTypes = {
    selectedPipeline: PropTypes.string,
    onPipelineChange: PropTypes.func,
    setSnackbar: PropTypes.func,
    updateSnackbar: PropTypes.func,
    performanceLevel: PropTypes.oneOf(['fast', 'balanced', 'advanced']).isRequired, // 新增
    onPerformanceLevelChange: PropTypes.func.isRequired, // 新增
};

export default AIGCFunctionalitySidebar;