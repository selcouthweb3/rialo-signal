import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

/*
  ReactDOM.createRoot finds the <div id="root"> in index.html
  and tells React: "take control of this div."
  
  React.StrictMode is a development helper that runs
  your components twice to catch bugs early.
  It has zero effect in production.
*/
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
