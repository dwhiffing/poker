import React from 'react'
import { Card } from './Card'
import { Button, Box, Typography, Chip } from '@material-ui/core'
import { Flex } from '.'
import { getIsSmall } from '../utils'

const COLORS = [
  '#0071AA',
  '#ECE4B7',
  '#E8C340',
  '#D33830',
  '#A06033',
  '#EA9438',
  '#E27C81',
  '#7FC12E',
  '#525252',
  '#AA5BAF',
]

export const Seat = ({ onSit, getPlayer, index, style = {} }) => {
  const player = getPlayer(index) || {}
  const {
    id,
    remainingConnectionTime,
    remainingMoveTime,
    connected,
    isTurn,
    isClient,
    name,
    winner,
    hand,
    showCards,
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
        flex={0}
        variant="center"
        minWidth={getIsSmall() ? 70 : 90}
        minHeight={getIsSmall() ? 70 : 90}
        borderRadius="50%"
        position="relative"
        style={{
          boxShadow: winner
            ? '0 0 10px 1px #00fff3, inset 0 0 80px 80px transparent'
            : '',
          border: `2px solid ${winner ? '#00fff3' : COLORS[index]}`,
          backgroundColor,
          ...style,
        }}
      >
        {id ? (
          <>
            <Typography
              style={{
                fontSize: isClient ? 16 : 12,
                fontWeight: isClient ? 'bold' : 'normal',
              }}
            >
              {name || id}
            </Typography>

            {dealer && <DealerChip />}
            {isTurn && (
              <TimeChip
                time={!connected ? remainingConnectionTime : remainingMoveTime}
              />
            )}

            <Cards big={isClient || showCards} cards={cards} />

            {(isClient || showCards) && hand && (
              <Box
                position="absolute"
                bottom={getIsSmall() ? -20 : -40}
                zIndex={66}
              >
                <Chip label={hand} />
              </Box>
            )}
          </>
        ) : (
          <Button disabled={!onSit} onClick={() => onSit(index)}>
            Sit
          </Button>
        )}
      </Flex>
    </Flex>
  )
}

function Cards({ big, cards }) {
  const clientYOffset = getIsSmall() ? 0 : 50
  const yOffset = getIsSmall() ? 0 : 30
  return (
    <Box position="absolute" display="flex" justifyContent="center">
      {cards.map((card, i) => (
        <Box key={`card-${i}`} width={i === 0 ? 15 : null}>
          <Card
            key={i}
            card={card}
            scale={big ? 0.8 : 0.4}
            y={big ? clientYOffset : yOffset}
            style={{ position: 'relative', zIndex: big ? 10 : 1 }}
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
        boxShadow: 'rgba(0,0,0,0.5) 0px 0px 3px',
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
        boxShadow: 'rgba(0,0,0,0.5) 0px 0px 3px',
        backgroundColor: 'white',
        color: 'green',
      }}
    >
      D
    </Box>
  )
}
