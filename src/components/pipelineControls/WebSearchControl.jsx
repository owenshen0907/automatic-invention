// src/components/pipelineControls/WebSearchControl.jsx
import React from 'react';
import { FormControlLabel, Switch, Box } from '@mui/material';
import PropTypes from 'prop-types';

const WebSearchControl = ({ enableWebSearch, onWebSearchChange }) => {
    return (
        <Box sx={{ marginBottom: 1, width: 200 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={enableWebSearch}
                        onChange={(e) => onWebSearchChange(e.target.checked)}
                        color="primary"
                    />
                }
                label="是否启用联网"
            />
        </Box>
    );
};

WebSearchControl.propTypes = {
    enableWebSearch: PropTypes.bool.isRequired,
    onWebSearchChange: PropTypes.func.isRequired,
};

export default WebSearchControl;