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
    CircularProgress
} from '@mui/material';
import axios from 'axios';

// 缓存相关辅助函数
const FILE_CACHE_KEY_PREFIX = 'knowledgeBaseFiles_';

const getCachedFiles = (knowledgeBaseID) => {
    const cached = localStorage.getItem(`${FILE_CACHE_KEY_PREFIX}${knowledgeBaseID}`);
    if (!cached) return null;

    try {
        const parsed = JSON.parse(cached);
        return parsed;
    } catch (error) {
        console.error('解析文件缓存数据失败:', error);
        localStorage.removeItem(`${FILE_CACHE_KEY_PREFIX}${knowledgeBaseID}`);
        return null;
    }
};

const setCachedFiles = (knowledgeBaseID, files) => {
    const payload = JSON.stringify(files);
    localStorage.setItem(`${FILE_CACHE_KEY_PREFIX}${knowledgeBaseID}`, payload);
};

const clearCachedFiles = (knowledgeBaseID) => {
    localStorage.removeItem(`${FILE_CACHE_KEY_PREFIX}${knowledgeBaseID}`);
};

const KnowledgeBaseManagement = ({
                                     selectedKnowledgeBase,
                                     onBack,
                                     setSnackbarMessage,
                                     setSnackbarSeverity,
                                     setSnackbarOpen
                                 }) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);

    // 组件加载时，优先从缓存中获取文件数据
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                if (selectedKnowledgeBase) {
                    const cachedFiles = getCachedFiles(selectedKnowledgeBase.id);
                    if (cachedFiles) {
                        setFiles(cachedFiles);
                        setLoading(false);
                        console.log('使用缓存的文件数据');
                        return;
                    }

                    const apiUrl = process.env.REACT_APP_API_BASE_URL;
                    const response = await axios.get(`${apiUrl}/api/knowledge-bases/${selectedKnowledgeBase.id}/files`);
                    if (response.status === 200) {
                        setFiles(response.data);
                        setCachedFiles(selectedKnowledgeBase.id, response.data); // 缓存数据
                        console.log('从 API 获取并缓存文件数据');
                    }
                }
            } catch (error) {
                console.error('无法加载文件数据:', error);
                setSnackbarMessage('无法加载文件数据，请重试');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, [selectedKnowledgeBase, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen]);

    // 处理刷新按钮，清除缓存并重新加载文件数据
    const handleRefresh = async () => {
        if (selectedKnowledgeBase) {
            clearCachedFiles(selectedKnowledgeBase.id); // 清除缓存
            setLoading(true);
            try {
                const apiUrl = process.env.REACT_APP_API_BASE_URL;
                const response = await axios.get(`${apiUrl}/api/knowledge-bases/${selectedKnowledgeBase.id}/files`);
                if (response.status === 200) {
                    setFiles(response.data);
                    setCachedFiles(selectedKnowledgeBase.id, response.data); // 重新缓存数据
                    console.log('从 API 刷新并缓存文件数据');
                }
            } catch (error) {
                console.error('刷新文件数据失败:', error);
                setSnackbarMessage('无法刷新文件数据，请重试');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!selectedKnowledgeBase) {
        return null;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5">文件列表 - {selectedKnowledgeBase.display_name}</Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>文件名</TableCell>
                                <TableCell>存储路径</TableCell>
                                <TableCell>文件类型</TableCell>
                                <TableCell>描述</TableCell>
                                <TableCell>上传时间</TableCell>
                                <TableCell>向量存储文件 ID</TableCell>
                                <TableCell>使用字节数</TableCell>
                                <TableCell>状态</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files.length > 0 ? (
                                files.map((file, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{file.file_name}</TableCell>
                                        <TableCell>{file.file_path}</TableCell>
                                        <TableCell>{file.file_type}</TableCell>
                                        <TableCell>{file.file_description || '无'}</TableCell>
                                        <TableCell>{new Date(file.upload_time).toLocaleString()}</TableCell>
                                        <TableCell>{file.vector_file_id || '无'}</TableCell>
                                        <TableCell>{file.usage_bytes}</TableCell>
                                        <TableCell>{file.status || '未知'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">暂无文件</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="contained" color="primary" onClick={onBack}>
                    返回列表
                </Button>
                <Button variant="outlined" color="secondary" onClick={handleRefresh}>
                    刷新文件列表
                </Button>
            </Box>
        </Box>
    );
};

export default KnowledgeBaseManagement;