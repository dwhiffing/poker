import React, { useEffect } from 'react'
import { Button } from '@material-ui/core'
import { Flex } from './'

export function Actions({ room, blind, currentTurn, currentBet, players }) {
  const player = players.find(p => p.id === room.sessionId) || {}
  const canMove = currentTurn === room.sessionId
  const activePlayers = players.filter(p => p.inPlay)
  const numPlayers = players.filter(p => p.seatIndex > -1).length
  const canDeal = player.dealer && numPlayers >= 2 && activePlayers.length === 0
  const canStand = player.seatIndex !== -1
  const sendAction = (action, rest = {}) => room.send({ action, ...rest })

  return (
    <>
      {(canMove || canDeal) && (
        <BottomActions
          canDeal={canDeal}
          currentBet={currentBet}
          betAmount={blind * 2}
          player={player}
          sendAction={sendAction}
          canMove={canMove}
        />
      )}

      <Flex
        flex={0}
        justifyContent="flex-end"
        position="fixed"
        top={10}
        left={0}
        right={0}
        zIndex={100}
      >
        <Button
          onClick={() => {
            if (canStand) {
              sendAction('stand')
            } else {
              localStorage.removeItem(room.id)
              room.leave()
            }
          }}
        >
          {canStand ? 'Stand' : 'Leave'}
        </Button>
      </Flex>
    </>
  )
}

const Action = ({ variant = 'contained', ...props }) => (
  <Button variant={variant} {...props} style={{ margin: 8 }} />
)

function BottomActions({
  canDeal,
  sendAction,
  currentBet = 0,
  player,
  canMove,
  betAmount,
  autoDeal = false,
  autoCheck = false,
}) {
  useEffect(() => {
    if (canDeal && autoDeal) {
      sendAction('deal')
    }
  }, [canDeal, sendAction, autoDeal])

  useEffect(() => {
    if (player.money === 0 && currentBet === 0 && autoCheck) {
      setTimeout(() => {
        sendAction('check')
      }, 500)
    }
  }, [player, autoCheck, sendAction, currentBet])

  return (
    <Flex
      flex={0}
      variant="justify-center"
      position="fixed"
      bottom={10}
      left={0}
      right={0}
      zIndex={100}
    >
      {canDeal ? (
        <>
          <Action disabled={!canDeal} onClick={() => sendAction('deal')}>
            Deal
          </Action>
        </>
      ) : (
        <>
          <Action
            disabled={!canMove}
            onClick={() =>
              sendAction(currentBet > player.bet ? 'fold' : 'check')
            }
          >
            {currentBet > player.bet ? 'Fold' : 'Check'}
          </Action>
          <Action
            disabled={
              !canMove ||
              player.money + player.bet < currentBet ||
              currentBet === player.bet
            }
            onClick={() => sendAction('call')}
          >
            Call
          </Action>
          <Action
            disabled={
              !canMove || player.money + player.bet < currentBet + betAmount
            }
            onClick={() =>
              sendAction('bet', { amount: currentBet + betAmount })
            }
          >
            {currentBet > 0 ? 'Raise' : 'Bet'}
          </Action>
        </>
      )}
    </Flex>
  )
}
