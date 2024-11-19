// src/components/pipelineControls/CustomFeatureControl.jsx
import React from 'react';
import { FormControlLabel, Switch, Box } from '@mui/material';
import PropTypes from 'prop-types';

const CustomFeatureControl = ({ customFeatureEnabled, onCustomFeatureChange }) => {
    return (
        <Box sx={{ marginBottom: 1, width: 200 }}>
            <FormControlLabel
                control={
                    <Switch
                        checked={customFeatureEnabled}
                        onChange={(e) => onCustomFeatureChange(e.target.checked)}
                        color="primary"
                    />
                }
                label="启用自定义功能"
            />
        </Box>
    );
};

CustomFeatureControl.propTypes = {
    customFeatureEnabled: PropTypes.bool.isRequired,
    onCustomFeatureChange: PropTypes.func.isRequired,
};

export default CustomFeatureControl;