import { type, Schema, MapSchema } from '@colyseus/schema'
import { Card } from './Card'

export class Player extends Schema {
  @type('string')
  id: string

  @type('boolean')
  connected: boolean

  @type('number')
  money: number

  @type('number')
  seatIndex: number

  @type('number')
  remainingConnectionTime: number

  @type('number')
  remainingMoveTime: number

  @type({ map: Card })
  cards = new MapSchema<Card>()

  constructor(id: string) {
    super()
    this.id = id
    this.money = 0
    this.remainingConnectionTime = 0
    this.remainingMoveTime = 0
    this.seatIndex = -1
    this.connected = true
  }
}
