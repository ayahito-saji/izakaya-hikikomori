import React, {useEffect, useState} from 'react';
import firebase from "firebase";
import {Link} from "react-router-dom";

function App() {
  const [canConnect, setCanConnect] = useState(0)


    useEffect( ()=> {
        firebase.auth().signInAnonymously().catch(function(error) {
        });

        var today = new Date()
        if(today.getHours() < 23 && today.getHours()>= 19 ){
          setCanConnect(1)
        }

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
            飲み会を始める
          </Link>
      )
    }
    return(
        <p
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
          開店をお待ちください
        </p>
    )
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
        {button()}
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
          <div style={{
              color: '#ffffff',
              marginTop: '50px',
              width: '100%',
              textAlign:'center'
          }}>
              <p>iOS端末ではSafariブラウザのみ対応しています。</p>
              <p>※このサイトで発生した如何なる問題についても対処しかねます</p>
              <p>《繋がりにくい場合》</p>
              <p>クッキーと履歴を消してリロードすると改善する場合があります</p>
          </div>
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
