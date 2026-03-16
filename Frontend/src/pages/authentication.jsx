import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import AppNavbar from '../components/AppNavbar';

export default function Authentication() {

    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");
    const [error, setError] = React.useState("");
    const [message, setMessage] = React.useState("");


    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            if (formState === 0) {

                await handleLogin(username, password)


            }
            if (formState === 1) {
                const result = await handleRegister(name, username, password);
                console.log(result);
                setUsername("");
                setMessage(result);
                setOpen(true);
                setError("")
                setFormState(0)
                setPassword("")
            }
        } catch (err) {

            console.log(err);
            const message = err?.response?.data?.message || err?.message || "Unable to connect to the server.";
            setError(message);
        }
    }


    return (
        <>
            <CssBaseline />
            <Box
                component="main"
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    px: 2,
                    py: 14,
                    background:
                        'radial-gradient(circle at top left, rgba(217, 117, 0, 0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(16, 105, 201, 0.16), transparent 30%), linear-gradient(135deg, #f7efe5 0%, #eff4fb 55%, #f9fbff 100%)',
                    position: 'relative',
                }}
            >
                <Box sx={{ position: 'absolute', top: 16, left: 16, right: 16 }}>
                    <AppNavbar
                        actions={[
                            { label: "Home", to: "/" },
                            { label: "Join as Guest", to: "/guest" }
                        ]}
                    />
                </Box>
                <Paper
                    elevation={10}
                    sx={{
                        width: '100%',
                        maxWidth: 460,
                        borderRadius: 5,
                        px: { xs: 3, sm: 5 },
                        py: { xs: 4, sm: 5 },
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 248, 240, 0.94)',
                        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.22)',
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <Avatar sx={{ mb: 2, bgcolor: '#d97500', width: 56, height: 56 }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#132238' }}>
                            {formState === 0 ? "Welcome back" : "Create account"}
                        </Typography>

                        <Typography sx={{ mt: 1, mb: 3, color: '#4f5d6b' }}>
                            {formState === 0 ? "Sign in to join your next meeting." : "Set up your profile and start meeting."}
                        </Typography>

                        <Box
                            sx={{
                                display: 'flex',
                                width: '100%',
                                p: 0.75,
                                mb: 2,
                                borderRadius: 999,
                                backgroundColor: '#edf2f7',
                                gap: 1,
                            }}
                        >
                            <Button
                                fullWidth
                                variant={formState === 0 ? "contained" : "text"}
                                onClick={() => { setFormState(0); setError(""); }}
                                sx={{
                                    borderRadius: 999,
                                    py: 1.1,
                                    boxShadow: formState === 0 ? 'none' : 'none',
                                    backgroundColor: formState === 0 ? '#132238' : 'transparent',
                                    color: formState === 0 ? '#fff' : '#132238',
                                }}
                            >
                                Sign In
                            </Button>
                            <Button
                                fullWidth
                                variant={formState === 1 ? "contained" : "text"}
                                onClick={() => { setFormState(1); setError(""); }}
                                sx={{
                                    borderRadius: 999,
                                    py: 1.1,
                                    boxShadow: 'none',
                                    backgroundColor: formState === 1 ? '#d97500' : 'transparent',
                                    color: formState === 1 ? '#fff' : '#132238',
                                }}
                            >
                                Sign Up
                            </Button>
                        </Box>

                        <Box component="form" noValidate sx={{ mt: 1, width: '100%' }}>
                            {formState === 1 ? <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Full Name"
                                name="name"
                                value={name}
                                autoFocus
                                onChange={(e) => setName(e.target.value)}
                            /> : <></>}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                value={username}
                                autoFocus
                                onChange={(e) => setUsername(e.target.value)}

                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                value={password}
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}

                                id="password"
                            />

                            <Typography sx={{ minHeight: 24, mt: 1, color: '#c62828', textAlign: 'left' }}>
                                {error}
                            </Typography>

                            <Button
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 2,
                                    mb: 1,
                                    py: 1.4,
                                    borderRadius: 3,
                                    backgroundColor: '#132238',
                                    boxShadow: 'none',
                                }}
                                onClick={handleAuth}
                            >
                                {formState === 0 ? "Sign In" : "Create Account"}
                            </Button>

                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Snackbar

                open={open}
                autoHideDuration={4000}
                message={message}
            />

        </>
    );
}
