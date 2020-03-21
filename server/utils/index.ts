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
