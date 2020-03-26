import React from 'react'
import { Card } from './Card'
import { Button, Box, Typography, Chip } from '@material-ui/core'
import { Flex, Chips } from '.'
import { getIsSmall, getIsLarge, formatNumber } from '../utils'

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
    inPlay,
    lastAction,
    currentBet = 0,
    money,
    hand,
    showCards,
    cards,
    dealer,
  } = player

  let backgroundColor = '#54b786'
  if (isTurn) {
    backgroundColor = '#8dd2b0'
  }
  if (id && !connected) {
    backgroundColor = '#d86e6e'
  }
  if (winner) {
    backgroundColor = '#00fff3'
  }

  return (
    <Flex position="relative" variant="center">
      <Flex
        flex={1}
        mx={{ xs: 0.25, md: 2 }}
        my={{ xs: 2, md: 4 }}
        variant="center"
        borderRadius={12}
        minWidth={document.documentElement.clientWidth < 400 ? 64 : 83}
        maxWidth={125}
        position="relative"
        py={1}
        style={{
          border: `3px solid ${COLORS[index]}`,
          backgroundColor,
          zIndex: dealer ? 15 : 10,
          ...style,
        }}
      >
        {id ? (
          <>
            <Flex variant="column center">
              <Typography
                style={{
                  fontSize: isClient ? 14 : 12,
                  textAlign: 'center',
                  fontWeight: isClient ? 'bold' : 'normal',
                }}
              >
                {name || id}
              </Typography>
              <Typography style={{ fontSize: 12 }}>
                ${formatNumber(money)}
              </Typography>
            </Flex>

            {currentBet > 0 && (
              <Box position="absolute" bottom={-25} zIndex={99}>
                <Chips amount={currentBet} />
              </Box>
            )}

            {dealer && <DealerChip />}
            {isTurn && (
              <TimeChip
                time={!connected ? remainingConnectionTime : remainingMoveTime}
              />
            )}

            {lastAction && (
              <Box
                position="absolute"
                bottom={44}
                zIndex={66}
                style={{
                  animation: 'animate 3s',
                  animationTimingFunction: 'linear',
                }}
              >
                <Chip label={lastAction} />
              </Box>
            )}

            {inPlay && currentBet <= 0 && showCards && hand && (
              <Box position="absolute" bottom={-23} zIndex={66}>
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
      {cards && <Cards big={isClient || showCards} cards={cards} />}
    </Flex>
  )
}

function Cards({ big, cards }) {
  const yOffset = getIsSmall() ? 50 : 40
  const scale = big ? 1 : 0.7
  return (
    <Box
      position="absolute"
      display="flex"
      justifyContent="center"
      zIndex={1}
      width={120}
      height={130}
      bottom={33}
      overflow="hidden"
    >
      {cards.map((card, i) => (
        <Box key={`card-${i}`} width={i === 0 ? 17 : null}>
          <Card
            key={i}
            card={card}
            scale={
              getIsSmall() ? scale * 0.9 : scale * (getIsLarge() ? 1.5 : 1)
            }
            y={yOffset}
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
      right={-20}
      style={{
        zIndex: 300,
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
      right={-20}
      style={{
        zIndex: 300,
        boxShadow: 'rgba(0,0,0,0.5) 0px 0px 3px',
        backgroundColor: 'white',
        color: 'green',
      }}
    >
      D
    </Box>
  )
}

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
