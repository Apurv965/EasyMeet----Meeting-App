import React, { useContext, useEffect, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import { AuthContext } from '../contexts/AuthContext';
import AppNavbar from '../components/AppNavbar';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [now, setNow] = useState(() => new Date());


    const { addToUserHistory } = useContext(AuthContext);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    let handleJoinVideoCall = async () => {
        const trimmedMeetingCode = meetingCode.trim();

        if (!trimmedMeetingCode) {
            return;
        }

        try {
            await addToUserHistory(trimmedMeetingCode);
        } catch (error) {
            console.error("Failed to save meeting history", error);
        }

        navigate(`/${trimmedMeetingCode}`)
    }

    return (
        <div className="homePage">
            <AppNavbar
                actions={[
                    { label: "History", to: "/history" },
                    {
                        label: "Logout",
                        primary: true,
                        auth: "logged_in",
                        onClick: () => {
                            localStorage.removeItem("token")
                            navigate("/auth")
                        }
                    }
                ]}
            />

            <main className="homeHero">
                <section className="homeContent">
                    <div className="homeImagePanel">
                        <img srcSet='/logo11.png' alt="EasyMeet preview" />
                    </div>

                    <div className="homeSimpleCard">
                        <p className="homeDateLabel">
                            {now.toLocaleDateString(undefined, {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            })}
                        </p>
                        <h1>{now.toLocaleTimeString()}</h1>
                        <p className="homeSimpleText">Enter a meeting code to join your room.</p>

                        <TextField
                            fullWidth
                            value={meetingCode}
                            onChange={e => setMeetingCode(e.target.value)}
                            label="Meeting Code"
                            variant="outlined"
                            placeholder="example-room-123"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleJoinVideoCall();
                                }
                            }}
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '14px',
                                    backgroundColor: '#ffffff'
                                }
                            }}
                        />

                        <Button
                            onClick={handleJoinVideoCall}
                            variant='contained'
                            className="homeJoinButton"
                            endIcon={<ArrowOutwardRoundedIcon />}
                        >
                            Join Meeting
                        </Button>

                        <button
                            className="homeQuickLink"
                            onClick={() => navigate("/history")}
                            type="button"
                        >
                            <HistoryIcon fontSize="small" />
                            View meeting history
                        </button>
                    </div>
                </section>
            </main>
        </div>
    )
}


export default withAuth(HomeComponent)
