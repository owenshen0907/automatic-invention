// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2a2a72', // 主色调
        },
        secondary: {
            main: '#99ccff', // 次色调
        },
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    margin: 0,
                },
                paragraph: {
                    marginBottom: '0.5em', // 与组件中设置的一致
                },
            },
        },
    },
});

export default theme;