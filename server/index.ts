import http from 'http'
import express from 'express'
import cors from 'cors'
import { Server } from 'colyseus'
import { Poker } from './rooms/poker'

const app = express()
const port = Number(process.env.PORT || 3553)

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const gameServer = new Server({
  server: server,
  express: app,
})

gameServer.define('poker', Poker)
gameServer.listen(port)

app.use(express.static(__dirname + '/../public'))
console.log(`Listening on ws://localhost:${port}`)
