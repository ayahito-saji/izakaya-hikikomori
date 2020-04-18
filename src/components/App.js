import React, {useEffect, useState} from 'react';
import firebase from "firebase";
import useReactRouter from 'use-react-router';

function App() {
  const { history } = useReactRouter();
  const [firebaseId, setFirebaseId] = useState("")

  var firebaseMyId

  useEffect( ()=> {
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
      ,[setFirebaseId])

  function sentData(){
    history.push({pathname:"/waiting", state:{firebaseId:firebaseMyId}})
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/background2.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      overflow: 'auto'
    }}>
      <div style={{
        paddingTop: '100px',
        paddingBottom: '100px',
        width: '640px',
        maxWidth: '90%',
        marginLeft: 'auto',
        marginRight: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          color: '#ffffff',
          marginTop: '150px'
        }}>
          <div style={{fontSize: '16pt'}}>
            居酒屋
          </div>
          <div style={{fontSize: '32pt'}}>
            ひきこもり
          </div>
        </div>
        <button
            onClick={sentData}
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
          飲み会を始める
        </button>
        <hr color='#ffffff' style={{
          width: '100%',
          marginTop: '100px'
        }} />
        <h1 style={{
          color: '#ffffff',
          marginTop: '100px'
        }}>
          いつでもどこでも，オンライン飲み会
        </h1>
        <p style={{
          color: '#ffffff',
          marginTop: '50px',
          width: '100%'
        }}>
          ここに説明文ああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああああ
        </p>
      </div>
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'rgba(255, 255, 255)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      </div>
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100vw',
        height: '100px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'rgba(255, 255, 255)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      </div>
    </div>
  );
}

export default App;
