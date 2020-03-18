import React, { useState, useRef, useEffect } from 'react'
import { Card } from './Card'
import './index.css'

function App() {
  const [state, setState] = useState({
    players: [],
  })

  const roomRef = useRef()
  const connect = async () => {
    roomRef.current = await window.colyseus.joinOrCreate('poker')

    let numPlayers = 0
    roomRef.current.state.players.onAdd = () => {
      numPlayers++

      if (numPlayers === 2) {
      }
    }

    roomRef.current.state.onChange = changes => {
      changes.forEach(change => {
        if (change.field === 'currentTurn') {
          // go to next turn after a little delay, to ensure "onJoin" gets called before this.
        } else if (change.field === 'deck') {
        } else if (change.field === 'players') {
          setState({
            players: Object.values(change.value.toJSON()).map(p => ({
              ...p,
              cards: Object.values(p.cards),
            })),
          })
        }
      })
    }
  }

  useEffect(() => {
    connect()
  }, [])

  return (
    <div className="container">
      {state.players.map((player, playerIndex) =>
        player.cards.map((card, cardIndex) => (
          <Card
            x={50 + 15 * cardIndex}
            y={50 + 150 * playerIndex}
            key={`card-${cardIndex}`}
            card={card}
          />
        )),
      )}
    </div>
  )
}

export default App
