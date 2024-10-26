// src/pages/KnowledgeCenterPage.jsx
import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Snackbar,
    Alert,
    Button,
    CircularProgress,
    Slide,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import KnowledgeBaseList from '../components/KnowledgeBaseList';
import KnowledgeBaseManagement from '../components/KnowledgeBaseManagement';
import CreateKnowledgeBase from '../components/CreateKnowledgeBase';
import EditKnowledgeBase from '../components/EditKnowledgeBase';
import useKnowledgeBases from '../hooks/useKnowledgeBases';

const KnowledgeCenterPage = () => {
    const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    // 使用自定义 Hook 管理知识库
    const {
        knowledgeBases,
        loading,
        addKnowledgeBase,
        updateKnowledgeBase,
        refreshKnowledgeBases,
    } = useKnowledgeBases(setSnackbar);

    // 状态管理用于创建知识库
    const [openCreateDialog, setOpenCreateDialog] = useState(false);

    // 状态管理用于编辑知识库
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [knowledgeBaseToEdit, setKnowledgeBaseToEdit] = useState(null);

    // 关闭 Snackbar 的函数
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // 处理选择知识库进行管理
    const handleSelectKnowledgeBase = (knowledgeBase) => {
        setSelectedKnowledgeBase(knowledgeBase);
    };

    // 处理从管理界面返回
    const handleBackToList = () => {
        setSelectedKnowledgeBase(null);
    };

    // 处理新增知识库
    const handleAddKnowledgeBase = (newKB) => {
        addKnowledgeBase(newKB);
    };

    // 处理更新知识库
    const handleUpdateKnowledgeBase = (updatedKB) => {
        updateKnowledgeBase(updatedKB);

        // 如果当前编辑的是被更新的知识库，则更新选中的知识库
        if (selectedKnowledgeBase && selectedKnowledgeBase.id === updatedKB.id) {
            setSelectedKnowledgeBase(updatedKB);
        }
    };

    // 处理编辑知识库
    const handleEditKnowledgeBase = (knowledgeBase) => {
        setKnowledgeBaseToEdit(knowledgeBase);
        setOpenEditDialog(true);
    };

    // 刷新知识库列表的函数
    const handleRefresh = () => {
        refreshKnowledgeBases();
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                height: '100vh',
                padding: 0,
                backgroundColor: '#f0f2f5',
                justifyContent: 'center', // 居中对齐内容
                position: 'relative', // 使子组件可以绝对定位
                boxSizing: 'border-box',
            }}
        >
            {/* 知识库主内容区域 */}
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Paper
                    elevation={1}
                    sx={{
                        flexGrow: 1,
                        padding: 1,
                        boxSizing: 'border-box',
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden', // 防止内部内容溢出
                    }}
                >
                    {/* 知识中心：Header Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 0,
                            p: 1,
                            backgroundColor: '#fff0ff',
                            borderRadius: '1px',
                            boxShadow: 1,
                        }}
                    >
                        <Typography variant="h4">知识中心</Typography>
                        <Box>
                            {/* 创建知识库按钮 */}
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => setOpenCreateDialog(true)}
                                sx={{ mr: 1 }}
                            >
                                创建知识库
                            </Button>
                            {/* 刷新按钮 */}
                            <Button
                                variant="outlined"
                                color="primary"
                                onClick={handleRefresh}
                                startIcon={<RefreshIcon />}
                            >
                                刷新
                            </Button>
                        </Box>
                    </Box>
                    {/* 内部内容区域 */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexGrow: 1,
                            flexDirection: 'column',
                            gap: 1,
                            overflow: 'hidden',
                            p: 0, // 为内容区域添加统一的内边距
                            overflow: 'hidden', // 防止子组件溢出
                        }}
                    >
                        {/* KnowledgeBaseList 部分 */}
                        <Box
                            sx={{
                                flex: '1',
                                overflowY: 'auto',
                                transition: 'flex 0.3s ease',
                                paddingRight: 1, // 为滚动条留出空间
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <KnowledgeBaseList
                                    knowledgeBases={knowledgeBases}
                                    onSelectKnowledgeBase={handleSelectKnowledgeBase}
                                    onEditKnowledgeBase={handleEditKnowledgeBase}
                                    selectedKnowledgeBase={selectedKnowledgeBase}
                                    setSnackbar={setSnackbar}
                                />
                            )}
                        </Box>
                    </Box>



                    {/* 创建知识库对话框 */}
                    <CreateKnowledgeBase
                        open={openCreateDialog}
                        onClose={() => setOpenCreateDialog(false)}
                        onAddKnowledgeBase={handleAddKnowledgeBase}
                        setSnackbar={setSnackbar}
                    />

                    {/* 编辑知识库对话框 */}
                    <EditKnowledgeBase
                        open={openEditDialog}
                        onClose={() => setOpenEditDialog(false)}
                        knowledgeBase={knowledgeBaseToEdit}
                        onUpdateKnowledgeBase={handleUpdateKnowledgeBase}
                        setSnackbar={setSnackbar}
                    />

                    {/* Snackbar 用于反馈 */}
                    <Snackbar
                        open={snackbar.open}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                    >
                        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Paper>
            </Box>

            {/* KnowledgeBaseManagement 作为覆盖层，通过 Slide 动画控制显示 */}
            <Slide
                direction="up"
                in={Boolean(selectedKnowledgeBase)}
                mountOnEnter
                unmountOnExit
                timeout={300} // 过渡时间，可根据需要调整
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%', // 覆盖父容器的全部高度
                        backgroundColor: '#ffffff',
                        zIndex: 1300, // 确保覆盖层在所有其他内容之上
                        boxShadow: 4,
                        overflowY: 'auto',
                    }}
                >
                    {selectedKnowledgeBase && (
                        <KnowledgeBaseManagement
                            selectedKnowledgeBase={selectedKnowledgeBase}
                            onBack={handleBackToList}
                            setSnackbar={setSnackbar}
                        />
                    )}
                </Box>
            </Slide>
        </Box>
    );
};

export default KnowledgeCenterPage;