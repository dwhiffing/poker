import React, { useState, useEffect } from 'react'
import { Actions } from './Actions'
import { Room } from './Room'
import { Lobby } from './Lobby'
import { Flex } from './index'
import { maskCards } from '../utils'
import '../assets/card.css'

function App() {
  const [room, setRoom] = useState()
  const [cards, setCards] = useState([])
  const [players, setPlayers] = useState([])
  const [currentTurn, setCurrentTurn] = useState()

  useEffect(() => {
    if (!room) return

    room.onLeave(() => {
      localStorage.removeItem(room.id)
      setRoom(null)
      setPlayers([])
      setCurrentTurn()
      setCards([])
    })

    room.state.onChange = changes =>
      changes.forEach(({ field, value }) => {
        if (field === 'cards') {
          setCards(value.toJSON())
        } else if (field === 'currentTurn') {
          setCurrentTurn(value)
        } else if (field === 'players') {
          setPlayers(value.toJSON().map(p => maskCards(p, room.sessionId)))
        }
      })
  }, [room])

  if (!room) {
    return <Lobby setRoom={setRoom} />
  }

  console.log({ cards, players, currentTurn })

  return (
    <Flex
      variant="column center"
      overflow="hidden"
      style={{
        width: 'calc(100vw - 20px)',
        height: 'calc(100vh - 20px)',
        padding: '10px',
      }}
    >
      <Room room={room} cards={cards} players={players} />
      <Actions room={room} currentTurn={currentTurn} players={players} />
    </Flex>
  )
}

export default App
