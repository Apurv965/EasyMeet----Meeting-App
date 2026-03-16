import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
import AppNavbar from '../components/AppNavbar';
export default function LandingPage() {


    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
            <div className='landingGlow landingGlowOne' />
            <div className='landingGlow landingGlowTwo' />

            <AppNavbar
                actions={[
                    { label: "Join as Guest", to: "/guest", auth: "logged_out" },
                    { label: "Join Meeting", to: "/auth", auth: "logged_out" },
                    { label: "Login", to: "/auth", primary: true, auth: "logged_out" },
                    {
                        label: "Logout",
                        primary: true,
                        auth: "logged_in",
                        onClick: () => {
                            localStorage.removeItem("token")
                            router("/auth")
                        }
                    }
                ]}
            />


            <div className="landingMainContainer">
                <div className='landingContent'>
                    <h1>Start a video conversation without the usual friction.</h1>

                    <p className='landingDescription'>
                        EasyMeet gives you a direct way to create a room, join by code,
                        and move into a meeting lobby with your camera and mic ready.
                    </p>
                    <div className='landingCtaRow'>
                        <div role='button' className='landingPrimaryCta'>
                            <Link to={localStorage.getItem("token") ? "/home" : "/auth"}>Get Started</Link>
                        </div>
                    </div>
                </div>
                <div className='landingVisual'>
                    <div className='landingVisualCard'>
                        <img src="/meeting.png" alt="EasyMeet illustration" />
                    </div>
                </div>
            </div>
        </div>
    )
}
