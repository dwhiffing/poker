import { type, Schema, MapSchema } from '@colyseus/schema'
import { Card } from './Card'
export class Player extends Schema {
  @type('string')
  id: string
  @type({ map: Card })
  cards = new MapSchema<Card>()
  constructor(id: string) {
    super()
    this.id = id
  }
}
