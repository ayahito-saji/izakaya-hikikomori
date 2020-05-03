import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Skyway from './components/Skyway'
import { BrowserRouter as Router, Route } from "react-router-dom";
import * as serviceWorker from './serviceWorker';
import Matching from "./components/Matching";

ReactDOM.render(
  <React.StrictMode>
    <Router>
        <Route exact path="/" component={App}/>
        <Route exact path="/waiting" component={Matching}/>
        <Route exact path="/seat" component={Skyway}/>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
