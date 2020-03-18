import { Room, Delayed, Client } from 'colyseus'
import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema'
import shuffle from 'lodash/shuffle'

class Card extends Schema {
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

class Player extends Schema {
  @type('string')
  id: string

  @type({ map: Card })
  cards = new MapSchema<Card>()

  constructor(id: string) {
    super()

    this.id = id
  }
}

class State extends Schema {
  @type('string')
  currentTurn: string

  @type({ map: Player })
  players = new MapSchema<Player>()

  @type({ map: Card })
  deck = new MapSchema<Card>()
}

interface CardI {
  suit: number
  value: number
  index: number
}

export class Poker extends Room<State> {
  maxClients = 2
  randomMoveTimeout: Delayed

  onCreate() {
    this.setState(new State())
  }

  onJoin(client: Client) {
    this.state.players[client.sessionId] = new Player(client.sessionId)

    if (Object.keys(this.state.players).length === 2) {
      this.state.currentTurn = client.sessionId
      this.setAutoMoveTimeout()

      const cards = new Array(52).fill('').map((_, i) => ({
        value: (i % 13) + 1,
        suit: Math.floor(i / 13),
        index: i,
      }))

      cards.forEach(card => {
        this.state.deck[card.index] = new Card(
          card.value,
          card.suit,
          card.index,
        )
      })

      for (let id in this.state.players) {
        const player = this.state.players[id]
        const index = Math.floor(Math.random() * 52) + 1
        player.cards[0] = this.state.deck[index]
        player.cards[1] = this.state.deck[index - 1]
      }

      // lock this room for new users
      // this.lock()
    }
  }

  onMessage(client: Client, data: any) {
    if (client.sessionId === this.state.currentTurn) {
      const playerIds = Object.keys(this.state.players)

      // switch turn
      const otherPlayerSessionId =
        client.sessionId === playerIds[0] ? playerIds[1] : playerIds[0]

      this.state.currentTurn = otherPlayerSessionId

      this.setAutoMoveTimeout()
    }
    return this.state
  }

  setAutoMoveTimeout() {
    // if (this.randomMoveTimeout) {
    //   this.randomMoveTimeout.clear()
    // }
    // this.randomMoveTimeout = this.clock.setTimeout(
    //   () => this.doRandomMove(),
    //   TURN_TIMEOUT * 1000,
    // )
  }

  onLeave(client) {
    delete this.state.players[client.sessionId]

    if (this.randomMoveTimeout) this.randomMoveTimeout.clear()
  }
}
