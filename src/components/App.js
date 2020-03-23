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
  const [currentBet, setCurrentBet] = useState(0)
  const [blind, setBlind] = useState(0)
  const [pot, setPot] = useState()

  useEffect(() => {
    if (!room) return

    room.onLeave(() => {
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
        } else if (field === 'pot') {
          setPot(value)
        } else if (field === 'blind') {
          setBlind(value)
        } else if (field === 'currentBet') {
          setCurrentBet(value)
        } else if (field === 'players') {
          setPlayers(value.toJSON().map(p => maskCards(p, room.sessionId)))
        }
      })
  }, [room])

  if (!room) {
    return <Lobby setRoom={setRoom} />
  }

  console.log({ pot, cards, players, currentTurn })

  return (
    <Flex
      variant="column center"
      overflow="hidden"
      style={{
        width:
          document.documentElement.clientWidth > 500
            ? 'calc(100vw - 20px)'
            : '100vw',
        height: 'calc(100vh - 60px)',
        padding:
          document.documentElement.clientWidth > 500 ? '30px 10px' : '30px 0',
      }}
    >
      <Room pot={pot} room={room} cards={cards} players={players} />
      <Actions
        room={room}
        blind={blind}
        currentBet={currentBet}
        currentTurn={currentTurn}
        players={players}
      />
    </Flex>
  )
}

export default App
