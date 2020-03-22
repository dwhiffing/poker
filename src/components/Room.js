import React, { useEffect, useState } from 'react'
import Table from './Table'
import { getIsSmall, getIsPortrait } from '../utils'

export function Room({ pot = 0, players, room, cards }) {
  const [portrait, setPortrait] = useState(getIsPortrait())
  const currentPlayer = players.find(p => p.id === room.sessionId) || {}
  const seatedPlayers = players
    .filter(p => p.seatIndex !== -1)
    .map(p => ({ ...p, isClient: p.id === room.sessionId }))
    .sort((a, b) => a.seatIndex - b.seatIndex)

  const onSit =
    currentPlayer.seatIndex === -1
      ? seatIndex => room.send({ action: 'sit', seatIndex })
      : null

  useEffect(() => {
    const callback = () => setPortrait(getIsPortrait())
    window.addEventListener('resize', callback)
    return () => window.removeEventListener('resize', callback)
  }, [])

  return (
    <Table
      layout={getIsSmall() ? SMALL : portrait ? PORTRAIT : LANDSCAPE}
      cards={cards}
      onSit={onSit}
      room={room}
      pot={pot}
      currentPlayer={currentPlayer}
      players={seatedPlayers}
    />
  )
}

const PORTRAIT = [
  [0, 1],
  [9, 8, 7],
  [2, 3, 4],
  [6, 5],
]

const LANDSCAPE = [
  [0, 1, 2],
  [9, 8],
  [3, 4],
  [7, 6, 5],
]
const SMALL = [[0, 1, 2, 3, 4], [], [], [9, 8, 7, 6, 5]]
