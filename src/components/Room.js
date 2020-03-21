import React from 'react'
import { Seat } from './Seat'
import { Card } from './Card'
import { Flex } from '.'

export function Room({ players, room, cards }) {
  const currentPlayer = players.find(p => p.id === room.sessionId) || {}
  const canSit = currentPlayer.seatIndex === -1
  const onSit = seatIndex =>
    canSit ? () => room.send({ action: 'sit', seatIndex }) : null
  const getPlayer = seatIndex => {
    const player = players.find(p => p.seatIndex === seatIndex)
    return player ? { ...player, isClient: player.id === room.sessionId } : {}
  }

  return (
    <Flex
      variant="column justify-between"
      width="100%"
      maxWidth={1100}
      maxHeight={500}
    >
      <Flex>
        <Flex />
        <Seat position="top" player={getPlayer(0)} onSit={onSit(0)} />
        <Seat position="top" player={getPlayer(1)} onSit={onSit(1)} />
        <Seat position="top" player={getPlayer(2)} onSit={onSit(2)} />
        <Flex />
      </Flex>

      <Flex flex={2}>
        <Flex variant="column">
          <Seat position="left" player={getPlayer(9)} onSit={onSit(9)} />
          <Seat position="left" player={getPlayer(8)} onSit={onSit(8)} />
        </Flex>

        <Flex variant="center" flex={2}>
          {cards.map((card, i) => (
            <Card key={card.index} card={card} style={{ margin: 5 }} />
          ))}
        </Flex>

        <Flex variant="column">
          <Seat position="right" player={getPlayer(3)} onSit={onSit(3)} />
          <Seat position="right" player={getPlayer(4)} onSit={onSit(4)} />
        </Flex>
      </Flex>

      <Flex>
        <Flex />
        <Seat position="bottom" player={getPlayer(7)} onSit={onSit(7)} />
        <Seat position="bottom" player={getPlayer(6)} onSit={onSit(6)} />
        <Seat position="bottom" player={getPlayer(5)} onSit={onSit(5)} />
        <Flex />
      </Flex>
    </Flex>
  )
}
