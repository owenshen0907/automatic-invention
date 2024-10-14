// src/components/Sidebar.js
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Home, Note, LibraryBooks } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { drawerWidth, appBarHeight } from '../constants';

const Sidebar = () => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    top: `${appBarHeight}px`, // 将 Drawer 下移，避免与 Header 重叠
                },
            }}
        >
            <List>
                <ListItem button component={Link} to="/aigc">
                    <ListItemIcon>
                        <Home />
                    </ListItemIcon>
                    <ListItemText primary="AIGC" />
                </ListItem>
                <ListItem button component={Link} to="/note">
                    <ListItemIcon>
                        <Note />
                    </ListItemIcon>
                    <ListItemText primary="记事本" />
                </ListItem>
                <ListItem button component={Link} to="/knowledge-center">
                    <ListItemIcon>
                        <LibraryBooks />
                    </ListItemIcon>
                    <ListItemText primary="知识中心" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;