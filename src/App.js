// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import Layout from './components/Layout';
import AIGCPage from './pages/AIGCPage';
import NotePage from './pages/NotePage';
import KnowledgeCenterPage from './pages/KnowledgeCenterPage';

function App() {
    return (
        <Router>
            <CssBaseline />
            <Layout>
                <Routes>
                    <Route path="/" element={<Navigate to="/aigc" />} />
                    <Route path="/aigc" element={<AIGCPage />} />
                    <Route path="/note" element={<NotePage />} />
                    <Route path="/knowledge-center" element={<KnowledgeCenterPage />} />
                    {/* 其他路由 */}
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;