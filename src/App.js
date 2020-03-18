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
    const room = await window.colyseus.joinOrCreate('poker')
    setRoom(room)

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
  }

  useEffect(() => {
    connect()
  }, [])

  return (
    <div>
      <div className="container">
        <Players activeId={state.currentTurn} players={state.players} />
        <Actions
          onAction={room ? obj => room.send(obj) : () => {}}
          canMove={room && state.currentTurn === room.sessionId}
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
