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
                <Tooltip title="速度优先，适用娱乐聊天对话。" placement="top" arrow>
                    <PerformanceToggleButton value="fast">
                        极速
                    </PerformanceToggleButton>
                </Tooltip>
                <Tooltip title="千亿参数，适用大多数场景" placement="top" arrow>
                    <PerformanceToggleButton value="balanced">
                        均衡
                    </PerformanceToggleButton>
                </Tooltip>
                <Tooltip title="万亿参数，适合严密的逻辑推理，复杂的任务" placement="top" arrow>
                    <PerformanceToggleButton value="advanced">
                        高级
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