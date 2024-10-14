// src/config.js

const pipelineOptionsEnv = process.env.REACT_APP_PIPELINE_OPTIONS;

let pipelineOptions = [
    { value: 'Dify', label: 'Dify' },
    { value: 'StepFun', label: 'StepFun' },
];

try {
    if (pipelineOptionsEnv) {
        const parsedOptions = JSON.parse(pipelineOptionsEnv);
        pipelineOptions = parsedOptions;
    }
} catch (error) {
    console.error('解析 REACT_APP_PIPELINE_OPTIONS 失败:', error);
}

const apiUrls = {
    Dify: process.env.REACT_APP_API_DIFY_URL,
    StepFun: process.env.REACT_APP_API_STEPFUN_URL,
};

export { pipelineOptions, apiUrls };