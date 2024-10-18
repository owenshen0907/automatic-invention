// src/context/KnowledgeBaseContext.jsx
import React, { createContext } from 'react';
import useKnowledgeBases from '../hooks/useKnowledgeBases';

export const KnowledgeBaseContext = createContext();

export const KnowledgeBaseProvider = ({ children }) => {
    const {
        knowledgeBases,
        loading,
        addKnowledgeBase,
        updateKnowledgeBase,
        fetchKnowledgeBases,
        refreshKnowledgeBases,
    } = useKnowledgeBases();

    return (
        <KnowledgeBaseContext.Provider
            value={{
                knowledgeBases,
                loading,
                addKnowledgeBase,
                updateKnowledgeBase,
                fetchKnowledgeBases,
                refreshKnowledgeBases,
            }}
        >
            {children}
        </KnowledgeBaseContext.Provider>
    );
};