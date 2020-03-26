import { type, Schema, ArraySchema } from '@colyseus/schema'
import { Card } from './Card'
import { Delayed } from 'colyseus'

const RECONNECT_TIME = 30
let clock
export class Player extends Schema {
  leaveInterval: Delayed
  // session id of client
  @type('string')
  id: string

  @type('string')
  name: string

  @type('string')
  lastAction: string

  // is player currently connected
  @type('boolean')
  connected: boolean

  // is player in current hand
  @type('boolean')
  inPlay: boolean

  // does player still have a turn this round
  @type('boolean')
  turnPending: boolean

  @type('boolean')
  isBot: boolean

  @type('boolean')
  isAdmin: boolean

  // is this player currently the dealer
  @type('boolean')
  dealer: boolean

  // has this player been dealer yet
  @type('boolean')
  dealerPending: boolean

  @type('boolean')
  winner: boolean

  @type('boolean')
  showCards: boolean

  // is it currently their turn
  @type('boolean')
  isTurn: boolean

  // how much money are they betting
  @type('number')
  currentBet: number

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

  constructor(id: string, opts) {
    super()
    this.id = id
    this.money = 1000
    this.currentBet = 0
    this.remainingConnectionTime = 0
    this.remainingMoveTime = 0
    this.seatIndex = -1
    this.cards = new ArraySchema<Card>()
    this.connected = true
    this.inPlay = false
    clock = opts.clock
    this.isBot = opts.isBot || false
    this.isAdmin = opts.isAdmin || false
    this.name = opts.name || ''
    this.dealer = false
    this.turnPending = false
    this.showCards = false
    this.winner = false
    this.dealerPending = true
  }

  setAction(action) {
    this.lastAction = action
    clock.setTimeout(() => {
      this.lastAction = ''
    }, 3000)
  }

  fold() {
    this.setAction('fold')
    this.removeCards()
  }

  removeCards() {
    this.cards = this.cards.filter(() => false)
    this.inPlay = false
    this.showCards = false
    this.winner = false
    this.currentBet = 0
    this.turnPending = false
  }

  check() {
    this.setAction('check')
    this.turnPending = false
  }

  winPot(amount) {
    this.setAction(`win $${amount}`)
    this.currentBet = 0
    this.winner = true
    this.money += amount
  }

  call(amount) {
    this.setAction(`call $${amount}`)

    this.wager(amount)
  }

  bet(amount, currentBet) {
    if (amount - this.currentBet > this.money) {
      return
    }
    this.setAction(`${currentBet > 0 ? 'raise' : 'bet'} $${amount}`)
    this.wager(amount)
  }

  wager(amount) {
    if (amount - this.currentBet > this.money) {
      return
    }

    this.turnPending = false
    this.money -= amount - this.currentBet
    this.currentBet = amount
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

    this.removeCards()
    this.seatIndex = -1
    this.dealer = false
  }

  makeDealer() {
    this.dealerPending = false
    this.dealer = true
  }

  setName(name) {
    this.name = name
  }

  startReconnect = async (clock, reconnection, callback = () => {}) => {
    this.remainingConnectionTime = RECONNECT_TIME
    this.connected = false

    this.leaveInterval = clock.setInterval(() => {
      this.remainingConnectionTime -= 1
      if (this.remainingConnectionTime === 0) {
        this.leaveInterval && this.leaveInterval.clear()
        reconnection.reject()
        callback()
      }
    }, 1000)

    await reconnection
    this.leaveInterval && this.leaveInterval.clear()
    this.connected = true
  }
}
