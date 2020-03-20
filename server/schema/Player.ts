import { type, Schema, ArraySchema } from '@colyseus/schema'
import { Card } from './Card'

export class Player extends Schema {
  @type('string')
  id: string

  @type('boolean')
  connected: boolean

  @type('boolean')
  inPlay: boolean

  @type('boolean')
  turnPending: boolean

  @type('boolean')
  dealer: boolean

  @type('number')
  money: number

  @type('number')
  seatIndex: number

  @type('number')
  remainingConnectionTime: number

  @type('number')
  remainingMoveTime: number

  @type([Card])
  cards = new ArraySchema<Card>()

  constructor(id: string) {
    super()
    this.id = id
    this.money = 0
    this.remainingConnectionTime = 0
    this.remainingMoveTime = 0
    this.seatIndex = -1
    this.cards = new ArraySchema<Card>()
    this.connected = true
    this.inPlay = false
    this.dealer = false
    this.turnPending = false
  }

  fold() {
    this.cards = this.cards.filter(() => false)
    this.inPlay = false
    this.turnPending = false
  }

  check() {
    this.turnPending = false
  }

  giveCards(cards) {
    this.inPlay = true
    this.turnPending = true
    this.cards.push(...cards)
  }
}
