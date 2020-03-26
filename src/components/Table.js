import React from 'react'
import { Seat } from './Seat'
import { Card } from './Card'
import { Flex, Chips } from '.'
import { getHandLabel, getIsLarge } from '../utils'
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
      maxHeight={500}
    >
      <Flex>
        {document.documentElement.clientHeight > 350 &&
          document.documentElement.clientWidth > 400 && <Flex />}
        {layout[0].map(n => (
          <Seat
            key={`seat-${n}`}
            index={n}
            getPlayer={getPlayer}
            onSit={onSit}
          />
        ))}
        {document.documentElement.clientHeight > 350 &&
          document.documentElement.clientWidth > 400 && <Flex />}
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

        <Flex
          variant="column center"
          minHeight={document.documentElement.clientWidth < 500 ? 350 : 0}
          flex={2}
        >
          <Box
            minHeight={100}
            minWidth={150}
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
          >
            {document.documentElement.clientHeight <= 400 && pot > 0 && (
              <Box zIndex={99}>
                <Chips amount={pot} />
              </Box>
            )}
            {cards.map((card, i) => (
              <Card
                key={card.index}
                card={card}
                scale={getIsLarge() ? 1.4 : 1}
                style={{ margin: getIsLarge() ? 20 : 5 }}
              />
            ))}
          </Box>
          {document.documentElement.clientHeight > 350 &&
            document.documentElement.clientWidth > 400 &&
            pot > 0 && (
              <Box mt={1} zIndex={99}>
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
        {document.documentElement.clientHeight > 350 &&
          document.documentElement.clientWidth > 400 && <Flex />}
        {layout[3].map(n => (
          <Seat
            key={`seat-${n}`}
            index={n}
            getPlayer={getPlayer}
            onSit={onSit}
          />
        ))}
        {document.documentElement.clientHeight > 350 &&
          document.documentElement.clientWidth > 400 && <Flex />}
      </Flex>
    </Flex>
  )
}
export default Table
