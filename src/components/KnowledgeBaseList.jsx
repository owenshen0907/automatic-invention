// src/components/KnowledgeBaseList.jsx
import React, { useState, useRef } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    LinearProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import axios from 'axios'; // 确保安装了 axios: npm install axios

const MAX_FILE_SIZE = 64 * 1024 * 1024; // 64MB

const KnowledgeBaseList = ({
                               knowledgeBases,
                               onSelectKnowledgeBase,
                               onEditKnowledgeBase,
                               selectedKnowledgeBase, // 接收 selectedKnowledgeBase
                               setSnackbarMessage,
                               setSnackbarSeverity,
                               setSnackbarOpen
                           }) => {
    // 状态用于跟踪当前选择的知识库进行上传
    const [selectedKBForUpload, setSelectedKBForUpload] = useState(null);
    const fileInputRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(0); // 上传进度

    // 上传文件的函数
    const handleUploadFile = (kb) => {
        setSelectedKBForUpload(kb);
        if (fileInputRef.current) {
            fileInputRef.current.value = null; // 重置文件输入
            fileInputRef.current.click(); // 触发文件选择对话框
        }
    };

    // 处理文件选择并上传
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return; // 用户取消了选择

        if (!selectedKBForUpload) {
            setSnackbarMessage('未选择知识库进行上传');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
            setSnackbarMessage('文件大小超过限制（64MB）');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }

        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('vector_store_id', selectedKBForUpload.id);
        formData.append('file', file);

        try {
            setSnackbarMessage(`正在上传文件到知识库: ${selectedKBForUpload.display_name}`);
            setSnackbarSeverity('info');
            setSnackbarOpen(true);
            setUploadProgress(0); // 重置上传进度

            // 发送 POST 请求到后端上传文件
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/knowledge-upload-file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                },
            });

            // 处理成功响应
            setSnackbarMessage(`文件上传成功: ${response.data.id}`);
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // 可选：触发父组件或上下文更新，刷新知识库列表或文件列表
            // 例如：如果有获取知识库详情的函数，可以调用它来刷新数据

        } catch (error) {
            console.error('上传文件失败:', error);
            setSnackbarMessage(`文件上传失败: ${error.response?.data?.error || error.message}`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setSelectedKBForUpload(null);
            setUploadProgress(0);
        }
    };

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: { xs: 1, sm: 2, md: 3 } // 响应式内边距
            }}
        >
            {/* 隐藏的文件输入 */}
            <input
                type="file"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".md,.txt,.pdf,.doc,.docx" // 根据需要调整接受的文件类型
            />

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
                                <IconButton onClick={() => handleUploadFile(kb)} color="default" size="small" aria-label="upload">
                                    <UploadFileIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            {/* 显示上传进度条 */}
                            {uploadProgress > 0 && uploadProgress < 100 && selectedKBForUpload?.id === kb.id && (
                                <Box sx={{ width: '100%', p: 1 }}>
                                    <LinearProgress variant="determinate" value={uploadProgress} />
                                    <Typography variant="caption" color="text.secondary">
                                        上传进度: {uploadProgress}%
                                    </Typography>
                                </Box>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );

};

export default KnowledgeBaseList;