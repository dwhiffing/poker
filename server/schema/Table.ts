import { type, Schema, ArraySchema } from '@colyseus/schema'
import { Player } from './Player'
import { Card } from './Card'
export class Table extends Schema {
  @type('string')
  currentTurn: string
  @type('number')
  currentBet: number
  @type('number')
  blind: number
  @type('number')
  pot: number
  @type([Player])
  players = new ArraySchema<Player>()
  @type([Card])
  cards = new ArraySchema<Card>()

  constructor() {
    super()
    this.pot = 0
    this.currentBet = 0
    this.blind = 10
  }
}
