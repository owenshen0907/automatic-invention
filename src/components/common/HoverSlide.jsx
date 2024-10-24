// src/components/common/HoverSlide.jsx

import React, { useState } from 'react';
import { Box, Slide } from '@mui/material';

const HoverSlide = ({
                        children,
                        triggerWidth = '320px',
                        triggerHeight = '5px',
                        triggerColor = '#e0e0e0',
                        slideDirection = 'down',
                        position = 'relative',
                        top=0,
                        left,
                        right,
                        sx = {zIndex: 9999},
                    }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                width: triggerWidth,
                position: position,
                top: top,
                left: left,
                right: right,
                overflow: 'visible',
                ...sx,
            }}
        >
            {/* 触发区域：一个小的水平线 */}
            <Box
                sx={{
                    width: '100%',
                    height: triggerHeight,
                    backgroundColor: triggerColor,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    zIndex: 10,
                    position: 'relative',
                }}
            />
            {/* 滑动的内容 */}
            <Slide direction={slideDirection} in={isHovered} mountOnEnter unmountOnExit timeout={300}>
                <Box
                    sx={{
                        position: 'flex',
                        flexDirection: 'column',
                        position: 'absolute', // 绝对定位
                        top: slideDirection === 'down' ? `${triggerHeight + 5}px` : undefined,
                        bottom: slideDirection === 'up' ? `${triggerHeight + 5}px` : undefined,
                        left: 0, // 对齐触发区域左侧
                        right: 0, // 对齐触发区域右侧
                        display: 'flex',
                        flexDirection: 'column',
                        width: triggerWidth, // 固定宽度，避免动态变化
                        bgcolor: 'background.paper',
                        boxShadow: 3,
                        borderRadius: 2,
                        p: 2,
                        gap: 2,
                        zIndex: 9998,
                        width: '100%', // 与触发区域宽度一致
                    }}
                >
                    {children}
                </Box>
            </Slide>
        </Box>
    );
};

export default HoverSlide;