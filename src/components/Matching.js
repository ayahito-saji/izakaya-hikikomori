import React, {useEffect, useState} from 'react';
import firebase from 'firebase'
import events from "events"
import {db} from '../firebase/index'
import RoomManager from "./RoomManager";
import useReactRouter from 'use-react-router';
import {Link} from "react-router-dom";
events.EventEmitter.defaultMaxListeners = 20

function Matching() {
    const { history } = useReactRouter();
    const [message, setMessage] = useState("マッチング相手を探しています")
    const [canConnect, setCanConnect] = useState(0)

    var firebaseMyId
    var calling = false


    useEffect( ()=> {

        const fn = async () => {
            var user = firebase.auth().currentUser;

            if (user) {
                // User is signed in.
                firebaseMyId = user.uid
            } else {
                // No user is signed in.
                await firebase.auth().signInAnonymously().catch(function(error) {
                });

                await firebase.auth().onAuthStateChanged(function(user) {
                    if (user) {
                        firebaseMyId = user.uid
                    }
                });
            }

            var today = firebase.firestore.Timestamp.fromDate(new Date())
            var myId = ""

            await db.collection("matching").get()
                .then( async docs => {
                    docs.forEach(doc => {

                        if(doc.data().browserId === firebaseMyId){
                            myId = doc.id
                        }

                        var ready = doc.data().ready.seconds
                        var isCalling = doc.data().isCalling
                        var members = doc.data().members

                        if(ready < today.seconds + 15 && today.seconds <= ready && !calling && !isCalling && doc.data().browserId !== firebaseMyId ){
                            calling = true
                            RoomManager.setRoomId(doc.data().roomId)

                            var data = {
                                isCalling: true,
                                members: 2,
                            }
                            var myData = {
                                isCalling: true,
                                browserId: firebaseMyId,
                                members: 2,
                                ready: doc.data().ready,
                                roomId: doc.data().roomId,
                            }

                            db.collection("matching").doc(doc.id).update(data)
                                .then(function() {
                                    db.collection("matching").add(myData).then(
                                        history.push("/seat")
                                    )
                                })
                                .catch(function(error) {
                                    // The document probably doesn't exist.
                                    console.error("Error updating document: ", error);
                                });

                        }else if(!calling && isCalling && members < 3　&& doc.data().browserId !== firebaseMyId){
                            calling = true
                            RoomManager.setRoomId(doc.data().roomId)

                            data = {
                                members: 3,
                            }

                            myData = {
                                isCalling: true,
                                browserId: firebaseMyId,
                                members: 3,
                                ready: doc.data().ready,
                                roomId: doc.data().roomId,
                            }

                            db.collection("matching").where("roomId", "==", doc.data().roomId).get().then(
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
                                }
                            )

                            db.collection("matching").add(myData)
                                .then(function() {
                                    console.log("Document successfully updated!");
                                    history.push("/seat")
                                })
                                .catch(function(error) {
                                    // The document probably doesn't exist.
                                    console.error("Error updating document: ", error);
                                });
                        }
                    })

                    if(!calling){

                        const crypto = require('crypto')
                        const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
                        const N=16
                        var roomHash = Array.from(crypto.randomFillSync(new Uint8Array(N))).map((n)=>S[n%S.length]).join('')

                        RoomManager.setRoomId(roomHash)

                        var dt = new Date()
                        dt.setSeconds(dt.getSeconds() + 15);

                        var data = {
                            isCalling: false,
                            browserId: firebaseMyId,
                            members: 1,
                            ready: dt,
                            roomId: roomHash,
                        }

                        if(myId){

                            await db.collection("matching").doc(myId).update(data)
                                .then(ref => {
                                })

                            var unsubscribe = await db.collection("matching").doc(myId)
                                .onSnapshot(function(doc) {
                                    if(doc.data().isCalling && doc.data().members !== 1){
                                        unsubscribe();
                                        history.push("/seat")
                                    }
                                });

                            setTimeout(function () {
                                unsubscribe();
                                setMessage("相手が見つかりませんでした")
                                setCanConnect(1)
                            }, 17000);

                        }else{

                            db.collection("matching").add(data)
                                .then(ref => {
                                    var unsubscribe = db.collection("matching").doc(ref.id)
                                        .onSnapshot(function(doc) {
                                            if(doc.data().isCalling){
                                                unsubscribe();
                                                history.push("/seat")
                                            }
                                        });

                                    setTimeout(function () {
                                        unsubscribe();
                                        setMessage("相手が見つかりませんでした")
                                        setCanConnect(1)
                                    }, 17000);

                                })
                        }

                    }
                })
        }

        fn()
        }
        ,[setCanConnect])

    function button(){
        if(canConnect){
            return(
                <Link
                    to="/waiting"
                    style={{
                        marginTop: '100px',
                        color: '#ffffff',
                        border: 'none',
                        padding: '24px',
                        borderRadius: '48px',
                        fontSize: '16px',
                        textDecoration: 'none',
                        background: 'rgba(0, 0, 0, 0.7)'
                    }}>
                    入り口へ戻る
                </Link>
            )
        }
        return(
            <>
            </>
        )
    }

    return (
        <div className="App">
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: 'center',
                justifyContent: 'center',
                height: "100vh",
                width: "100vw",
                color: "#ffffff",
                backgroundImage: 'url(/background2.jpg)',
                backgroundSize: 'cover'
            }}>
                <p>{message}</p>
                {button()}
            </div>
        </div>
    );
}

export default Matching;
