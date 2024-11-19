// src/components/pipelineControls/KnowledgeBaseSelection.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Tooltip } from '@mui/material';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';

const FormControlStyled = styled(FormControl)(({ theme }) => ({
    backgroundColor: '#f9f9f9',
    width: '100%',
}));

const KnowledgeBaseSelection = ({ selectedKB, onKBChange, knowledgeBases, loading }) => {
    const filteredKnowledgeBases = knowledgeBases
        ? knowledgeBases.filter((kb) => kb.model_owner !== 'local')
        : [];

    return (
        <Box sx={{ marginBottom: 3, width: '85%' }}>
            <FormControlStyled fullWidth variant="outlined" size="small">
                <InputLabel id="knowledge-base-select-label">选择知识库</InputLabel>
                <Select
                    labelId="knowledge-base-select-label"
                    value={selectedKB}
                    onChange={onKBChange}
                    label="选择知识库"
                    disabled={loading}
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
    );
};

KnowledgeBaseSelection.propTypes = {
    selectedKB: PropTypes.string.isRequired,
    onKBChange: PropTypes.func.isRequired,
    knowledgeBases: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            display_name: PropTypes.string.isRequired,
            description: PropTypes.string,
            model_owner: PropTypes.string,
        })
    ),
    loading: PropTypes.bool.isRequired,
};

export default KnowledgeBaseSelection;