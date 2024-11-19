// src/components/pipelineControls/FileSelection.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, CircularProgress, Chip } from '@mui/material';
import PropTypes from 'prop-types';
import { styled } from '@mui/system';

const FormControlStyled = styled(FormControl)(({ theme }) => ({
    backgroundColor: '#f9f9f9',
    width: '100%',
}));

const FileSelection = ({ selectedFiles, onFileChange, files, loading }) => {
    const filteredFiles = files ? files.filter((file) => file.vector_file_id) : [];

    return (
        <Box sx={{ marginBottom: 3, width: '85%' }}>
            {loading ? (
                <CircularProgress size={24} />
            ) : (
                <FormControlStyled fullWidth variant="outlined" size="small">
                    <InputLabel id="file-select-label">选择文件</InputLabel>
                    <Select
                        labelId="file-select-label"
                        multiple
                        value={selectedFiles}
                        onChange={onFileChange}
                        label="选择文件"
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => {
                                    const file = filteredFiles.find((f) => f.vector_file_id === value);
                                    return <Chip key={value} label={file ? file.file_name : value} />;
                                })}
                            </Box>
                        )}
                    >
                        {filteredFiles.length > 0 ? (
                            filteredFiles.map((file) => (
                                <MenuItem key={file.vector_file_id} value={file.vector_file_id}>
                                    {file.file_name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="" disabled>
                                无可用文件
                            </MenuItem>
                        )}
                    </Select>
                </FormControlStyled>
            )}
        </Box>
    );
};

FileSelection.propTypes = {
    selectedFiles: PropTypes.arrayOf(PropTypes.string).isRequired,
    onFileChange: PropTypes.func.isRequired,
    files: PropTypes.arrayOf(
        PropTypes.shape({
            vector_file_id: PropTypes.string.isRequired,
            file_name: PropTypes.string.isRequired,
        })
    ),
    loading: PropTypes.bool.isRequired,
};

export default FileSelection;