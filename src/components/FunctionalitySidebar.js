// src/components/FunctionalitySidebar.js

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/system';

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

const FunctionalitySidebar = ({
                                  knowledgeBases = [], // 设置默认值为 []
                                  selectedPipeline = '',
                                  onPipelineChange = () => {},
                                  onKnowledgeBaseChange = () => {},
                              }) => {
    console.log('FunctionalitySidebar - knowledgeBases:', knowledgeBases);
    const [selectedKBs, setSelectedKBs] = useState([]);
    const [pipelineOptions, setPipelineOptions] = useState([]);

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
                    onPipelineChange(parsedOptions[0].value); // 设置默认值
                }
            } catch (error) {
                console.error('解析 REACT_APP_PIPELINE_OPTIONS 失败:', error);
            }
        } else {
            console.error('REACT_APP_PIPELINE_OPTIONS 未定义或为空');
        }
    }, [selectedPipeline, onPipelineChange]);

    const handleKBChange = (event) => {
        const {
            target: { value },
        } = event;
        const newSelectedKBs = typeof value === 'string' ? value.split(',') : value;
        setSelectedKBs(newSelectedKBs);

        if (onKnowledgeBaseChange) {
            onKnowledgeBaseChange(newSelectedKBs);
        }
    };

    const handlePipelineChangeLocal = (event) => {
        const newPipeline = event.target.value;
        if (onPipelineChange) {
            onPipelineChange(newPipeline);
        }
    };

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

            {/* 知识库选择 */}
            <Box sx={{ marginBottom: 3 }}>
                <FormControlStyled fullWidth variant="outlined" size="small">
                    <InputLabel id="knowledge-base-select-label">选择知识库</InputLabel>
                    <Select
                        labelId="knowledge-base-select-label"
                        multiple
                        value={selectedKBs}
                        onChange={handleKBChange}
                        renderValue={(selected) =>
                            selected
                                .map((id) => {
                                    const kb = knowledgeBases.find((k) => k.id === id);
                                    return kb ? kb.name : '';
                                })
                                .join(', ')
                        }
                        label="选择知识库"
                    >
                        {knowledgeBases.map((kb) => (
                            <MenuItem key={kb.id} value={kb.id}>
                                <Checkbox checked={selectedKBs.indexOf(kb.id) > -1} />
                                <ListItemText primary={kb.display_name} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControlStyled>
            </Box>

            {/* 其他功能示例 */}
            <Box>
                <Typography variant="subtitle1" gutterBottom>
                    其他功能
                </Typography>
                <FormControl component="fieldset" fullWidth>
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="示例功能 1"
                    />
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="示例功能 2"
                    />
                    <FormControlLabel
                        control={<Checkbox color="primary" />}
                        label="示例功能 3"
                    />
                </FormControl>
            </Box>
        </SidebarContainer>
    );
};

// 定义 PropTypes
FunctionalitySidebar.propTypes = {
    knowledgeBases: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
        })
    ),
    selectedPipeline: PropTypes.string,
    onPipelineChange: PropTypes.func,
    onKnowledgeBaseChange: PropTypes.func,
};

export default FunctionalitySidebar;