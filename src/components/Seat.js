import React from 'react'
import { Card } from './Card'
import { Button, Box, Typography, Chip } from '@material-ui/core'
import { Flex, Chips } from '.'
import { getIsSmall } from '../utils'
import numeral from 'numeral'

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
    bet = 0,
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
        flex={0}
        mx={1}
        my={2}
        variant="center"
        borderRadius={12}
        minWidth={document.documentElement.clientWidth < 400 ? 64 : 83}
        position="relative"
        py={1}
        style={{
          border: `3px solid ${COLORS[index]}`,
          backgroundColor,
          zIndex: 10,
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
                $
                {numeral(money)
                  .format('(0[.]00a)')
                  .toUpperCase()}
              </Typography>
            </Flex>

            {bet > 0 && (
              <Box position="absolute" bottom={-25} zIndex={99}>
                <Chips amount={bet} />
              </Box>
            )}

            {dealer && <DealerChip />}
            {isTurn && (
              <TimeChip
                time={!connected ? remainingConnectionTime : remainingMoveTime}
              />
            )}

            {inPlay && bet <= 0 && showCards && hand && (
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
  const yOffset = getIsSmall() ? -15 : -20
  const scale = big ? 1 : 0.7
  return (
    <Box position="absolute" display="flex" justifyContent="center" zIndex={1}>
      {cards.map((card, i) => (
        <Box key={`card-${i}`} width={i === 0 ? 15 : null}>
          <Card
            key={i}
            card={card}
            scale={getIsSmall() ? scale * 0.9 : scale}
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
