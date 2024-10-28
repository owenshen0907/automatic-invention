// src/hooks/useKnowledgeBases.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CACHE_KEY = 'knowledgeBases';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 小时

const useKnowledgeBases = () => {
    const [knowledgeBases, setKnowledgeBases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 获取缓存数据
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

    // 设置缓存数据
    const setCachedData = (data) => {
        const payload = {
            data,
            timestamp: new Date().getTime(),
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    };

    // 获取知识库数据
    const fetchKnowledgeBases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const cachedData = getCachedData();
            if (cachedData) {
                setKnowledgeBases(cachedData);
                console.log('使用缓存的知识库数据');
                return;
            }

            const apiUrl = process.env.REACT_APP_API_BASE_URL;
            const response = await axios.get(`${apiUrl}/api/get-data?type=knowledge_bases`,{
                withCredentials: true,
            });
            console.log('知识库数据:', response.data);
            if (response.status === 200) {
                const data = response.data.map(kb => ({
                    ...kb,
                    tags: kb.tags || "",
                }));
                setKnowledgeBases(data);
                setCachedData(data); // 缓存数据
                console.log('从 API 获取并缓存知识库数据');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('无法加载知识库数据:', error);
            setError('无法加载知识库数据，请重试');
        } finally {
            setLoading(false);
        }
    }, []);

    // 添加新的知识库
    const addKnowledgeBase = (newKB) => {
        const updatedKnowledgeBases = [...knowledgeBases, newKB];
        setKnowledgeBases(updatedKnowledgeBases);
        setCachedData(updatedKnowledgeBases); // 更新缓存
    };

    // 更新现有的知识库
    const updateKnowledgeBase = (updatedKB) => {
        const updatedKnowledgeBases = knowledgeBases.map(kb =>
            kb.id === updatedKB.id ? updatedKB : kb
        );
        setKnowledgeBases(updatedKnowledgeBases);
        setCachedData(updatedKnowledgeBases); // 更新缓存
    };

    // 刷新知识库数据
    const refreshKnowledgeBases = async () => {
        localStorage.removeItem(CACHE_KEY);
        setKnowledgeBases([]);
        await fetchKnowledgeBases();
    };

    useEffect(() => {
        fetchKnowledgeBases();
    }, [fetchKnowledgeBases]);

    return {
        knowledgeBases,
        loading,
        error,
        addKnowledgeBase,
        updateKnowledgeBase,
        fetchKnowledgeBases,
        refreshKnowledgeBases,
    };
};

export default useKnowledgeBases;