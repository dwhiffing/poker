import shuffle from 'lodash/shuffle'
import { Card } from '../schema'

const orderedCards = new Array(52).fill('').map((_, i) => ({
  value: (i % 13) + 1,
  suit: Math.floor(i / 13),
}))

export const shuffleCards = () =>
  shuffle(orderedCards)
    .map((d, i) => ({ ...d, index: i }))
    .map(card => new Card(card.value, card.suit, card.index))

export const VALUES = [
  0,
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'J',
  'Q',
  'K',
]
export const SUITS = ['s', 'c', 'h', 'd']

export const getPots = (players = [], extra = 0) => {
  if (players.length === 1) {
    return [
      {
        pot: players[0].betThisHand + extra,
        players: players.map(p => p.id),
      },
    ]
  }
  players = players
    .map((p, i) => ({ id: p.id, bet: p.betThisHand }))
    .sort((a, b) => a.bet - b.bet)

  const sidePots = []

  players.forEach(({ id, bet }, currentPlayerIndex) => {
    if (currentPlayerIndex === 0) return

    for (let i = currentPlayerIndex - 1; i > 0; i--) {
      bet -= players[i].bet - players[i - 1].bet
    }

    bet -= players[0].bet

    sidePots.forEach(({ players }) => players.push(id))

    let sidePot = {
      pot: (players.length - currentPlayerIndex) * bet,
      players: [id],
    }

    sidePot.pot && sidePots.push(sidePot)
  })

  const mainPot = {
    pot: players.length * players[0].bet + extra,
    players: players.map(p => p.id),
  }

  return [mainPot, ...sidePots]
}
