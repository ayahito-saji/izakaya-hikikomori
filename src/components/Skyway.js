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

    let width = 0, height = 0
    const screenWidth = window.innerWidth, screenHeight = window.innerHeight

    if (screenWidth >= screenHeight) {
      if (screenWidth < 480) width = screenWidth
      else width = screenWidth / 2
      height = width * 0.75
    } else {
      width = screenWidth
      height = width * 0.75
    }

    const videoDom = $('<video autoplay playsinline width="'+width+'px" height="'+height+'px" style="border-radius: 4px;display: block;">');
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

    function disconnectForm() {
        if(calling){
            return(
                <>
                    <a
                        href="#"
                        style={{
                          color: '#ffffff',
                          border: 'none',
                          padding: '24px',
                          borderRadius: '48px',
                          fontSize: '16px',
                          textDecoration: 'none',
                          background: 'rgba(0, 0, 0, 0.7)'
                        }}
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
                        飲み会から退出する
                    </a>
                </>
            )
        }
    }

    return (
        <div className="App" style={{
          display: "flex",
          height: "100vh",
          width: "100vw",
          flexDirection: "column",
          backgroundImage: 'url(/background_room.jpg)',
          backgroundSize: 'cover'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
          }}>
            <div id="js-videos-container" className="videosContainer" style={{ padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap'}}/>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 0,
            padding: '32px 0'
          }}>
            {disconnectForm()}
          </div>
        </div>
    );
}

const Video = styled.video`
  width: 40%;
`

export default Skyway;
