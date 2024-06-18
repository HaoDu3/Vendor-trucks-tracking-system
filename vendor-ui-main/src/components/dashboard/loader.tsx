import { Box, CircularProgress } from "@mui/material";

export default function Loader() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', margin: '20px'}}>
            <CircularProgress />
        </Box>
    )
}