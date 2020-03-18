import { Room, Delayed, Client } from 'colyseus'
import { type, Schema, MapSchema } from '@colyseus/schema'
import { Player } from '../schema/Player'
import { Card } from '../schema/Card'
import shuffle from 'lodash/shuffle'

const deck = new Array(52).fill('').map((_, i) => ({
  value: (i % 13) + 1,
  suit: Math.floor(i / 13),
}))

const shuffleCards = () => shuffle(deck).map((d, i) => ({ ...d, index: i }))
// const turnOrder = [0,1,2,4,6,9,8,7,5,3]

class State extends Schema {
  @type('string')
  currentTurn: string

  @type({ map: Player })
  players = new MapSchema<Player>()

  @type({ map: Card })
  deck = new MapSchema<Card>()
}

export class Poker extends Room<State> {
  maxClients = 10
  randomMoveTimeout: Delayed

  onCreate() {
    this.setState(new State())
  }

  onJoin(client: Client) {
    this.state.players[client.sessionId] = new Player(client.sessionId)

    this.state.currentTurn = client.sessionId
    this.setAutoMoveTimeout()

    shuffleCards().forEach(card => {
      this.state.deck[card.index] = new Card(card.value, card.suit, card.index)
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

  onMessage(client: Client, data: any) {
    if (client.sessionId === this.state.currentTurn) {
      const playerIds = Object.keys(this.state.players)
      const index = playerIds.indexOf(client.sessionId) + 1
      this.state.currentTurn =
        index >= playerIds.length ? playerIds[0] : playerIds[index]
      console.log(this.state.currentTurn)
      this.setAutoMoveTimeout()
    }
    return this.state
  }

  setAutoMoveTimeout() {
    if (this.randomMoveTimeout) {
      this.randomMoveTimeout.clear()
    }
    this.randomMoveTimeout = this.clock.setTimeout(() => {
      this.onMessage({ sessionId: this.state.currentTurn } as Client, {
        action: 'fold',
      })
    }, 3000)
  }

  onLeave(client) {
    delete this.state.players[client.sessionId]

    if (this.randomMoveTimeout) this.randomMoveTimeout.clear()
  }
}
