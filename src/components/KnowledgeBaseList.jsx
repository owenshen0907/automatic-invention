// src/components/KnowledgeBaseList.jsx
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    IconButton,
    Pagination,
    Snackbar,
    Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import UploadFile from './common/UploadFile'; // 正确导入 UploadFile

const KnowledgeBaseList = ({
                               knowledgeBases,
                               onSelectKnowledgeBase,
                               onEditKnowledgeBase,
                           }) => {
    // 状态用于控制上传对话框的显示和记录选中的知识库
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedKBForUpload, setSelectedKBForUpload] = useState(null);

    // 分页相关的状态
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    // Snackbar 状态
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // 对 knowledgeBases 进行排序，将 model_owner 为 'local' 的放在前面
    const sortedKnowledgeBases = [...knowledgeBases].sort((a, b) => {
        if (a.model_owner === 'local' && b.model_owner !== 'local') {
            return -1;
        } else if (a.model_owner !== 'local' && b.model_owner === 'local') {
            return 1;
        }
        return 0;
    });

    // 计算分页数据
    const totalPages = Math.ceil(sortedKnowledgeBases.length / itemsPerPage);
    const paginatedKnowledgeBases = sortedKnowledgeBases.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // 处理页码变化
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
        // 滚动到顶部以提升用户体验
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 处理上传对话框的打开
    const handleOpenUploadDialog = (kb) => {
        setSelectedKBForUpload(kb);
        setIsUploadDialogOpen(true);
    };

    // 处理上传对话框的关闭
    const handleCloseUploadDialog = () => {
        setIsUploadDialogOpen(false);
        setSelectedKBForUpload(null);
    };

    // 上传成功后的回调
    const handleFileUploaded = () => {
        // 在这里添加上传成功后的逻辑，例如刷新知识库列表
    };

    return (
        <Box sx={{ flexGrow: 1, p: 1, overflow: 'visible' }}>
            {/* UploadFile 组件 */}
            {selectedKBForUpload && (
                <UploadFile
                    open={isUploadDialogOpen}
                    onClose={handleCloseUploadDialog}
                    knowledgeBaseId={selectedKBForUpload.id}
                    modelOwner={selectedKBForUpload.model_owner}
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarSeverity={setSnackbarSeverity}
                    setSnackbarOpen={setSnackbarOpen}
                    onFileUploaded={handleFileUploaded}
                />
            )}

            {/* Snackbar 组件 */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* KnowledgeBaseList 内容 */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: 2, // 增加卡片之间的间距
                    padding: '0 8 px',
                    overflowX: 'visible', // 允许横向溢出
                    alignItems: 'start',
                    gridAutoRows: 'auto', // 使行高自适应内容
                }}
            >
                {paginatedKnowledgeBases.map((kb) => (
                    <Box
                        key={kb.id}
                        sx={{
                            overflow: 'visible', // 允许卡片内容溢出
                            position: 'relative',
                            zIndex: 1, // 基础 zIndex
                        }}
                    >
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: '320px',
                                aspectRatio: '320 / 208', // 保持宽高比
                                boxShadow: 3,
                                borderRadius: 2,
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                backgroundColor:
                                    kb.model_owner === 'local' ? '#e0f7fa' : '#fff9ff',
                                transformOrigin: 'top center', // 从顶部中心放大
                                '&:hover': {
                                    transform: 'scale(1.03)', // 适度放大
                                    boxShadow: 6, // 增加阴影以增强视觉效果
                                    zIndex: 10, // 提高 z-index 确保在悬停时在最上层
                                },
                                margin: 0,
                                padding: 1,
                            }}
                        >
                            {/* 所属模型和创建者 ID 显示及操作按钮 */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    p: 2,
                                    backgroundColor: '#f5f5f5',
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px',
                                }}
                            >
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        模型: {kb.model_owner || '未知模型'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        创建者ID: {kb.creator_id || '未知创建者'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <IconButton
                                        onClick={() => onEditKnowledgeBase(kb)}
                                        color="primary"
                                        size="small"
                                        aria-label="edit"
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => onSelectKnowledgeBase(kb)}
                                        color="secondary"
                                        size="small"
                                        aria-label="manage"
                                    >
                                        <ManageAccountsIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleOpenUploadDialog(kb)}
                                        color="default"
                                        size="small"
                                        aria-label="upload"
                                    >
                                        <UploadFileIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            <CardContent
                                sx={{
                                    flexGrow: 1,
                                    p: 1,
                                    backgroundColor: '#ffffff',
                                    borderRadius: '0 0 8px 8px',
                                    overflow: 'hidden',
                                }}
                            >
                                <Typography variant="h6" component="div" gutterBottom>
                                    {kb.display_name}
                                    <Typography
                                        component="span"
                                        variant="subtitle2"
                                        color="text.secondary"
                                    >
                                        {' '}
                                        ({kb.name})({kb.id})
                                    </Typography>
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        mb: 1,
                                    }}
                                >
                                    {kb.description || '暂无描述'}
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    {kb.tags &&
                                        kb.tags.split(',').map((tag, index) => (
                                            <Chip
                                                key={index}
                                                label={tag}
                                                size="small"
                                                sx={{ mr: 0.5, mb: 0.5 }}
                                            />
                                        ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            {/* 分页控件 */}
            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}
        </Box>
    );

};

export default KnowledgeBaseList;
