// src/hooks/useKnowledgeBaseFiles.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const FILE_CACHE_KEY_PREFIX = 'knowledgeBaseFiles_';

const useKnowledgeBaseFiles = (knowledgeBaseID, isLocalModel, setSnackbar) => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [purposeMap, setPurposeMap] = useState({});
    const [processing, setProcessing] = useState({});

    // 获取缓存文件
    const getCachedFiles = () => {
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

    // 设置缓存文件
    const setCachedFiles = (files) => {
        const payload = JSON.stringify(files);
        localStorage.setItem(`${FILE_CACHE_KEY_PREFIX}${knowledgeBaseID}`, payload);
    };

    // 清除缓存文件
    const clearCachedFiles = () => {
        localStorage.removeItem(`${FILE_CACHE_KEY_PREFIX}${knowledgeBaseID}`);
    };

    // 获取文件数据
    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const cachedFiles = getCachedFiles();
            if (cachedFiles) {
                setFiles(cachedFiles);
                console.log('使用缓存的文件数据');
                return;
            }

            const apiUrl = process.env.REACT_APP_API_BASE_URL;
            const response = await axios.get(`${apiUrl}/api/knowledge-bases/${knowledgeBaseID}/files`,{withCredentials: true,});
            if (response.status === 200) {
                const data = response.data || [];
                setFiles(data);
                setCachedFiles(data); // 缓存数据
                console.log('从 API 获取并缓存文件数据');
            }
        } catch (error) {
            console.error('无法加载文件数据:', error);
            if (setSnackbar) {
                setSnackbar({
                    open: true,
                    message: '无法加载文件数据，请重试',
                    severity: 'error',
                });
            }
        } finally {
            setLoading(false);
        }
    }, [knowledgeBaseID]);

    // 刷新文件数据
    const refreshFiles = useCallback(async () => {
        clearCachedFiles();
        setFiles([]);
        await fetchFiles();
    }, [fetchFiles]);

    // 初始化 purposeMap
    useEffect(() => {
        if (files.length > 0) {
            const initialPurposeMap = {};
            files.forEach(file => {
                initialPurposeMap[file.id] = isLocalModel ? '' : 'retrieval'; // 设置初始意图
            });
            setPurposeMap(initialPurposeMap);
        }
    }, [files, isLocalModel]);

    useEffect(() => {
        if (knowledgeBaseID) {
            fetchFiles();
        }
    }, [knowledgeBaseID, fetchFiles]);

    return {
        files,
        loading,
        purposeMap,
        setPurposeMap,
        processing,
        setProcessing,
        fetchFiles,
        refreshFiles,
    };
};

export default useKnowledgeBaseFiles;