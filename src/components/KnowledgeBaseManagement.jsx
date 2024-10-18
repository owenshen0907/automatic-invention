// src/components/KnowledgeBaseManagement.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import axios from 'axios';
import useKnowledgeBaseFiles from '../hooks/useKnowledgeBaseFiles';

const KnowledgeBaseManagement = ({
                                     selectedKnowledgeBase,
                                     onBack,
                                     setSnackbar,
                                 }) => {
    const isLocalModel = selectedKnowledgeBase?.model_owner === 'local';

    // 使用自定义 Hook 管理文件数据
    const {
        files,
        loading,
        purposeMap,
        setPurposeMap,
        processing,
        setProcessing,
        fetchFiles,
        refreshFiles,
    } = useKnowledgeBaseFiles(selectedKnowledgeBase.id, isLocalModel, setSnackbar);

    // 处理使用意图改变
    const handlePurposeChange = (fileId, value) => {
        if (!isLocalModel) return; // 如果不是本地模型，不允许更改

        setPurposeMap(prev => ({
            ...prev,
            [fileId]: value
        }));
    };

    // 处理开始处理按钮点击
    const handleStartProcessing = async (file) => {
        let purpose = purposeMap[file.id];
        if (isLocalModel) {
            if (!purpose) {
                setSnackbar({
                    open: true,
                    message: '请选择使用意图',
                    severity: 'warning',
                });
                return;
            }
        } else {
            purpose = 'retrieval'; // 非本地模型，强制使用 'retrieval'
        }

        setProcessing(prev => ({
            ...prev,
            [file.id]: true
        }));

        try {
            const apiUrl = process.env.REACT_APP_API_BASE_URL;  // 确保获取正确的 API 基础路径
            const payload = {
                model_owner: selectedKnowledgeBase.model_owner, // 假设 `model_owner` 是知识库的一个属性
                file_id: file.file_id,
                purpose: purpose,
                vectorStoreID: selectedKnowledgeBase.id // 新增: 传递 vectorStoreID
            };

            const response = await axios.post(`${apiUrl}/api/trigger-external-upload`, payload);

            if (response.status === 200) {
                setSnackbar({
                    open: true,
                    message: `文件 "${file.file_name}" 开始处理`,
                    severity: 'success',
                });
                console.log(`文件 "${file.file_name}" 处理已触发`);
            } else {
                throw new Error('处理请求失败');
            }
        } catch (error) {
            console.error('处理文件失败:', error);
            setSnackbar({
                open: true,
                message: `处理文件 "${file.file_name}" 失败，请重试`,
                severity: 'error',
            });
        } finally {
            setProcessing(prev => ({
                ...prev,
                [file.id]: false
            }));
        }
    };

    return (
        <Box sx={{ p: 2 }}>
            {/* 将标题和按钮放在同一个容器中，并设置为 flex 布局 */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">
                    文件列表 - {selectedKnowledgeBase.display_name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" color="primary" onClick={onBack}>
                        返回列表
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={refreshFiles}>
                        刷新文件列表
                    </Button>
                </Box>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {/*<TableCell>文件ID</TableCell>*/}
                                <TableCell>文件名</TableCell>
                                <TableCell>存储路径</TableCell>
                                <TableCell>文件类型</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell>上传时间</TableCell>
                                <TableCell>向量存储文件 ID</TableCell>
                                <TableCell>使用字节数</TableCell>
                                <TableCell>使用意图</TableCell>
                                <TableCell>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files.length > 0 ? (
                                files.map((file, index) => (
                                    <TableRow key={file.id || index}>
                                        {/*<TableCell>{file.file_id}</TableCell>*/}
                                        <TableCell>{file.file_name}</TableCell>
                                        <TableCell>{file.file_path}</TableCell>
                                        <TableCell>{file.file_type}</TableCell>
                                        <TableCell>{file.file_description || '无'}</TableCell>
                                        <TableCell>{new Date(file.upload_time).toLocaleString()}</TableCell>
                                        <TableCell>{file.vector_file_id || '无'}</TableCell>
                                        <TableCell>{file.usage_bytes}</TableCell>
                                        <TableCell>
                                            {isLocalModel ? (
                                                <FormControl fullWidth variant="outlined" size="small">
                                                    <InputLabel id={`purpose-label-${file.id}`}>选择意图</InputLabel>
                                                    <Select
                                                        labelId={`purpose-label-${file.id}`}
                                                        value={purposeMap[file.id] || ''}
                                                        onChange={(e) => handlePurposeChange(file.id, e.target.value)}
                                                        label="选择意图"
                                                    >
                                                        <MenuItem value="file-extract">解析文档</MenuItem>
                                                        <MenuItem value="batch">批量请求</MenuItem>
                                                        <MenuItem value="fine-tune">Finetune</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            ) : (
                                                <Typography variant="body2">知识库</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ mt: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleStartProcessing(file)}
                                                    disabled={processing[file.id]}
                                                >
                                                    {processing[file.id] ? <CircularProgress size={20} /> : '开始处理'}
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">暂无文件</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default KnowledgeBaseManagement;