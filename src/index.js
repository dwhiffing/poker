import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import { Client } from 'colyseus.js'

window.colyseus = new Client('ws://localhost:3553')

ReactDOM.render(<App />, document.getElementById('root'))
