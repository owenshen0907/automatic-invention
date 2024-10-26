// src/components/Header.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { appBarHeight } from '../constants';

const Header = () => {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: '100%',
                height: `${appBarHeight}px`,
                zIndex: (theme) => theme.zIndex.drawer + 1, // 确保 Header 在 Sidebar 之上
            }}
        >
            <Toolbar sx={{ height: '100%' }}>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Owen's Cat
                </Typography>
                <Box>
                    <Button color="inherit">Home</Button>
                    <Button color="inherit">YueWen</Button>
                    <Button color="inherit">ChatGPT</Button>
                    <Button color="inherit">UserInfo</Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;