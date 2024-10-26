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
    InputLabel,
    TablePagination,
    AppBar,
    Toolbar,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // 导入返回图标
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
    // 新增分页状态
    const [page, setPage] = useState(0); // 当前页
    const [rowsPerPage, setRowsPerPage] = useState(10); // 每页显示的文件数

    // 处理页码变化
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // 处理每页显示数量变化
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // 当改变每页显示数量时，重置页码
    };

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
    // 根据当前页和每页显示数量进行文件切片
    const paginatedFiles = files.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* AppBar 作为顶部导航栏 */}
            <AppBar position="static" color="default" elevation={1}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onBack} aria-label="back">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        文件管理 - {selectedKnowledgeBase.display_name}
                    </Typography>
                    <Button variant="outlined" color="secondary" onClick={refreshFiles}>
                        刷新文件列表
                    </Button>
                </Toolbar>
            </AppBar>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                <TableContainer component={Paper} sx={{ mt: 2 ,flexGrow: 1}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {/*<TableCell>文件ID</TableCell>*/}
                                <TableCell>文件名</TableCell>
                                {/*<TableCell>存储路径</TableCell>*/}
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
                                paginatedFiles.map((file, index) => (
                                    <TableRow key={file.id || index}>
                                        {/*<TableCell>{file.file_id}</TableCell>*/}
                                        <TableCell>{file.file_name}</TableCell>
                                        {/*<TableCell>{file.file_path}</TableCell>*/}
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
                                                    disabled={processing[file.id]|| Boolean(file.vector_file_id)}
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

                    {/* 添加分页组件 */}
                    <TablePagination
                        component="div"
                        count={files.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="每页显示"
                    />
                </>
            )}
        </Box>
    );
};

export default KnowledgeBaseManagement;