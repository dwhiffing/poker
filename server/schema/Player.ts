import { type, Schema, MapSchema } from '@colyseus/schema'
import { Card } from './Card'

export class Player extends Schema {
  @type('string')
  id: string

  @type('number')
  money: number

  @type({ map: Card })
  cards = new MapSchema<Card>()

  constructor(id: string) {
    super()
    this.id = id
    this.money = 0
  }
}
