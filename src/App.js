// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Snackbar, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles'; // 导入 ThemeProvider
import Layout from './components/Layout';
import AIGCPage from './pages/AIGCPage';
import NotePage from './pages/NotePage';
import KnowledgeCenterPage from './pages/KnowledgeCenterPage';
import { KnowledgeBaseProvider } from './context/KnowledgeBaseContext';
import theme from './theme'; // 导入自定义主题
// import AIGCFunctionalitySidebar from './components/AIGCFunctionalitySidebar';

function App() {
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };
    // 定义 updateSnackbar 方法
    const updateSnackbar = (msg) => {
        setSnackbar({ open: true, ...msg });
    };

    return (
        <ThemeProvider theme={theme}> {/* 使用 ThemeProvider 包裹整个应用 */}
            <CssBaseline />
        <Router>

            <KnowledgeBaseProvider>
                <Layout updateSnackbar={updateSnackbar}> {/* 传递 updateSnackbar */}
                    <Routes>
                        <Route path="/" element={<Navigate to="/aigc" />} />
                        <Route path="/aigc" element={<AIGCPage />} />
                        <Route path="/note" element={<NotePage />} />
                        <Route path="/knowledge-center" element={<KnowledgeCenterPage />} />
                        {/* 其他路由 */}
                    </Routes>
                </Layout>
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </KnowledgeBaseProvider>
        </Router>
</ThemeProvider>
    );
}

export default App;