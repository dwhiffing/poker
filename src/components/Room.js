import React, { useEffect, useState } from 'react'
import { Seat } from './Seat'
import { Card } from './Card'
import { Flex } from '.'

const getIsPortrait = () =>
  document.documentElement.clientWidth < document.documentElement.clientHeight

export function Room({ players, room, cards }) {
  const [portrait, setPortrait] = useState(getIsPortrait())
  const currentPlayer = players.find(p => p.id === room.sessionId) || {}

  const onSit = seatIndex =>
    currentPlayer.seatIndex === -1
      ? () => room.send({ action: 'sit', seatIndex })
      : null

  useEffect(() => {
    const callback = () => setPortrait(getIsPortrait())
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }, [])

  return portrait ? (
    <PortraitTable cards={cards} onSit={onSit} players={players} />
  ) : (
    <LandscapeTable cards={cards} onSit={onSit} players={players} />
  )
}

const LandscapeTable = ({ cards, onSit, players }) => (
  <Flex
    variant="column justify-between"
    width="100%"
    maxWidth={1100}
    maxHeight={500}
  >
    <Flex>
      <Flex />
      <Seat player={players[0]} onSit={onSit(0)} />
      <Seat player={players[1]} onSit={onSit(1)} />
      <Seat player={players[2]} onSit={onSit(2)} />
      <Flex />
    </Flex>

    <Flex flex={2}>
      <Flex variant="column">
        <Seat player={players[9]} onSit={onSit(9)} />
        <Seat player={players[8]} onSit={onSit(8)} />
      </Flex>

      <Flex variant="center" flex={2}>
        {cards.map((card, i) => (
          <Card key={card.index} card={card} style={{ margin: 5 }} />
        ))}
      </Flex>

      <Flex variant="column">
        <Seat player={players[3]} onSit={onSit(3)} />
        <Seat player={players[4]} onSit={onSit(4)} />
      </Flex>
    </Flex>

    <Flex>
      <Flex />
      <Seat player={players[7]} onSit={onSit(7)} />
      <Seat player={players[6]} onSit={onSit(6)} />
      <Seat player={players[5]} onSit={onSit(5)} />
      <Flex />
    </Flex>
  </Flex>
)

const PortraitTable = ({ cards, onSit, players }) => (
  <Flex
    variant="column justify-between"
    width="100%"
    maxWidth={1100}
    maxHeight={500}
  >
    <Flex>
      <Flex />
      <Seat player={players[0]} onSit={onSit(0)} />
      <Seat player={players[1]} onSit={onSit(1)} />
      <Flex />
    </Flex>

    <Flex flex={2}>
      <Flex variant="column">
        <Seat player={players[9]} onSit={onSit(9)} />
        <Seat player={players[8]} onSit={onSit(8)} />
        <Seat player={players[7]} onSit={onSit(7)} />
      </Flex>

      <Flex variant="center" flex={2}>
        {cards.map((card, i) => (
          <Card key={card.index} card={card} style={{ margin: 5 }} />
        ))}
      </Flex>

      <Flex variant="column">
        <Seat player={players[2]} onSit={onSit(2)} />
        <Seat player={players[3]} onSit={onSit(3)} />
        <Seat player={players[4]} onSit={onSit(4)} />
      </Flex>
    </Flex>

    <Flex>
      <Flex />
      <Seat player={players[6]} onSit={onSit(6)} />
      <Seat player={players[5]} onSit={onSit(5)} />
      <Flex />
    </Flex>
  </Flex>
)
