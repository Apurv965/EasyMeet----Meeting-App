import React, { useCallback, useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamTwoToneIcon from '@mui/icons-material/VideocamTwoTone';
import VideocamOffTwoToneIcon from '@mui/icons-material/VideocamOffTwoTone';
import styles from "../styles/videoComponent.module.css";
import CallEndTwoToneIcon from '@mui/icons-material/CallEndTwoTone';
import MicTwoToneIcon from '@mui/icons-material/MicTwoTone';
import MicOffTwoToneIcon from '@mui/icons-material/MicOffTwoTone';
import ScreenShareTwoToneIcon from '@mui/icons-material/ScreenShareTwoTone';
import StopScreenShareTwoToneIcon from '@mui/icons-material/StopScreenShareTwoTone';
import MessageTwoToneIcon from '@mui/icons-material/MessageTwoTone';
import AppNavbar from '../components/AppNavbar';

const server_url = process.env.REACT_APP_SOCKET_URL || "http://localhost:8000";

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState(undefined);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");
    let [usernameError, setUsernameError] = useState("");
    let [participants, setParticipants] = useState([]);
    let [showMembers, setShowMembers] = useState(false);

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // TODO
    // if(isChrome() === false) {


    // }

    const cleanupConnections = () => {
        Object.values(connections).forEach((connection) => {
            try {
                connection.close();
            } catch (e) {
                console.log(e);
            }
        });

        connections = {};
        videoRef.current = [];
        setVideos([]);
        setParticipants([]);
        setShowMembers(false);

        if (socketRef.current) {
            socketRef.current.off();
            socketRef.current.disconnect();
            socketRef.current = null;
        }

        socketIdRef.current = null;

        if (window.localStream) {
            try {
                window.localStream.getTracks().forEach((track) => track.stop());
            } catch (e) {
                console.log(e);
            }
            window.localStream = null;
        }

        if (localVideoref.current) {
            localVideoref.current.srcObject = null;
        }
    };

    useEffect(() => {
        getPermissions();

        return () => {
            cleanupConnections();
        };
    }, [])

    useEffect(() => {
        if (!askForUsername && localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername, video, audio, screen]);

    const setLocalVideoRef = useCallback((node) => {
        localVideoref.current = node;

        if (node && window.localStream) {
            node.srcObject = window.localStream;
            const playPromise = node.play?.();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(() => { });
            }
        }
    }, []);

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            setVideo((currentVideo) => currentVideo ?? Boolean(videoPermission));
            setAudio((currentAudio) => currentAudio ?? Boolean(audioPermission));

            if (videoPermission) {
                videoPermission.getTracks().forEach((track) => track.stop());
            }

            if (audioPermission) {
                audioPermission.getTracks().forEach((track) => track.stop());
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        connectToSocketServer();

    }


    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => {
                track.onended = null;
                track.stop();
            })
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            if (track.kind === "video") {
                setVideo(false);
            }

            if (track.kind === "audio") {
                setAudio(false);
            }

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => {
                    track.onended = null;
                    track.stop();
                })
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            if (localVideoref.current) {
                localVideoref.current.srcObject = window.localStream
            }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => {
                track.onended = null;
                track.stop();
            })
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => {
                    track.onended = null;
                    track.stop();
                })
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        cleanupConnections();
        socketRef.current = io.connect(server_url, { secure: false })

        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }

        socketRef.current.on('signal', gotMessageFromServer)
        socketRef.current.on('chat-message', addMessage)

        socketRef.current.on('user-left', (id) => {
            if (connections[id]) {
                try {
                    connections[id].close();
                } catch (e) {
                    console.log(e);
                }
                delete connections[id];
            }

            setVideos((videos) => videos.filter((video) => video.socketId !== id))
        })

        socketRef.current.on('participants-update', (participantMap) => {
            setParticipants(
                Object.entries(participantMap || {}).map(([socketId, participantName]) => ({
                    socketId,
                    name: participantName
                }))
            );
        })

        socketRef.current.on('user-joined', (id, clients, participantMap) => {
            setParticipants(
                Object.entries(participantMap || {}).map(([socketId, participantName]) => ({
                    socketId,
                    name: participantName
                }))
            );

            clients.forEach((socketListId) => {

                connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                // Wait for their ice candidate       
                connections[socketListId].onicecandidate = function (event) {
                    if (event.candidate != null) {
                        socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                    }
                }

                // Wait for their video stream
                connections[socketListId].onaddstream = (event) => {
                    console.log("BEFORE:", videoRef.current);
                    console.log("FINDING ID: ", socketListId);

                    let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                    if (videoExists) {
                        console.log("FOUND EXISTING");

                        // Update the stream of the existing video
                        setVideos(videos => {
                            const updatedVideos = videos.map(video =>
                                video.socketId === socketListId ? { ...video, stream: event.stream } : video
                            );
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        });
                    } else {
                        // Create a new video
                        console.log("CREATING NEW");
                        let newVideo = {
                            socketId: socketListId,
                            stream: event.stream,
                            autoplay: true,
                            playsinline: true
                        };

                        setVideos(videos => {
                            const updatedVideos = [...videos, newVideo];
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        });
                    }
                };


                // Add the local video stream
                if (window.localStream !== undefined && window.localStream !== null) {
                    connections[socketListId].addStream(window.localStream)
                } else {
                    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                    window.localStream = blackSilence()
                    connections[socketListId].addStream(window.localStream)
                }
            })

            if (id === socketIdRef.current) {
                for (let id2 in connections) {
                    if (id2 === socketIdRef.current) continue

                    try {
                        connections[id2].addStream(window.localStream)
                    } catch (e) { }

                    connections[id2].createOffer().then((description) => {
                        connections[id2].setLocalDescription(description)
                            .then(() => {
                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                            })
                            .catch(e => console.log(e))
                    })
                }
            }
        })

        socketRef.current.on('connect', () => {
            socketIdRef.current = socketRef.current.id
            socketRef.current.emit('join-call', {
                path: window.location.href,
                username
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        if (!videoAvailable) {
            return;
        }
        setVideo((currentVideo) => !currentVideo);
    }
    let handleAudio = () => {
        if (!audioAvailable) {
            return;
        }
        setAudio((currentAudio) => !currentAudio)
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])

    useEffect(() => {
        if (showModal) {
            setNewMessages(0);
        }
    }, [showModal, messages])

    let handleScreen = () => {
        if (screen && window.localStream) {
            try {
                window.localStream.getTracks().forEach((track) => {
                    if (track.kind === "video") {
                        track.onended = null;
                        track.stop();
                    }
                });
            } catch (e) {
                console.log(e);
            }

            setScreen(false);
            getUserMedia();
            return;
        }

        setScreen(!screen);
    }

    let handleEndCall = () => {
        cleanupConnections();
        window.location.href = "/home"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current && !showModal) {
            setNewMessages((prevNewMessages) => (prevNewMessages || 0) + 1);
        }
    };



    let sendMessage = () => {
        if (!socketRef.current) {
            return;
        }

        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }


    let connect = () => {
        if (!username.trim()) {
            setUsernameError("Username is required to join the meeting.");
            return;
        }

        setUsernameError("");
        setAskForUsername(false);
        getMedia();
    }


    return (
        <div>

            {askForUsername === true ?

                <div className={styles.lobby}>
                    <div className={styles.pageNavbar}>
                        <AppNavbar
                            actions={[
                                { label: "Home", to: "/" },
                                { label: "Guest", to: "/guest", auth: "logged_out" }
                            ]}
                        />
                    </div>
                    <div className={styles.lobbyPanel}>
                        <div className={styles.lobbyContent}>
                            <p className={styles.lobbyEyebrow}>Meeting lobby</p>
                            <h1>Check your setup before joining.</h1>
                            <p className={styles.lobbyText}>
                                Pick a display name, confirm your camera preview, and enter the room when you are ready.
                            </p>

                            <div className={styles.lobbyMeta}>
                                <div className={styles.lobbyMetaCard}>
                                    <span>Room</span>
                                    <strong>{window.location.pathname.replace("/", "") || "EasyMeet"}</strong>
                                </div>
                                <div className={styles.lobbyMetaCard}>
                                    <span>Status</span>
                                    <strong>{videoAvailable || audioAvailable ? "Devices ready" : "Check permissions"}</strong>
                                </div>
                            </div>

                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Username"
                                value={username}
                                onChange={e => {
                                    setUsername(e.target.value);
                                    if (e.target.value.trim()) {
                                        setUsernameError("");
                                    }
                                }}
                                variant="outlined"
                                error={Boolean(usernameError)}
                                helperText={usernameError}
                            />

                            <div className={styles.lobbyDeviceControls}>
                                <button
                                    className={video ? styles.deviceButtonActive : styles.deviceButtonMuted}
                                    onClick={handleVideo}
                                    type="button"
                                    disabled={!videoAvailable}
                                >
                                    {video ? <VideocamTwoToneIcon /> : <VideocamOffTwoToneIcon />}
                                    {video ? "Camera on" : "Camera off"}
                                </button>

                                <button
                                    className={audio ? styles.deviceButtonActive : styles.deviceButtonMuted}
                                    onClick={handleAudio}
                                    type="button"
                                    disabled={!audioAvailable}
                                >
                                    {audio ? <MicTwoToneIcon /> : <MicOffTwoToneIcon />}
                                    {audio ? "Mic on" : "Mic off"}
                                </button>
                            </div>

                            <Button variant="contained" onClick={connect} className={styles.lobbyJoinButton}>
                                Join Meeting
                            </Button>
                        </div>

                        <div className={styles.lobbyPreviewCard}>
                            <div className={styles.lobbyPreviewHeader}>
                                <div>
                                    <p>Your preview</p>
                                    <span>Camera and mic check</span>
                                </div>
                                <div className={styles.lobbyStatusDots}>
                                    <span className={videoAvailable ? styles.statusDotActive : styles.statusDotMuted}></span>
                                    <span className={audioAvailable ? styles.statusDotActive : styles.statusDotMuted}></span>
                                </div>
                            </div>

                            <video ref={setLocalVideoRef} autoPlay muted></video>
                        </div>
                    </div>
                </div> :


                <div
                    className={styles.meetVideoContainer}
                >
                    <div className={styles.pageNavbar}>
                        <AppNavbar
                            actions={[
                                {
                                    label: `Members: ${participants.length}`,
                                    onClick: () => setShowMembers((current) => !current),
                                    popoverContent: showMembers ? (
                                        <div className={styles.membersPopover}>
                                            <div className={styles.membersPopoverHeader}>
                                                <h3>Members</h3>
                                                <span>{participants.length}</span>
                                            </div>
                                            <div className={styles.membersPopoverList}>
                                                {participants.length ? participants.map((participant) => (
                                                    <div className={styles.membersPopoverItem} key={participant.socketId}>
                                                        <span className={styles.membersPopoverInitial}>
                                                            {(participant.name || "G").charAt(0).toUpperCase()}
                                                        </span>
                                                        <div>
                                                            <strong>{participant.name}</strong>
                                                            <small>{participant.socketId === socketIdRef.current ? "You" : "Joined"}</small>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <p className={styles.membersPopoverEmpty}>No members available.</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : null
                                },
                                { label: "Home", to: "/home" },
                                {
                                    label: "Leave",
                                    primary: true,
                                    onClick: handleEndCall
                                }
                            ]}
                            dark
                        />
                    </div>
                    <div className={`${styles.meetBody} ${showModal ? styles.meetBodyWithChat : styles.meetBodyFull}`}>
                        <div className={styles.meetMainStage}>
                            <div className={styles.conferenceView}>
                                {videos.length ? videos.map((video) => (
                                    <div className={styles.remoteVideoCard} key={video.socketId}>
                                        <video

                                            data-socket={video.socketId}
                                            ref={ref => {
                                                if (ref && video.stream) {
                                                    ref.srcObject = video.stream;
                                                }
                                            }}
                                            autoPlay
                                        >
                                        </video>
                                    </div>

                                )) : (
                                    <div className={styles.emptyStage}>
                                        <h3>Waiting for others to join</h3>
                                        <p>Share the meeting code to bring others into this room.</p>
                                    </div>
                                )}
                            </div>

                            {video ? (
                                <video className={styles.meetUserVideo} ref={setLocalVideoRef} autoPlay muted></video>
                            ) : (
                                <div className={styles.meetUserPlaceholder}>
                                    <div className={styles.meetUserAvatar}>
                                        {(username || "G").charAt(0).toUpperCase()}
                                    </div>
                                    <p>{username || "Guest"}</p>
                                    <span>Camera is off</span>
                                </div>
                            )}

                        </div>

                        {showModal ? <div className={styles.chatRoom}>

                            <div className={styles.chatContainer}>
                                <div className={styles.chatHeader}>
                                    <h1>Chat</h1>
                                </div>

                                <div className={styles.chattingDisplay}>

                                    {messages.length !== 0 ? messages.map((item, index) => {

                                        return (
                                            <div className={styles.chatMessage} key={index}>
                                                <p className={styles.chatSender}>{item.sender}</p>
                                                <p className={styles.chatText}>{item.data}</p>
                                            </div>
                                        )
                                    }) : <p className={styles.emptyChat}>No messages yet</p>}

                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField
                                        fullWidth
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        id="outlined-basic"
                                        label="Enter your chat"
                                        variant="outlined"
                                    />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div> : <></>}
                    </div>

                    <div className={styles.buttonContainers}>

                        <IconButton onClick={handleAudio} className={styles.meetControlButton}>
                            {audio === true ? <MicTwoToneIcon className={styles.controlOn} /> : <MicOffTwoToneIcon className={styles.controlOff} />}
                        </IconButton>

                        <IconButton onClick={handleVideo} className={styles.meetControlButton}>
                            {(video === true) ? <VideocamTwoToneIcon className={styles.controlOn} /> : <VideocamOffTwoToneIcon className={styles.controlOff} />}
                        </IconButton>

                        <IconButton onClick={handleEndCall} className={styles.meetControlButton}>
                            <CallEndTwoToneIcon />
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton onClick={handleScreen} className={styles.meetControlButton}>
                                {screen === true ? <ScreenShareTwoToneIcon className={styles.controlOn} /> : <StopScreenShareTwoToneIcon className={styles.controlOff} />}
                            </IconButton> : <></>}

                        <Badge badgeContent={newMessages} max={999} color="error">
                            <IconButton onClick={() => setModal(!showModal)} className={styles.meetControlButton}>
                                <MessageTwoToneIcon />                        
                            </IconButton>
                        </Badge>

                    </div>

                </div>

            }

        </div>
    )
}
