import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Client } from 'colyseus.js'

window.colyseus = new Client(
  process.env.NODE_ENV === 'production'
    ? 'wss://web-production-3e56.up.railway.app/'
    : 'ws://localhost:3553',
)

ReactDOM.render(<App />, document.getElementById('root'))
