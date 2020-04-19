import React, {useEffect, useState} from 'react';
import events from "events"
import styled from 'styled-components';
import {SkywayConfig} from './config'
import $ from 'jquery'
import Peer from 'skyway-js';
import useReactRouter from 'use-react-router';
import RoomManager from "./RoomManager";
const peer = new Peer(SkywayConfig);
events.EventEmitter.defaultMaxListeners = 20

let localStream = null;
let existingCall = null;


function Skyway() {
    var roomId

    const { history } = useReactRouter();
    const [calling, setCalling] = useState(null)
    const [room, setRoom] = useState("")

    let constraints = {
        video: {},
        audio: true
    };
    constraints.video.width = {
        min: 320,
        max: 320
    };
    constraints.video.height = {
        min: 240,
        max: 240
    };

    useEffect( ()=> {
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                // Success
                localStream = stream;

                setRoom(RoomManager.getRoomId())
                roomId = RoomManager.getRoomId()
                console.log(roomId)
                if(roomId) {
                    SubmitCall()
                }
            }).catch(function (error) {
                // Error
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
        });
    }
    ,[setRoom])

    peer.on('open', function(){
        if(RoomManager.getRoomId()){
            SubmitCall();
        }
    });

    peer.on('error', function(err){
        alert(err.message);
    });

    peer.on('close', function(){
    });

    peer.on('disconnected', function(){
    });

    function SubmitCall(){
        if(room || roomId) {
            let roomName = room
            if (!roomName) {
                roomName = roomId
                if (!roomName) {
                    return;
                }
            }

            const call = peer.joinRoom(roomName, {mode: 'mesh', stream: localStream});
            setupCallEventHandlers(call);
        }
    };


    function setupCallEventHandlers(call){
        if (existingCall) {
            existingCall.close();
        };

        existingCall = call;
        setupMakeCallUI();

        call.on('stream', function(stream){
            addVideo(stream);
        });

        call.on('peerLeave', function(peerId){
            removeVideo();
        });

        call.on('close', function(){
            removeVideo();
        });
    }

    function addVideo(stream){
        const videoDom = $('<video autoplay playsinline>');
        videoDom.attr('id',stream.peerId);
        videoDom.get(0).srcObject = stream;
        $('.videosContainer').append(videoDom);
    }

    function removeVideo(){
        $('.videosContainer').empty();
    }

    function setupMakeCallUI(){
        setCalling(1);
    }

    function doSomething(e) {
        setRoom(e.target.value)
        RoomManager.setRoomId(e.target.value)
    }

    function callForm() {
        if(!calling){
            return(
                <>
                    <h3>Join Room!</h3>
                    <form id="make-call" className="pure-form">
                        <input
                            type="text"
                            placeholder="Call user id..."
                            id="join-room"
                            value={room}
                            onChange={ e =>
                                doSomething(e)
                            }
                        />
                        <button
                            href="#"
                            className="pure-button pure-button-success"
                            type="submit"
                            onClick={SubmitCall}
                        >
                            Call
                        </button>
                    </form>
                </>
            )
        }
    }

    function disconnectForm() {
        if(calling){
            return(
                <>
                    <form id="end-call" className="pure-form">
                        <p>Currently in call with <span id="room-id">...</span></p>
                        <button
                            href="#"
                            className="pure-button pure-button-success"
                            type="submit"
                            onClick={() =>　{existingCall.close();existingCall = null;history.push('/')}}
                        >
                            End Call
                        </button>
                    </form>
                </>
            )
        }
    }

    return (
        <div className="App">
            <div className="pure-u-1-3">
                <h2>SkyWay Video Chat</h2>
                <p>Room id: {room}</p>
                {callForm()}
                {disconnectForm()}
            </div>
            <div id="js-videos-container" className="videos-container">
                <Video id="my-video" muted="{true}" autoPlay playsinline/>
                <div id="js-videos-container" className="videosContainer">
                </div>
            </div>
        </div>
    );
}


const Video = styled.video`
  width: 40%;
`

export default Skyway;
