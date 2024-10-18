// src/components/KnowledgeBaseList.jsx
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Pagination // 导入 Pagination 组件
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import UploadFileDialog from './UploadFileDialog'; // 引入 UploadFileDialog

const KnowledgeBaseList = ({
                               knowledgeBases,
                               onSelectKnowledgeBase,
                               onEditKnowledgeBase,
                               selectedKnowledgeBase, // 接收 selectedKnowledgeBase
                               setSnackbarMessage,
                               setSnackbarSeverity,
                               setSnackbarOpen
                           }) => {
    // 状态用于控制上传对话框的显示和记录选中的知识库
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedKBForUpload, setSelectedKBForUpload] = useState(null);
    // 分页相关的状态
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12; // 每页显示12个卡片（2行，每行6个）

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
        // 这里可以添加刷新知识库列表或其他逻辑
        // 例如，触发父组件重新获取知识库数据
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: { xs: 1, sm: 2, md: 3 } // 响应式内边距
            }}
        >
            {/* UploadFileDialog 组件 */}
            {selectedKBForUpload && (
                <UploadFileDialog
                    open={isUploadDialogOpen}
                    onClose={handleCloseUploadDialog}
                    knowledgeBaseId={selectedKBForUpload.id} // 传入知识库的ID
                    modelOwner={selectedKBForUpload.model_owner} // 新增: 传入模型所有者
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarSeverity={setSnackbarSeverity}
                    setSnackbarOpen={setSnackbarOpen}
                    onFileUploaded={handleFileUploaded} // 上传成功后的回调
                />
            )}

            {/* KnowledgeBaseList 内容 */}
            {/*<Grid*/}
            {/*    container*/}
            {/*    spacing={2} // 控制卡片之间的间距*/}
            {/*    sx={{*/}
            {/*        flexWrap: selectedKnowledgeBase ? 'nowrap' : 'wrap',*/}
            {/*        overflowX: selectedKnowledgeBase ? 'auto' : 'visible',*/}
            {/*    }}*/}
            {/*>*/}
            <Box
                sx={{
                    flexGrow: 1, // 允许这个区域扩展以占用可用空间
                    overflowY: 'auto', // 当内容超出时，允许垂直滚动
                }}
            >
                <Grid container spacing={2}>
                {sortedKnowledgeBases.map((kb) => (
                    <Grid
                        item
                        key={kb.id}
                        xs={12}    // 超小屏，每行1个
                        sm={6}     // 小屏，每行2个
                        md={4}     // 中屏，每行3个
                        lg={2}     // 大屏，每行6个
                    >
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                boxShadow: 6, // 增加阴影等级
                                borderRadius: 2,
                                transition: 'transform 0.2s',
                                backgroundColor: kb.model_owner === 'local' ? '#e0f7fa' : '#fff9ff', // 条件设置背景颜色
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
                            {/* 所属模型和创建者 ID 显示及操作按钮（移动到顶部） */}
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
                                    <IconButton onClick={() => onEditKnowledgeBase(kb)} color="primary" size="small" aria-label="edit">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => onSelectKnowledgeBase(kb)} color="secondary" size="small" aria-label="manage">
                                        <ManageAccountsIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleOpenUploadDialog(kb)} color="default" size="small" aria-label="upload">
                                        <UploadFileIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                            <CardContent
                                sx={{
                                    flexGrow: 1,
                                    p: 2, // 使用主题间距
                                    backgroundColor: '#ffffff',
                                    borderRadius: '0 0 8px 8px',
                                }}
                            >
                                <Typography variant="h6" component="div" gutterBottom>
                                    {kb.display_name}
                                    <Typography component="span" variant="subtitle2" color="text.secondary">
                                        {' '}({kb.name})({kb.id})
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
                                    {kb.tags && kb.tags.split(',').map((tag, index) => (
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
                    </Grid>
                ))}
            {/*</Grid>*/}
                </Grid>
            </Box>

            {/* 分页控件 */}
            {totalPages > 1 && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        mt: 2,
                    }}
                >
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