import shuffle from 'lodash/shuffle'
import { Card } from '../schema'

const RECONNECT_TIME = 30

const orderedCards = new Array(52).fill('').map((_, i) => ({
  value: (i % 13) + 1,
  suit: Math.floor(i / 13),
}))

export const shuffleCards = () =>
  shuffle(orderedCards)
    .map((d, i) => ({ ...d, index: i }))
    .map(card => new Card(card.value, card.suit, card.index))

export const handleReconnect = async (reconnection, player) => {
  player.remainingConnectionTime = RECONNECT_TIME
  const interval = setInterval(() => {
    if (!player) return clearInterval(interval)

    player.remainingConnectionTime -= 1
    if (player.remainingConnectionTime === 0) {
      reconnection.reject()
      clearInterval(interval)
    }
  }, 1000)

  await reconnection

  player.connected = true
  clearInterval(interval)
}
