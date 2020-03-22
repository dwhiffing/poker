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
  '10',
  'J',
  'Q',
  'K',
]
export const SUITS = ['s', 'c', 'h', 'd']
