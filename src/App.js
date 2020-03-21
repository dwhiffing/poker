import React, { useState, useEffect, useRef } from 'react'
import './index.css'
import './card.css'
import { Room } from './components/Room'
import { Card } from './components/Card'
import { Box, Typography, Button } from '@material-ui/core'

function App() {
  const intervalRef = useRef()
  const [availableRooms, setAvailableRooms] = useState([])
  const [room, setRoom] = useState()
  const [state, setState] = useState({
    players: [],
    cards: [],
  })

  const getAvailableRooms = async () => {
    const rooms = await window.colyseus.getAvailableRooms()
    setAvailableRooms(rooms)
  }

  const createRoom = async () => {
    const room = await window.colyseus.create('poker')
    localStorage.setItem(room.id, room.sessionId)
    setRoom(room)
  }

  const joinRoom = async roomId => {
    let sessionId = localStorage.getItem(roomId)

    let room
    console.log(roomId, sessionId)
    if (sessionId) {
      try {
        console.log('trying reconnect')
        room = await window.colyseus.reconnect(roomId, sessionId)
      } catch (e) {
        console.log('reconnect failed')
        localStorage.removeItem(roomId)
      }
    }

    if (!room) {
      room = await window.colyseus.joinById(roomId)
      console.log('joined', room.sessionId)
      localStorage.setItem(room.id, room.sessionId)
    }

    setRoom(room)
  }

  useEffect(() => {
    if (!room) return
    clearInterval(intervalRef.current)

    room.onLeave(() => {
      setRoom(null)
    })

    room.state.onChange = changes => {
      changes.forEach(change => {
        if (change.field === 'cards') {
          setState(state => ({
            ...state,
            cards: Object.values(change.value.toJSON()),
          }))
        } else if (change.field === 'currentTurn') {
          setState(state => ({
            ...state,
            currentTurn: change.value,
          }))
        } else if (change.field === 'players') {
          setState(state => ({
            ...state,
            players: Object.values(change.value.toJSON()).map(p => ({
              ...p,
              cards:
                p.id === room.sessionId
                  ? Object.values(p.cards)
                  : Object.values(p.cards).map(c => ({})),
            })),
          }))
        }
      })
    }
  }, [room])

  useEffect(() => {
    getAvailableRooms()
    intervalRef.current = setInterval(getAvailableRooms, 3000)
  }, [])

  if (!room) {
    return (
      <Box
        height="100vh"
        flexDirection="column"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="h5">Available Tables:</Typography>

        <Box
          minHeight={200}
          flexDirection="column"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          {availableRooms.length === 0 && <p>No rooms available</p>}
          {availableRooms.map(room => (
            <div key={room.roomId}>
              <p
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => joinRoom(room.roomId)}
              >
                Table: {room.roomId}
              </p>
            </div>
          ))}
        </Box>
        <Button variant="contained" onClick={createRoom}>
          Create room
        </Button>
      </Box>
    )
  }

  console.log(state)

  const canMove = state.currentTurn === room.sessionId
  const currentPlayer = state.players.find(p => p.id === room.sessionId) || {}
  const numPlayers = state.players.filter(p => p.seatIndex > -1).length
  const activePlayers = state.players.filter(p => p.inPlay)
  const getPlayer = seatIndex => {
    const player = state.players.find(p => p.seatIndex === seatIndex)
    return player ? { ...player, isClient: player.id === room.sessionId } : {}
  }

  return (
    <div className="outer">
      <div className="container">
        <Room
          canSit={currentPlayer.seatIndex === -1}
          room={room}
          cards={state.cards}
          getPlayer={getPlayer}
        />

        <div style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
          <Button
            variant="contained"
            disabled={!canMove}
            onClick={() => room.send({ action: 'check' })}
          >
            Check
          </Button>
          <Button
            variant="contained"
            disabled={!canMove}
            onClick={() => room.send({ action: 'fold' })}
          >
            Fold
          </Button>
          <Button
            variant="contained"
            disabled={
              !currentPlayer.dealer ||
              numPlayers < 2 ||
              activePlayers.length > 0
            }
            onClick={() => room.send({ action: 'deal' })}
          >
            Deal
          </Button>
          <Button
            variant="contained"
            disabled={currentPlayer.seatIndex === -1}
            onClick={() => room.send({ action: 'stand' })}
          >
            Stand
          </Button>
          <Button variant="contained" onClick={() => room.leave()}>
            Leave
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
