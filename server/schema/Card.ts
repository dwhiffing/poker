import { type, Schema } from '@colyseus/schema'
export class Card extends Schema {
  @type('number')
  value: number
  @type('number')
  suit: number
  @type('number')
  index: number
  constructor(value: number, suit: number, index: number) {
    super()
    this.value = value
    this.suit = suit
    this.index = index
  }
}
