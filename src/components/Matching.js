import React, {useEffect, useState} from 'react';
import firebase from 'firebase'
import {SkywayConfig} from './config'
import {db} from '../firebase/index'
import Peer from 'skyway-js';
const peer = new Peer(SkywayConfig);


function Matching() {
    const [skywayId, setSkywayId] = useState(null)
    const [firebaseId, setFirebaseId] = useState(null)


    useEffect( ()=> {
            var firebaseId, skywayId
            var calling = false

            peer.on('open', function(){
                skywayId = peer.id
                setSkywayId(peer.id);
            });

            firebase.auth().signInAnonymously().catch(function(error) {
            });

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    firebaseId = user.uid
                    setFirebaseId(user.uid)
                    console.log(user.uid)
                } else {
                }
            });

            var today = firebase.firestore.Timestamp.fromDate(new Date())

            db.collection("matching").get()
                .then( docs => {
                    docs.forEach(doc => {

                        var ready = doc.data().ready.seconds
                        var isCalling = doc.data().isCalling

                        if(ready < today.seconds + 10 && today.seconds <= ready　 && !calling && !isCalling){
                            console.log(doc.data())
                            calling = true
                        }
                    })

                    if(!calling){
                        var data = {
                            isCalling: false,
                            browserId: firebaseId,
                            members: [],
                            ready: new Date(),
                            skywayId: skywayId
                        }

                        db.collection("matching").add(data)
                            .then(ref => {
                                console.log(ref.id)
                            })
                    }
                })
        }
        ,[setSkywayId])


    peer.on('error', function(err){
        alert(err.message);
    });

    peer.on('close', function(){
    });

    peer.on('disconnected', function(){
    });

    return (
        <div className="App">
            <div className="pure-u-1-3">
                <h2>Now Matching</h2>
                <p>Your id:{skywayId}</p>
                <p>Firebase id:{firebaseId}</p>
            </div>
        </div>
    );
}

export default Matching;
