import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, TextField } from '@mui/material'
import "../App.css";
import AppNavbar from '../components/AppNavbar';

export default function GuestPage() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const handleJoinMeeting = () => {
        const trimmedMeetingCode = meetingCode.trim();

        if (!trimmedMeetingCode) {
            return;
        }

        navigate(`/${trimmedMeetingCode}`);
    };

    return (
        <div className="guestPage">
            <AppNavbar
                actions={[
                    { label: "Home", to: "/" },
                    { label: "Login", to: "/auth", primary: true, auth: "logged_out" }
                ]}
            />
            <div className="guestCard">
                <p className="guestEyebrow">Join as guest</p>
                <h1>Enter a meeting code and join instantly.</h1>
                <p className="guestText">
                    No login required. Paste the room code below to enter the meeting lobby.
                </p>

                <TextField
                    fullWidth
                    label="Meeting Code"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleJoinMeeting();
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
                    variant="contained"
                    className="guestJoinButton"
                    onClick={handleJoinMeeting}
                >
                    Continue To Lobby
                </Button>
            </div>
        </div>
    )
}
