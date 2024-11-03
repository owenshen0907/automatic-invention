// src/components/Header.js

import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Menu,
    MenuItem,
    IconButton,
} from '@mui/material';
import { appBarHeight } from '../constants';
import { useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Cookies from 'js-cookie';

const Header = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [username, setUsername] = useState('未知'); // 默认用户名

    // 定义缓存键
    const USERNAME_KEY = 'username';

    // 使用后端接口验证 JWT 并获取用户名
    const fetchUsername = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/validate-user`, {
                method: 'GET',
                credentials: 'include', // 确保 cookies 被发送
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.username) {
                    setUsername(data.username);
                    localStorage.setItem(USERNAME_KEY, data.username); // 存储用户名到缓存
                } else {
                    throw new Error('未收到用户名');
                }
            } else {
                // 处理非 2xx 状态码
                const errorData = await response.json();
                throw new Error(errorData.error || '验证失败');
            }
        } catch (error) {
            console.error('通过 API 验证用户时出错:', error);
            setUsername('未知');
            localStorage.removeItem(USERNAME_KEY); // 清除缓存中的用户名
        }
    };

    // 在组件挂载时尝试从缓存获取用户名，如果没有则调用 API 获取
    useEffect(() => {
        const cachedUsername = localStorage.getItem(USERNAME_KEY);
        if (cachedUsername) {
            setUsername(cachedUsername);
        } else {
            fetchUsername();
        }
    }, []);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        console.log('点击注销按钮'); // 调试日志
        Cookies.remove('jwtToken'); // 清除 token
        localStorage.removeItem(USERNAME_KEY); // 清除缓存中的用户名
        handleMenuClose(); // 关闭菜单
        // Redirect to login page using the URL from .env
        const loginPage = process.env.REACT_APP_LOGIN_PAGE;
        if (loginPage) {
            window.location.href = loginPage;
        } else {
            console.error('REACT_APP_LOGIN_PAGE is not defined in .env');
            navigate('/login'); // Fallback to internal route if env variable is missing
        }
    };

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
                    <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
                    <Button color="inherit" onClick={() => navigate('/yuewen')}>YueWen</Button>
                    <Button color="inherit" onClick={() => navigate('/chatgpt')}>ChatGPT</Button>
                    {/* UserInfo 按钮 */}
                    <IconButton
                        color="inherit"
                        onMouseEnter={handleMenuOpen}
                        onClick={handleMenuOpen}
                        size="large"
                        edge="end"
                        aria-controls="user-menu"
                        aria-haspopup="true"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="user-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            onMouseLeave: handleMenuClose,
                            'aria-labelledby': 'user-button',
                        }}
                    >
                        <MenuItem disabled>
                            <Typography variant="subtitle1">用户名: {username}</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>注销</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;