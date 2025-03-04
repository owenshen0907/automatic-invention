// src/components/pipelineControls/PerformanceLevelControl.jsx
import React from 'react';
import { Box, Tooltip, ToggleButton, ToggleButtonGroup } from '@mui/material';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';

const PerformanceToggleGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
}));

const PerformanceToggleButton = styled(ToggleButton)(({ theme }) => ({
    flex: 1,
    margin: theme.spacing(0, 0.5),
    border: '1px solid',
    borderColor: theme.palette.grey[400],
    borderRadius: theme.shape.borderRadius,
    textTransform: 'none',
    padding: theme.spacing(1),
    minWidth: 0,
    '&.Mui-selected': {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.common.white,
        borderColor: theme.palette.success.main,
        '&:hover': {
            backgroundColor: theme.palette.success.dark,
        },
    },
    '&:not(.Mui-selected)': {
        backgroundColor: theme.palette.grey[300],
        color: theme.palette.text.primary,
        '&:hover': {
            backgroundColor: theme.palette.grey[400],
        },
    },
}));

const PerformanceLevelControl = ({ value, onChange }) => {
    return (
        <Box sx={{ marginBottom: 1, width: '85%' }}>
            <PerformanceToggleGroup
                value={value}
                exclusive
                onChange={onChange}
                aria-label="性能级别"
            >
                <Tooltip title="均衡，多模，适用娱乐聊天对话（类比4o-mini）" placement="top" arrow>
                    <PerformanceToggleButton value="fast">
                        中杯
                    </PerformanceToggleButton>
                </Tooltip>
                <Tooltip title="高智商，善于逻辑推理，科学计算，扣钉（类比o1)" placement="top" arrow>
                    <PerformanceToggleButton value="balanced">
                        大杯
                    </PerformanceToggleButton>
                </Tooltip>
                <Tooltip title="超强（o1-pro)" placement="top" arrow>
                    <PerformanceToggleButton value="advanced">
                        超大
                    </PerformanceToggleButton>
                </Tooltip>
            </PerformanceToggleGroup>
        </Box>
    );
};

PerformanceLevelControl.propTypes = {
    value: PropTypes.oneOf(['fast', 'balanced', 'advanced']).isRequired,
    onChange: PropTypes.func.isRequired,
};

export default PerformanceLevelControl;