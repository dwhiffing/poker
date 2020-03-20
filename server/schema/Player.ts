import { type, Schema, ArraySchema } from '@colyseus/schema'
import { Card } from './Card'

export class Player extends Schema {
  // session id of client
  @type('string')
  id: string

  // is player currently connected
  @type('boolean')
  connected: boolean

  // is player in current hand
  @type('boolean')
  inPlay: boolean

  // does player still have a turn this round
  @type('boolean')
  turnPending: boolean

  // is this player currently the dealer
  @type('boolean')
  dealer: boolean

  // has this player been dealer yet
  @type('boolean')
  dealerPending: boolean

  // is it currently their turn
  @type('boolean')
  isTurn: boolean

  // how much money do they have
  @type('number')
  money: number

  // what seat are they in
  @type('number')
  seatIndex: number

  // how much time do they have to reconnect
  @type('number')
  remainingConnectionTime: number

  // how much time do they have to make a move
  @type('number')
  remainingMoveTime: number

  // what cards do they have
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
    this.dealerPending = true
  }

  fold() {
    this.cards = this.cards.filter(() => false)
    this.inPlay = false
    this.turnPending = false
  }

  check() {
    this.turnPending = false
  }

  resetTurn() {
    this.turnPending = true
    this.isTurn = false
  }

  giveCards(cards) {
    this.inPlay = true
    this.turnPending = true
    this.cards.push(...cards)
  }

  sit(seatIndex) {
    if (this.seatIndex > -1) return

    this.seatIndex = seatIndex
  }

  stand() {
    if (this.seatIndex === -1) return

    this.fold()
    this.seatIndex = -1
    this.dealer = false
  }

  makeDealer() {
    this.dealerPending = false
    this.dealer = true
  }
}
