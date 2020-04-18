import React, {useState} from 'react';
import styled from 'styled-components';
import {SkywayConfig} from './config'
import {db} from '../firebase/index'
import Peer from 'skyway-js';
const peer = new Peer(SkywayConfig);

function Skyway() {
    const [calling, setCalling] = useState(0)

    let localStream = null;
    let existingCall = null;

    navigator.mediaDevices.getUserMedia({video: true, audio: true})
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
        const call = peer.call(document.getElementById('callto-id').value, localStream);
        setupCallEventHandlers(call);
        return e.preventDefault()
    };

    function Click(e){
        existingCall.close();
        return e.preventDefault()
    };

    peer.on('call', function(call){
        call.answer(localStream);
        setupCallEventHandlers(call);
    });

    function setupCallEventHandlers(call){
        if (existingCall) {
            existingCall.close();
        };

        existingCall = call;

        call.on('stream', function(stream){
            addVideo(call,stream);
            setupEndCallUI();
            document.getElementById('their-video').innerText = call.remoteId;
        });

        call.on('close', function(){
            removeVideo(call.remoteId);
            setupMakeCallUI();
        });
    }

    function addVideo(call,stream){
        document.getElementById('their-video').srcObject = stream;
    }

    function removeVideo(peerId){
        document.getElementById('their-video').srcObject = undefined;
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
                        <input type="text" placeholder="Call user id..." id="callto-id"/>
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
                        <p>Currently in call with <span id="their-id">...</span></p>
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
            <Float id="video-container">
                <Video id="their-video" autoPlay/>
                <Video id="my-video" muted="{true}" autoPlay/>
            </Float>
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
