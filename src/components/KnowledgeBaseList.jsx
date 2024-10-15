// src/components/KnowledgeBaseList.jsx
import React, { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton
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
                    setSnackbarMessage={setSnackbarMessage}
                    setSnackbarSeverity={setSnackbarSeverity}
                    setSnackbarOpen={setSnackbarOpen}
                    onFileUploaded={handleFileUploaded} // 上传成功后的回调
                />
            )}

            {/* KnowledgeBaseList 内容 */}
            <Grid
                container
                spacing={2} // 控制卡片之间的间距
                sx={{
                    flexWrap: selectedKnowledgeBase ? 'nowrap' : 'wrap',
                    overflowX: selectedKnowledgeBase ? 'auto' : 'visible',
                }}
            >
                {knowledgeBases.map((kb) => (
                    <Grid item xs={12} sm={6} md={4} key={kb.id}>
                        <Card
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                boxShadow: 6, // 增加阴影等级
                                borderRadius: 2,
                                transition: 'transform 0.2s',
                                backgroundColor: '#fff9ff', // 保持卡片背景为白色
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                },
                            }}
                        >
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
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                    p: 1,
                                    pt: 0,
                                }}
                            >
                                {/* 所属模型和创建者 ID 显示 */}
                                <Box sx={{ display: 'flex', alignItems: 'left' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                        模型: {kb.model_owner || '未知模型'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        创建者ID: {kb.creator_id || '未知创建者'}
                                    </Typography>
                                </Box>
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
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

};

export default KnowledgeBaseList;