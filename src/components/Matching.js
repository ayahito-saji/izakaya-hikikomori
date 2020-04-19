import React, {useEffect, useState} from 'react';
import firebase from 'firebase'
import {db} from '../firebase/index'
import RoomManager from "./RoomManager";
import useReactRouter from 'use-react-router';

function Matching() {
    const { history } = useReactRouter();
    const [firebaseId, setFirebaseId] = useState("")

    var firebaseMyId
    var calling = false

    useEffect( ()=> {

            var user = firebase.auth().currentUser;

            if (user) {
                // User is signed in.
                firebaseMyId = user.uid
                setFirebaseId(user.uid)
                console.log(user.uid)
            } else {
                // No user is signed in.
                firebase.auth().signInAnonymously().catch(function(error) {
                });

                firebase.auth().onAuthStateChanged(function(user) {
                    if (user) {
                        firebaseMyId = user.uid
                        setFirebaseId(user.uid)
                        console.log(user.uid)
                    } else {
                    }
                });
            }

            var today = firebase.firestore.Timestamp.fromDate(new Date())

            db.collection("matching").get()
                .then( docs => {
                    docs.forEach(doc => {

                        var ready = doc.data().ready.seconds
                        var isCalling = doc.data().isCalling

                        if(ready < today.seconds + 15 && today.seconds <= ready　 && !calling && !isCalling){
                            console.log(doc.data())
                            calling = true
                            RoomManager.setRoomId(doc.data().roomId)

                            var data = {
                                isCalling: true,
                                members: doc.data().members.push(firebaseMyId),
                            }

                            db.collection("matching").doc(doc.id).update(data)
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

                        console.log(roomHash)

                        RoomManager.setRoomId(roomHash)

                        var dt = new Date()
                        dt.setSeconds(dt.getSeconds() + 15);

                        var data = {
                            isCalling: false,
                            browserId: firebaseMyId,
                            members: [firebaseMyId],
                            ready: dt,
                            roomId: roomHash,
                        }

                        console.log(data)

                        db.collection("matching").add(data)
                            .then(ref => {
                                db.collection("matching").doc(ref.id)
                                    .onSnapshot(function(doc) {
                                        if(doc.data().isCalling){
                                            console.log("Current data: ", doc.data());
                                        }
                                    });
                            })

                    }
                })
        }
        ,[setFirebaseId])

    return (
        <div className="App">
            <div className="pure-u-1-3">
                <h2>Now Matching</h2>
                <p>FirebaseID: {firebaseId}</p>
            </div>
        </div>
    );
}

export default Matching;
