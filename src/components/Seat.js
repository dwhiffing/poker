import React from 'react'
import { Card } from './Card'
import { Button, Box } from '@material-ui/core'

export const Seat = ({ onSit, position, player = {} }) => {
  const {
    id,
    remainingConnectionTime,
    remainingMoveTime,
    connected,
    money,
    isTurn,
    isClient,
    status,
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
    <Box flex={1} display="flex" justifyContent="center" alignItems="center">
      <Box
        width={100}
        height={100}
        m={1}
        borderRadius={50}
        display="flex"
        justifyContent="center"
        alignItems="center"
        style={{
          border: `${isClient ? 2 : 0}px solid white`,
          backgroundColor,
        }}
      >
        {id ? (
          <Box
            position="relative"
            flex={1}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
          >
            <p>{name || id}</p>

            {/* <p>${money}</p> */}

            {/* <p>{status}</p> */}

            {dealer && <DealerChip />}
            {!connected && <TimeChip time={remainingConnectionTime} />}
            {isTurn && <TimeChip time={remainingMoveTime} />}

            <Cards cards={cards} position={position} />
          </Box>
        ) : onSit ? (
          <Button onClick={onSit}>Sit</Button>
        ) : null}
      </Box>
    </Box>
  )
}

function Cards({ cards, position }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      {cards.map((card, i) => (
        <div
          key={`card-${i}`}
          style={{
            width: i === 0 ? 15 : null,
          }}
        >
          <Card
            key={i}
            card={card}
            y={position === 'top' ? 100 : position === 'bottom' ? -100 : 0}
            x={position === 'left' ? 100 : position === 'right' ? -100 : 0}
            scale={0.8}
          />
        </div>
      ))}
    </div>
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
      bottom={-25}
      style={{
        backgroundColor: 'white',
        color: 'green',
      }}
    >
      {time}
    </Box>
  )
}

function DealerChip({}) {
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
      bottom={-25}
      style={{
        backgroundColor: 'white',
        color: 'green',
      }}
    >
      D
    </Box>
  )
}
