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
    <>
      <Flex
        flex={0}
        variant="justify-center"
        position="fixed"
        bottom={10}
        left={0}
        right={0}
      >
        {canDeal ? (
          <>
            <Action disabled={!canDeal} onClick={() => sendAction('deal')}>
              Deal
            </Action>
          </>
        ) : (
          <>
            <Action disabled={!canMove} onClick={() => sendAction('check')}>
              Check
            </Action>
            <Action disabled={true}>Call</Action>
            <Action disabled={true}>Raise</Action>
          </>
        )}
      </Flex>

      <Flex
        flex={0}
        variant="justify-center"
        position="fixed"
        top={10}
        left={0}
        right={0}
      >
        <Button onClick={() => (canStand ? sendAction('stand') : room.leave())}>
          {canStand ? 'Stop playing' : 'Leave room'}
        </Button>
      </Flex>
    </>
  )
}

const Action = ({ variant = 'contained', ...props }) => (
  <Button variant={variant} {...props} style={{ margin: 8 }} />
)
