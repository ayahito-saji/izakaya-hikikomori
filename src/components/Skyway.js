import React, {useEffect, useState} from 'react';
import events from "events"
import styled from 'styled-components';
import {SkywayConfig} from './config'
import $ from 'jquery'
import Peer from 'skyway-js';
import useReactRouter from 'use-react-router';
import RoomManager from "./RoomManager";
import {db} from "../firebase";
import firebase from 'firebase'
const peer = new Peer(SkywayConfig);
events.EventEmitter.defaultMaxListeners = 20

let localStream = null;
let existingCall = null;
var roomId, firebaseMyId, docId

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

function addVideo(stream){
    const videoDom = $('<video autoplay playsinline>');
    videoDom.attr('id',stream.peerId);
    videoDom.get(0).srcObject = stream;
    $('.videosContainer').append(videoDom);
}

function removeVideo(peerId){
    $('#'+peerId).remove();
}

function removeAllVideo(){
    $('.videosContainer').empty();
}

function Skyway() {
    const { history } = useReactRouter();
    const [calling, setCalling] = useState(null)
    const [room, setRoom] = useState("")

    useEffect( ()=> {

        const fn = async () => {
                var user = firebase.auth().currentUser;

                if (user) {
                    // User is signed in.
                    firebaseMyId = user.uid
                    console.log(user.uid)
                } else {
                    // No user is signed in.
                    await firebase.auth().signInAnonymously().catch(function(error) {
                    });

                    await firebase.auth().onAuthStateChanged(function(user) {
                        if (user) {
                            firebaseMyId = user.uid
                            console.log(user.uid)
                        } else {
                        }
                    });
                }

                await db.collection("matching").where("browserId","==", firebaseMyId).get()
                    .then(function(docs) {
                        docs.forEach(function (doc) {
                            setRoom(doc.data().roomId)
                            roomId = doc.data().roomId
                            docId = doc.id
                        })
                    })
                    .catch(function(error) {
                        // The document probably doesn't exist.
                        console.error("Error updating document: ", error);
                    });

                navigator.mediaDevices.getUserMedia(constraints)
                    .then(function (stream) {
                        // Success
                        localStream = stream;
                        if (!roomId){
                            setRoom(RoomManager.getRoomId())
                            roomId = RoomManager.getRoomId()
                        }
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

        fn()
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
        existingCall.close();
    });

    peer.on('disconnected', function(){
        existingCall.close();
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
            removeVideo(peerId);
        });

        call.on('close', function(){
            removeAllVideo();
        });
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
                            onClick={async (e) =>　{
                                e.preventDefault()
                                existingCall.close();
                                existingCall = null;
                                localStream.getTracks().forEach(track => track.stop());

                                console.log(docId)

                                var members = 0

                                await db.collection("matching").doc(docId).get().then(function(doc) {
                                    members = doc.data().members

                                }).catch(function(error) {
                                    console.error("Error removing document: ", error);
                                });

                                var data = {
                                    members: members-1,
                                }

                                await db.collection("matching").where("roomId", "==", roomId).get().then(
                                    function (docs) {
                                        docs.forEach(function (doc) {
                                            db.collection("matching").doc(doc.id).update(data)
                                                .then(function() {
                                                    console.log("Document successfully updated!");
                                                })
                                                .catch(function(error) {
                                                    // The document probably doesn't exist.
                                                    console.error("Error updating document: ", error);
                                                });
                                        })
                                    })

                                await db.collection("matching").doc(docId).delete().then(function() {
                                    console.log("Document successfully deleted!");
                                }).catch(function(error) {
                                    console.error("Error removing document: ", error);
                                });
                                history.push('/')
                            }}
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
                <div id="js-videos-container" className="videosContainer"/>
            </div>
        </div>
    );
}

const Video = styled.video`
  width: 40%;
`

export default Skyway;
