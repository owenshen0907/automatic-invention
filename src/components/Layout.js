// src/components/Layout.js
import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
// import AIGCFunctionalitySidebar from './AIGCFunctionalitySidebar'; // 功能侧边栏
import { drawerWidth, appBarHeight } from '../constants';
import PropTypes from 'prop-types';

const Layout = ({children,updateSnackbar }) => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Header />
            <Sidebar updateSnackbar={updateSnackbar} />
            {/*<AIGCFunctionalitySidebar updateSnackbar={updateSnackbar} />*/}
            {/* 渲染传入的 sidebar，如果未传入则默认渲染 Sidebar 组件 */}
            {/*{sidebar ? sidebar : <Sidebar />}*/}
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

Layout.propTypes = {
    children: PropTypes.node,
    updateSnackbar: PropTypes.func.isRequired, // 确保是必需的
};

export default Layout;