import React from 'react'
import { Seat } from './Seat'
import { Card } from './Card'
import { Flex, Chips } from '.'
import { getIsSmall, getHandLabel } from '../utils'
import { Box } from '@material-ui/core'

const Table = ({ pot, layout, room, cards, onSit, players }) => {
  const getPlayer = i =>
    players
      .map(p => ({
        ...p,
        hand: getHandLabel(p, cards),
        isClient: p.id === room.sessionId,
      }))
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
          <Seat
            key={`seat-${n}`}
            index={n}
            getPlayer={getPlayer}
            onSit={onSit}
          />
        ))}
        <Flex />
      </Flex>

      <Flex flex={2}>
        {layout[1].length > 0 && (
          <Flex variant="column">
            {layout[1].map(n => (
              <Seat
                key={`seat-${n}`}
                index={n}
                getPlayer={getPlayer}
                onSit={onSit}
              />
            ))}
          </Flex>
        )}

        <Flex variant="column center" flex={2} py={2}>
          <Flex flex={0} minHeight={100} variant="center" flexWrap="wrap">
            {cards.map((card, i) => (
              <Card key={card.index} card={card} scale={0.9} />
            ))}
          </Flex>
          {pot > 0 && (
            <Box zIndex={99}>
              <Chips amount={pot} />
            </Box>
          )}
        </Flex>

        {layout[2].length > 0 && (
          <Flex variant="column">
            {layout[2].map(n => (
              <Seat
                key={`seat-${n}`}
                index={n}
                getPlayer={getPlayer}
                onSit={onSit}
              />
            ))}
          </Flex>
        )}
      </Flex>

      <Flex>
        <Flex />
        {layout[3].map(n => (
          <Seat
            key={`seat-${n}`}
            index={n}
            getPlayer={getPlayer}
            onSit={onSit}
          />
        ))}
        <Flex />
      </Flex>
      {getIsSmall() && <Flex />}
    </Flex>
  )
}
export default Table
