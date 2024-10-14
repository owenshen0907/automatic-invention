// src/pages/KnowledgeCenterPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Paper,
    Typography,
    Snackbar,
    Alert,
    MenuItem, // 新增导入 MenuItem 组件
    Button,
    CircularProgress,
} from '@mui/material';
import axios from 'axios';
import KnowledgeBaseList from '../components/KnowledgeBaseList';
import KnowledgeBaseManagement from '../components/KnowledgeBaseManagement';
import CreateKnowledgeBase from '../components/CreateKnowledgeBase';
import EditKnowledgeBase from '../components/EditKnowledgeBase';
import RefreshIcon from '@mui/icons-material/Refresh';
// import FunctionalitySidebar from '../components/FunctionalitySidebar'; // 已移除侧边栏组件

const CACHE_KEY = 'knowledgeBases';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 小时

const KnowledgeCenterPage = () => {
    const [knowledgeBases, setKnowledgeBases] = useState([]); // 初始化为 []
    const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);

    // 状态管理用于创建知识库
    const [openCreateDialog, setOpenCreateDialog] = useState(false);

    // 状态管理用于编辑知识库
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [knowledgeBaseToEdit, setKnowledgeBaseToEdit] = useState(null);

    // 移除与侧边栏相关的状态
    // const [selectedPipeline, setSelectedPipeline] = useState('');
    // const [selectedKBs, setSelectedKBs] = useState([]);

    // 辅助函数：获取缓存数据
    const getCachedData = () => {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        try {
            const parsed = JSON.parse(cached);
            const now = new Date().getTime();
            if (now - parsed.timestamp < CACHE_EXPIRY) {
                return parsed.data;
            } else {
                // 缓存过期
                localStorage.removeItem(CACHE_KEY);
                return null;
            }
        } catch (error) {
            console.error('解析缓存数据失败:', error);
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
    };

    // 辅助函数：设置缓存数据
    const setCachedData = (data) => {
        const payload = {
            data,
            timestamp: new Date().getTime(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    };

    // 获取知识库数据的函数
    const fetchKnowledgeBases = useCallback(async () => {
        setLoading(true);
        try {
            const cachedData = getCachedData();
            if (cachedData) {
                setKnowledgeBases(cachedData);
                console.log('使用缓存的知识库数据');
                setLoading(false);
                return;
            }

            const apiUrl = process.env.REACT_APP_API_BASE_URL;
            const response = await axios.get(`${apiUrl}/api/get-data?type=knowledge_bases`);
            if (response.status === 200) {
                const data = response.data.map(kb => ({
                    ...kb,
                    tags: kb.tags || "",
                }));
                setKnowledgeBases(data);
                setCachedData(data); // 缓存数据
                console.log('从 API 获取并缓存知识库数据');
            }
        } catch (error) {
            console.error('无法加载知识库数据:', error);
            setSnackbarMessage('无法加载知识库数据，请重试');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setLoading(false);
        }
    }, []);

    // 在组件加载时获取知识库数据
    useEffect(() => {
        fetchKnowledgeBases();
    }, [fetchKnowledgeBases]);

    // 关闭 Snackbar 的函数
    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
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
        const updatedKnowledgeBases = [...knowledgeBases, newKB];
        setKnowledgeBases(updatedKnowledgeBases);
        setCachedData(updatedKnowledgeBases); // 更新缓存
    };
    const [selectedModel, setSelectedModel] = useState(''); // 用于存储选中的所属模型
    const handleModelChange = (event) => {
        setSelectedModel(event.target.value);
    };

    // 处理更新知识库
    const handleUpdateKnowledgeBase = (updatedKB) => {
        const updatedKnowledgeBases = knowledgeBases.map(kb =>
            kb.id === updatedKB.id ? updatedKB : kb
        );
        setKnowledgeBases(updatedKnowledgeBases);
        setCachedData(updatedKnowledgeBases); // 更新缓存

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
        localStorage.removeItem(CACHE_KEY);
        setKnowledgeBases([]);
        fetchKnowledgeBases();
    };



    // 移除与侧边栏相关的函数
    // const handlePipelineChange = useCallback((newPipeline) => {
    //     setSelectedPipeline(newPipeline);
    //     // 可以在这里添加额外的逻辑，例如根据 Pipeline 过滤知识库等
    // }, []);

    // const handleKnowledgeBaseChange = useCallback((selectedIds) => {
    //     setSelectedKBs(selectedIds);
    //     // 可以在这里添加额外的逻辑，例如根据选择的知识库过滤内容等
    // }, []);

    return (
        <Box
            sx={{
                flexGrow: 1,
                display: 'flex',
                height: '100vh',
                padding: 0,
                backgroundColor: '#f0f2f5',
            }}
        >
            {/* 移除侧边栏 */}
            {/* <Box sx={{ width: 300, borderRight: '1px solid #ddd', overflowY: 'auto' }}>
                <FunctionalitySidebar ... />
            </Box> */}

            {/* 主内容区域 */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Paper
                    elevation={3}
                    sx={{
                        flexGrow: 1,
                        padding: 2,
                        boxSizing: 'border-box',
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    {/* Header Section */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                            p: 2,
                            backgroundColor: '#fff0ff',
                            borderRadius: '8px',
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
                                sx={{ mr: 2 }}
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
                            gap: 2,
                            overflow: 'hidden',
                        }}
                    >
                        {/* KnowledgeBaseList 部分 */}
                        <Box
                            sx={{
                                flex: selectedKnowledgeBase ? '0 0 30%' : '1',
                                overflowY: 'auto',
                                transition: 'flex 0.3s ease',
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
                                    selectedKnowledgeBase={selectedKnowledgeBase} // 传递 selectedKnowledgeBase
                                    setSnackbarMessage={setSnackbarMessage}
                                    setSnackbarSeverity={setSnackbarSeverity}
                                    setSnackbarOpen={setSnackbarOpen}
                                />
                            )}
                        </Box>

                        {/* KnowledgeBaseManagement 部分 */}
                        {selectedKnowledgeBase && (
                            <Box
                                sx={{
                                    flex: '0 0 70%',
                                    overflowY: 'auto',
                                    borderTop: '1px solid #ddd',
                                }}
                            >
                                <KnowledgeBaseManagement
                                    selectedKnowledgeBase={selectedKnowledgeBase}
                                    onBack={handleBackToList}
                                    setSnackbarMessage={setSnackbarMessage}
                                    setSnackbarSeverity={setSnackbarSeverity}
                                    setSnackbarOpen={setSnackbarOpen}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* 创建知识库对话框 */}
                    <CreateKnowledgeBase
                        open={openCreateDialog}
                        onClose={() => setOpenCreateDialog(false)}
                        onAddKnowledgeBase={handleAddKnowledgeBase}
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarSeverity={setSnackbarSeverity}
                        setSnackbarOpen={setSnackbarOpen}
                    />

                    {/* 编辑知识库对话框 */}
                    <EditKnowledgeBase
                        open={openEditDialog}
                        onClose={() => setOpenEditDialog(false)}
                        knowledgeBase={knowledgeBaseToEdit}
                        onUpdateKnowledgeBase={handleUpdateKnowledgeBase}
                        setSnackbarMessage={setSnackbarMessage}
                        setSnackbarSeverity={setSnackbarSeverity}
                        setSnackbarOpen={setSnackbarOpen}
                    />

                    {/* Snackbar 用于反馈 */}
                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </Paper>
            </Box>
        </Box>
    );

};

export default KnowledgeCenterPage;