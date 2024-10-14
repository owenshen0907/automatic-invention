// src/components/Layout.js
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { drawerWidth, appBarHeight } from '../constants';

const Layout = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Header />
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    height: `calc(100vh - ${appBarHeight}px)`,
                    overflow: 'hidden',
                }}
            >
                <Toolbar /> {/* 占位，避免内容被 Header 覆盖 */}
                {children}
            </Box>
        </Box>
    );
};

export default Layout;