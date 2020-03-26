import React, { useEffect, useState } from 'react'
import {
  Button,
  Slider,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core'
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
      {(canMove || canDeal || player.isAdmin) && (
        <BottomActions
          canDeal={canDeal}
          currentBet={currentBet}
          betAmount={blind * 2}
          player={player}
          blind={blind}
          players={players}
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
  blind,
  canMove,
  betAmount,
  players,
  autoDeal = false,
  autoCheck = false,
}) {
  const activePlayers = players.filter(p => p.inPlay)

  const [customBet, setCustomBet] = useState(currentBet)
  const [showBetSlider, setShowBetSlider] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    if (canDeal && autoDeal) {
      sendAction('deal')
    }
  }, [canDeal, sendAction, autoDeal])

  useEffect(() => {
    if (typeof currentBet === 'number') {
      setCustomBet(currentBet + blind * 2)
    }
  }, [currentBet, blind])

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
      variant="column center"
      position="fixed"
      bottom={10}
      left={0}
      right={0}
      zIndex={100}
    >
      <Flex
        variant="justify-center"
        style={{ flexWrap: 'wrap', maxWidth: 600 }}
      >
        {showBetSlider ? (
          <Box>
            <Flex>
              <Action onClick={() => setShowBetSlider(false)}>Cancel</Action>
              <Action onClick={() => setCustomBet(customBet - blind)}>
                -{blind}
              </Action>
              <Action onClick={() => setCustomBet(customBet + blind)}>
                +{blind}
              </Action>
              <Action
                onClick={() => {
                  setShowBetSlider(false)
                  sendAction('bet', { amount: customBet - currentBet })
                }}
              >
                Submit
              </Action>
            </Flex>
            <Flex>
              <Slider
                value={customBet}
                onChange={(event, newValue) => setCustomBet(newValue)}
                aria-labelledby="continuous-slider"
                step={blind * 2}
                min={blind * 2}
                max={player.money}
                style={{ marginRight: 20 }}
              />
              <Typography>{customBet}</Typography>
            </Flex>
          </Box>
        ) : (
          <>
            {player.isAdmin && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showAdmin}
                    onChange={(e, newValue) => setShowAdmin(newValue)}
                    name="showAdmin"
                  />
                }
                label="Admin"
              />
            )}

            {canDeal && (
              <Action disabled={!canDeal} onClick={() => sendAction('deal')}>
                Deal
              </Action>
            )}

            {activePlayers.length > 0 && (
              <Action
                disabled={!canMove}
                onClick={() =>
                  sendAction(currentBet > player.currentBet ? 'fold' : 'check')
                }
              >
                {currentBet > player.currentBet ? 'Fold' : 'Check'}
              </Action>
            )}

            {activePlayers.length > 0 && currentBet > 0 && (
              <Action
                disabled={
                  !canMove ||
                  player.money + player.currentBet < currentBet ||
                  currentBet === player.currentBet
                }
                onClick={() => sendAction('call')}
              >
                Call
              </Action>
            )}

            {activePlayers.length > 0 && (
              <Action
                disabled={
                  !canMove ||
                  player.money + player.currentBet < currentBet + betAmount
                }
                onClick={() => {
                  setShowBetSlider(true)
                  setCustomBet(currentBet + blind * 2)
                }}
              >
                {currentBet > 0 ? 'Raise' : 'Bet'}
              </Action>
            )}

            {showAdmin && (
              <>
                <Action
                  disabled={players.length >= 10}
                  onClick={() => sendAction('addBot')}
                >
                  + bot
                </Action>
                <Action
                  disabled={players.filter(p => p.isBot).length === 0}
                  onClick={() => sendAction('removeBot')}
                >
                  - bot
                </Action>
                <Action
                  disabled={players.filter(p => p.isBot).length === 0}
                  onClick={() => sendAction('increaseBlinds')}
                >
                  + blind ({blind})
                </Action>
                <Action
                  disabled={players.filter(p => p.isBot).length === 0}
                  onClick={() => sendAction('decreaseBlinds')}
                >
                  - blind ({blind})
                </Action>
              </>
            )}
          </>
        )}
      </Flex>
    </Flex>
  )
}
