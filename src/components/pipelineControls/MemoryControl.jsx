// src/components/pipelineControls/MemoryControl.jsx
import React from 'react';
import { FormControlLabel, Switch, Box } from '@mui/material';
import PropTypes from 'prop-types';

const MemoryControl = ({ enableMemory, onMemoryChange }) => {
    return (
        <Box sx={{ marginBottom: 1, width: '85%' }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={enableMemory}
                        onChange={(e) => onMemoryChange(e.target.checked)}
                        color="primary"
                    />
                }
                label="是否启用记忆"
            />
        </Box>
    );
};

MemoryControl.propTypes = {
    enableMemory: PropTypes.bool.isRequired,
    onMemoryChange: PropTypes.func.isRequired,
};

export default MemoryControl;