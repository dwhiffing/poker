import React from 'react'
import { Card } from './Card'
import { Button, Box, Typography } from '@material-ui/core'
import { Flex } from '.'

export const Seat = ({ onSit, position, player = {} }) => {
  const {
    id,
    remainingConnectionTime,
    remainingMoveTime,
    connected,
    isTurn,
    isClient,
    name,
    cards,
    dealer,
  } = player

  let backgroundColor = 'rgba(255,255,255,0.1)'
  if (isTurn) {
    backgroundColor = 'rgba(255,255,255,0.4)'
  }
  if (id && !connected) {
    backgroundColor = 'rgba(255,0,0,0.5)'
  }

  return (
    <Flex variant="center">
      <Flex
        flex={/top|bottom/.test(position) ? 0.6 : 0.5}
        minWidth={60}
        className="square"
        borderRadius="50%"
        variant="center"
        position="relative"
        style={{
          border: `${isClient ? 2 : 0}px solid white`,
          backgroundColor,
        }}
      >
        {id ? (
          <>
            <Typography>{name || id}</Typography>

            {dealer && <DealerChip />}
            {isTurn && (
              <TimeChip
                time={!connected ? remainingConnectionTime : remainingMoveTime}
              />
            )}

            <Cards isClient={isClient} cards={cards} position={position} />
          </>
        ) : (
          <Button disabled={!onSit} onClick={onSit}>
            Sit
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

function Cards({ isClient, cards, position }) {
  return (
    <Box position="absolute" display="flex" justifyContent="center">
      {cards.map((card, i) => (
        <Box key={`card-${i}`} width={i === 0 ? 15 : null}>
          <Card
            key={i}
            card={card}
            scale={isClient ? 0.8 : 0.6}
            style={{ position: 'relative', zIndex: isClient ? 10 : 1 }}
          />
        </Box>
      ))}
    </Box>
  )
}

function TimeChip({ time }) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width={30}
      height={30}
      borderRadius={15}
      position="absolute"
      right={-5}
      bottom={-5}
      style={{
        zIndex: 20,
        backgroundColor: 'white',
        color: 'green',
      }}
    >
      {time}
    </Box>
  )
}

function DealerChip() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width={30}
      height={30}
      borderRadius={15}
      position="absolute"
      right={-5}
      top={-5}
      style={{
        zIndex: 20,
        backgroundColor: 'white',
        color: 'green',
      }}
    >
      D
    </Box>
  )
}
