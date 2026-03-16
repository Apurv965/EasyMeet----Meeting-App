import React from 'react'
import { useNavigate } from 'react-router-dom'
import "../App.css";

export default function AppNavbar({ actions = [], dark = false }) {
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem("token"));

    const visibleActions = actions.filter((action) => {
        if (action.auth === "logged_in") {
            return isLoggedIn;
        }

        if (action.auth === "logged_out") {
            return !isLoggedIn;
        }

        return true;
    });

    return (
        <header className={dark ? "appNavbar appNavbarDark" : "appNavbar"}>
            <button
                className="appNavbarBrand"
                onClick={() => navigate("/")}
                type="button"
            >
                <span className="appNavbarLogo">
                    <img src="/easymeet-logo.svg" alt="EasyMeet logo" />
                </span>
                <span className="appNavbarText">
                    <strong>EasyMeet</strong>
                    <small>Simple video meetings</small>
                </span>
            </button>

            <div className="appNavbarActions">
                {visibleActions.map((action) => (
                    <div className="appNavbarActionWrap" key={action.label}>
                        <button
                            className={action.primary ? "appNavbarAction appNavbarActionPrimary" : "appNavbarAction"}
                            onClick={() => {
                                if (action.disabled) {
                                    return;
                                }

                                if (action.onClick) {
                                    action.onClick();
                                    return;
                                }

                                if (action.to) {
                                    navigate(action.to);
                                }
                            }}
                            type="button"
                            disabled={action.disabled}
                        >
                            {action.label}
                        </button>
                        {action.popoverContent ? (
                            <div className="appNavbarPopover">
                                {action.popoverContent}
                            </div>
                        ) : null}
                    </div>
                ))}
            </div>
        </header>
    );
}
