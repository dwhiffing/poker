import React, { useState, useEffect } from 'react'
import './index.css'
import './card.css'
import { Players } from './components/Players'

function App() {
  const [room, setRoom] = useState()
  const [state, setState] = useState({
    players: [],
  })

  const connect = async () => {
    const sessionId = localStorage.getItem('sessionId')
    const rooms = await window.colyseus.getAvailableRooms()
    const pokerRoom = rooms[0]
    let room

    if (sessionId && pokerRoom) {
      try {
        room = await window.colyseus.reconnect(pokerRoom.roomId, sessionId)
      } catch (e) {
        localStorage.removeItem('sessionId')
      }
    } else {
      room = await window.colyseus.joinOrCreate('poker')
    }

    if (room) {
      localStorage.setItem('sessionId', room.sessionId)
      setRoom(room)
    }
  }

  useEffect(() => {
    if (!room) return

    room.onLeave(() => {
      setRoom(null)
    })

    room.state.onChange = changes => {
      changes.forEach(change => {
        if (change.field === 'currentTurn') {
          setState(state => ({
            ...state,
            currentTurn: change.value,
          }))
        } else if (change.field === 'players') {
          setState(state => ({
            ...state,
            players: Object.values(change.value.toJSON()).map(p => ({
              ...p,
              cards: Object.values(p.cards),
            })),
          }))
        }
      })
    }
  }, [room])

  useEffect(() => {
    connect()
  }, [])

  if (!room) {
    return (
      <div>
        <p>Could not connect</p>
      </div>
    )
  }

  return (
    <div>
      <div className="container">
        <Players activeId={state.currentTurn} players={state.players} />
        <Actions
          onAction={obj => room.send(obj)}
          canMove={state.currentTurn === room.sessionId}
        />
      </div>
    </div>
  )
}

export default App

function Actions({ canMove, onAction }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: 10 }}>
      <button disabled={!canMove} onClick={() => onAction({ action: 'check' })}>
        Check
      </button>
      <button disabled={!canMove} onClick={() => onAction({ action: 'fold' })}>
        Fold
      </button>
    </div>
  )
}
