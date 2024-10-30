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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button as MuiButton,
} from '@mui/material';
import { appBarHeight } from '../constants';
import { useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Cookies from 'js-cookie';

const Header = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [username, setUsername] = useState('未知'); // 默认用户名
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogContent, setDialogContent] = useState('');

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
                    setDialogTitle('验证成功');
                    setDialogContent(`用户名: ${data.username}`);
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
            setDialogTitle('验证失败');
            setDialogContent(`错误信息: ${error.message}`);
        } finally {
            setDialogOpen(true);
        }
    };

    // 在组件挂载时尝试通过 API 验证 JWT 并获取用户名
    useEffect(() => {
        fetchUsername();
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
        handleMenuClose(); // 关闭菜单
        navigate('/login'); // 假设 '/login' 是您的登录页面路由
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
    };

    return (
        <>
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

            {/* JWT 验证结果弹框 */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                fullWidth
                maxWidth="md"
                aria-labelledby="dialog-title"
            >
                <DialogTitle id="dialog-title">{dialogTitle}</DialogTitle>
                <DialogContent dividers>
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                        {dialogContent}
                    </pre>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleDialogClose} color="primary">
                        关闭
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Header;