import React, {useState} from 'react';
import styled from 'styled-components';
import {SkywayConfig} from './config'
import $ from 'jquery'
import Peer from 'skyway-js';
const peer = new Peer(SkywayConfig);

let localStream = null;
let existingCall = null;

function Skyway() {
    const [calling, setCalling] = useState(null)

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

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function (stream) {
            // Success
            document.getElementById('my-video').srcObject = stream;
            localStream = stream;
        }).catch(function (error) {
        // Error
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
    });

    peer.on('open', function(){
        document.getElementById('my-id').innerText = peer.id;
    });

    peer.on('error', function(err){
        alert(err.message);
    });

    peer.on('close', function(){
    });

    peer.on('disconnected', function(){
    });

    function SubmitCall(e){
        e.preventDefault()
        let roomName = "a"
            //document.getElementById('join-room').val();
        if (!roomName) {
            return;
        }

        const call = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream});
        setupCallEventHandlers(call);
    };

    function Click(e){
        e.preventDefault()
        existingCall.close();
    };

    function setupCallEventHandlers(call){
        if (existingCall) {
            existingCall.close();
        };

        existingCall = call;
        console.log("UI消す")
        setupMakeCallUI();
        console.log("UI消えた")
        //document.getElementById('#join-room').text(call.name);

        call.on('stream', function(stream){
            addVideo(stream);
        });

        call.on('peerLeave', function(peerId){
            removeVideo(peerId);
        });

        call.on('close', function(){
            removeVideo();
            setupMakeCallUI();
        });
    }

    function addVideo(stream){
        const videoDom = $('<video autoplay>');
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

    function setupEndCallUI() {
        setCalling(0);
    }

    function callForm() {
        if(!calling){
            return(
                <>
                    <h3>Make a call</h3>
                    <form id="make-call" className="pure-form">
                        <input type="text" placeholder="Call user id..." id="join-room"/>
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
                            onClick={Click
                            }>
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

                <p>Your id: <span id="my-id">...</span></p>
                <p>Share this id with others so they can call you.</p>
                {callForm()}
                {disconnectForm()}
            </div>
            <div id="js-videos-container" className="videosContainer">
                <Video id="my-video" muted="{true}" autoPlay/>
            </div>
        </div>
    );
}

const Float = styled.div`
  display: inline-block;
`

const Video = styled.video`
  width: 40%;
`

export default Skyway;
