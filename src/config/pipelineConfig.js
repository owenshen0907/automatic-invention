// src/config/pipelineConfig.js
import PerformanceLevelControl from '../components/pipelineControls/PerformanceLevelControl';
import WebSearchControl from '../components/pipelineControls/WebSearchControl';
import MemoryControl from '../components/pipelineControls/MemoryControl';
import CustomFeatureControl from '../components/pipelineControls/CustomFeatureControl';
import KnowledgeBaseSelection from '../components/pipelineControls/KnowledgeBaseSelection';
import FileSelection from '../components/pipelineControls/FileSelection';

const pipelineConfig = {
    StepFun: [
        KnowledgeBaseSelection,
        FileSelection,
        PerformanceLevelControl,
        WebSearchControl,
        MemoryControl,
        // 添加 StepFun 特有的控件
    ],
    ChatGPT: [
        // KnowledgeBaseSelection,
        // FileSelection,
        PerformanceLevelControl,
        MemoryControl,
        // ChatGPT 可能不需要 Web Search 控件，或者需要其他控件
    ],
    AdvancedPipeline: [
        KnowledgeBaseSelection,
        FileSelection,
        PerformanceLevelControl,
        CustomFeatureControl,
        // 添加 AdvancedPipeline 特有的控件
    ],
    // 其他 Pipeline 的配置
    // AnotherPipeline: [KnowledgeBaseSelection, FileSelection, AnotherControl, ...],
};

export default pipelineConfig;