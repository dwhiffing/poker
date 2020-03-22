import React, { useEffect, useState } from 'react'
import { Seat } from './Seat'
import { Card } from './Card'
import { Flex } from '.'
import { getIsSmall } from '../utils'

const getIsPortrait = () =>
  document.documentElement.clientWidth < document.documentElement.clientHeight

export function Room({ players, room, cards }) {
  const [portrait, setPortrait] = useState(getIsPortrait())
  const currentPlayer = players.find(p => p.id === room.sessionId) || {}
  const seatedPlayers = players
    .filter(p => p.seatIndex !== -1)
    .map(p => ({ ...p, isClient: p.id === room.sessionId }))
    .sort((a, b) => a.seatIndex - b.seatIndex)

  const onSit = seatIndex =>
    currentPlayer.seatIndex === -1
      ? () => room.send({ action: 'sit', seatIndex })
      : null

  useEffect(() => {
    const callback = () => setPortrait(getIsPortrait())
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }, [])

  return (
    <Table
      layout={getIsSmall() ? SMALL : portrait ? PORTRAIT : LANDSCAPE}
      cards={cards}
      onSit={onSit}
      room={room}
      players={seatedPlayers}
    />
  )
}

const Table = ({ layout, room, cards, onSit, players }) => {
  const getPlayer = i =>
    players
      .map(p => ({ ...p, isClient: p.id === room.sessionId }))
      .find(p => p.seatIndex === i)

  return (
    <Flex
      variant="column justify-between"
      width="100%"
      maxWidth={1100}
      maxHeight={600}
    >
      <Flex>
        <Flex />
        {layout[0].map(n => (
          <Seat key={`seat-${n}`} player={getPlayer(n)} onSit={onSit(n)} />
        ))}
        <Flex />
      </Flex>

      <Flex flex={2}>
        {layout[1].length > 0 && (
          <Flex variant="column">
            {layout[1].map(n => (
              <Seat key={`seat-${n}`} player={getPlayer(n)} onSit={onSit(n)} />
            ))}
          </Flex>
        )}

        <Flex minHeight={100} variant="center" flexWrap="wrap" flex={2} py={2}>
          {cards.map((card, i) => (
            <Card key={card.index} card={card} scale={0.9} />
          ))}
        </Flex>

        {layout[2].length > 0 && (
          <Flex variant="column">
            {layout[2].map(n => (
              <Seat key={`seat-${n}`} player={getPlayer(n)} onSit={onSit(n)} />
            ))}
          </Flex>
        )}
      </Flex>

      <Flex>
        <Flex />
        {layout[3].map(n => (
          <Seat key={`seat-${n}`} player={getPlayer(n)} onSit={onSit(n)} />
        ))}
        <Flex />
      </Flex>
      {getIsSmall() && <Flex />}
    </Flex>
  )
}

const PORTRAIT = [
  [0, 1],
  [9, 8, 7],
  [2, 3, 4],
  [6, 5],
]

const LANDSCAPE = [
  [0, 1, 2],
  [9, 8],
  [3, 4],
  [7, 6, 5],
]
const SMALL = [[0, 1, 2, 3], [], [], [7, 6, 5, 4]]
