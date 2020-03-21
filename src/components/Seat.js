import React from 'react'
import { Card } from './Card'
import { Button, Box } from '@material-ui/core'

export const Seat = ({ onSit, player = {} }) => {
  const {
    id,
    remainingConnectionTime,
    remainingMoveTime,
    connected,
    money,
    isTurn,
    isClient,
    status,
    cards,
    dealer,
  } = player

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
          backgroundColor: isTurn
            ? 'rgba(255,255,255,0.5)'
            : 'rgba(255,255,255,0.1)',
        }}
      >
        {id ? (
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <p>{id}</p>

            {/* <p>${money}</p> */}

            {/* <p>{status}</p> */}

            {/* {dealer && <p>dealer</p>} */}

            <p>
              {!connected
                ? remainingConnectionTime
                : isTurn
                ? remainingMoveTime
                : ' '}
            </p>

            <div style={{ position: 'absolute', top: 0, left: 0 }}>
              {cards.map((card, i) => (
                <Card key={i} x={20 * i + 10} y={80} scale={0.6} card={card} />
              ))}
            </div>
          </div>
        ) : onSit ? (
          <Button onClick={onSit}>Sit</Button>
        ) : null}
      </Box>
    </Box>
  )
}
