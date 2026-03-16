import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded';
import "../App.css";
import AppNavbar from '../components/AppNavbar';
export default function History() {


    const { getHistoryOfUser } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([])


    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        }

        fetchHistory();
    }, [])

    let formatDate = (dateString) => {
        if (!dateString) {
            return "N/A";
        }

        const date = new Date(dateString);
        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0")
        const year = date.getFullYear();

        return `${day}/${month}/${year}`

    }

    return (
        <div className="historyPage">
            <AppNavbar
                actions={[
                    { label: "Home", to: "/home" },
                    {
                        label: "Logout",
                        primary: true,
                        auth: "logged_in",
                        onClick: () => {
                            localStorage.removeItem("token")
                            routeTo("/auth")
                        }
                    }
                ]}
            />
            <header className="historyHeader">
                <div className="historyTitleBlock">
                    <div className="historyTitleIcon">
                        <HistoryRoundedIcon />
                    </div>
                    <div>
                        <p className="historyEyebrow">Meeting history</p>
                        <h1>Your recent rooms</h1>
                    </div>
                </div>

            </header>

            <section className="historySummary">
                <div className="historySummaryCard">
                    <span>Total meetings</span>
                    <strong>{meetings.length}</strong>
                </div>
                <div className="historySummaryCard">
                    <span>Latest activity</span>
                    <strong>{meetings.length ? formatDate(meetings[0].date || meetings[0].data) : "No history yet"}</strong>
                </div>
            </section>

            {meetings.length !== 0 ? (
                <section className="historyGrid">
                    {meetings.map((meeting, index) => {
                        const meetingDate = formatDate(meeting.date || meeting.data);

                        return (
                            <article className="historyCard" key={`${meeting.meetingCode}-${index}`}>
                                <div className="historyCardTop">
                                    <span className="historyCodeLabel">Meeting code</span>
                                    <h2>{meeting.meetingCode}</h2>
                                </div>

                                <div className="historyMetaRow">
                                    <AccessTimeRoundedIcon fontSize="small" />
                                    <span>{meetingDate}</span>
                                </div>

                                <Button
                                    variant="contained"
                                    className="historyJoinButton"
                                    endIcon={<ArrowOutwardRoundedIcon />}
                                    onClick={() => routeTo(`/${meeting.meetingCode}`)}
                                >
                                    Join Again
                                </Button>
                            </article>
                        )
                    })}
                </section>
            ) : (
                <section className="historyEmptyState">
                    <HistoryRoundedIcon />
                    <h2>No meetings yet</h2>
                    <p>Your joined rooms will appear here once you start using EasyMeet.</p>
                    <Button variant="contained" className="historyJoinButton" onClick={() => routeTo("/home")}>
                        Go To Home
                    </Button>
                </section>
            )}
        </div>
    )
}
