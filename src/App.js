// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import AIGCPage from './pages/AIGCPage';
import NotePage from './pages/NotePage';
import KnowledgeCenterPage from './pages/KnowledgeCenterPage';
import { KnowledgeBaseProvider } from './context/KnowledgeBaseContext'; // 导入 Provider

function App() {
    return (
        <Router>
            <CssBaseline />
            {/* 使用 KnowledgeBaseProvider 包裹 Layout，使其及子组件都能访问上下文 */}
            <KnowledgeBaseProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Navigate to="/aigc" />} />
                        <Route path="/aigc" element={<AIGCPage />} />
                        <Route path="/note" element={<NotePage />} />
                        <Route path="/knowledge-center" element={<KnowledgeCenterPage />} />
                        {/* 其他路由 */}
                    </Routes>
                </Layout>
            </KnowledgeBaseProvider>
        </Router>
    );
}

export default App;