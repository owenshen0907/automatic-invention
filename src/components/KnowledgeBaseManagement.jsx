// src/components/KnowledgeBaseManagement.jsx
import React, { useEffect, useState, useMemo } from 'react';
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
    const [purposeMap, setPurposeMap] = useState({}); // 管理每个文件的使用意图
    const [processing, setProcessing] = useState({}); // 管理每个文件的处理状态

    const isLocalModel = useMemo(() => selectedKnowledgeBase?.model_owner === 'local', [selectedKnowledgeBase]);

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
                        setFiles(response.data || []);
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
                    setFiles(response.data || []);
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

    // 文件加载后初始化 `purposeMap`
    useEffect(() => {
        if (files.length > 0) {
            const initialPurposeMap = {};
            files.forEach(file => {
                initialPurposeMap[file.id] = isLocalModel ? '' : 'retrieval'; // 设置初始意图
            });
            setPurposeMap(initialPurposeMap); // 初始化 `purposeMap`
        }
    }, [files, isLocalModel]);

    // 文件使用意图改变时只更新相应的文件
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
                setSnackbarMessage('请选择使用意图');
                setSnackbarSeverity('warning');
                setSnackbarOpen(true);
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
                setSnackbarMessage(`文件 "${file.file_name}" 开始处理`);
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                console.log(`文件 "${file.file_name}" 处理已触发`);
            } else {
                throw new Error('处理请求失败');
            }
        } catch (error) {
            console.error('处理文件失败:', error);
            setSnackbarMessage(`处理文件 "${file.file_name}" 失败，请重试`);
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        } finally {
            setProcessing(prev => ({
                ...prev,
                [file.id]: false
            }));
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