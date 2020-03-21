import React from 'react'
import { Button } from '@material-ui/core'
import { Flex } from './'

export function Actions({ room, currentTurn, players }) {
  const player = players.find(p => p.id === room.sessionId) || {}
  const canMove = currentTurn === room.sessionId
  const activePlayers = players.filter(p => p.inPlay)
  const numPlayers = players.filter(p => p.seatIndex > -1).length
  const canDeal = player.dealer && numPlayers >= 2 && activePlayers.length === 0
  const canStand = player.seatIndex !== -1
  const sendAction = action => room.send({ action })

  return (
    <Flex
      flex={0}
      variant="justify-center"
      position="fixed"
      bottom={10}
      left={0}
      right={0}
    >
      <Action disabled={!canMove} onClick={() => sendAction('check')}>
        Check
      </Action>
      <Action disabled={!canMove} onClick={() => sendAction('fold')}>
        Fold
      </Action>
      <Action disabled={!canDeal} onClick={() => sendAction('deal')}>
        Deal
      </Action>
      <Action disabled={!canStand} onClick={() => sendAction('stand')}>
        Stand
      </Action>
      <Action onClick={() => room.leave()}>Leave</Action>
    </Flex>
  )
}

const Action = ({ variant = 'contained', ...props }) => (
  <Button variant={variant} {...props} style={{ margin: 8 }} />
)
