import { Room, Delayed, Client } from 'colyseus'
import { type, Schema, MapSchema } from '@colyseus/schema'
import { Player } from '../schema/Player'
import { Card } from '../schema/Card'
import shuffle from 'lodash/shuffle'

const orderedCards = new Array(52).fill('').map((_, i) => ({
  value: (i % 13) + 1,
  suit: Math.floor(i / 13),
}))

const shuffleCards = () =>
  shuffle(orderedCards).map((d, i) => ({ ...d, index: i }))
// const turnOrder = [0,1,2,4,6,9,8,7,5,3]

class State extends Schema {
  @type('string')
  currentTurn: string

  @type({ map: Player })
  players = new MapSchema<Player>()

  @type({ map: Card })
  cards = new MapSchema<Card>()
}

export class Poker extends Room<State> {
  maxClients = 10
  randomMoveTimeout: Delayed
  gameStarted = false

  onCreate() {
    this.setState(new State())
  }

  onJoin(client: Client) {
    if (this.state.players[client.sessionId]) {
      return
    }
    this.state.players[client.sessionId] = new Player(client.sessionId)

    this.state.currentTurn = client.sessionId
    this.setAutoMoveTimeout()

    if (Object.keys(this.state.players).length >= 2 && !this.gameStarted) {
      this.dealCards()
    }

    if (Object.keys(this.state.players).length === 10) {
      this.lock()
    }
  }

  dealCards() {
    this.gameStarted = true
    shuffleCards().forEach(card => {
      this.state.cards[card.index] = new Card(card.value, card.suit, card.index)
    })

    for (let id in this.state.players) {
      const player = this.state.players[id]
      const index = Math.floor(Math.random() * 52) + 1
      player.cards[0] = this.state.cards[index]
      player.cards[1] = this.state.cards[index - 1]
    }
  }

  onMessage(client: Client, data: any) {
    if (client.sessionId === this.state.currentTurn) {
      const playerIds = Object.keys(this.state.players)
      const index = playerIds.indexOf(client.sessionId) + 1
      this.state.currentTurn =
        index >= playerIds.length ? playerIds[0] : playerIds[index]
      this.setAutoMoveTimeout()
    }
    return this.state
  }

  setAutoMoveTimeout() {
    const sessionId = this.state.currentTurn
    const player = this.state.players[sessionId]
    if (this.randomMoveTimeout) {
      this.randomMoveTimeout.clear()
    }

    player.remainingMoveTime = 15
    this.randomMoveTimeout = this.clock.setInterval(() => {
      player.remainingMoveTime -= 1

      if (player.remainingMoveTime <= 0) {
        this.randomMoveTimeout.clear()
        this.onMessage({ sessionId: this.state.currentTurn } as Client, {
          action: 'fold',
        })
      }
    }, 1000)
  }

  onLeave = async (client, consented) => {
    if (this.randomMoveTimeout) this.randomMoveTimeout.clear()

    const player = this.state.players[client.sessionId]
    player.connected = false

    try {
      if (consented) {
        throw new Error('consented leave')
      }

      const reconnection = this.allowReconnection(client)
      player.remainingConnectionTime = 30

      const interval = setInterval(() => {
        if (!player) {
          clearInterval(interval)
          return
        }

        player.remainingConnectionTime -= 1
        if (player.remainingConnectionTime === 0) {
          reconnection.reject()
          clearInterval(interval)
        }
      }, 1000)

      await reconnection
      clearInterval(interval)

      player.connected = true
    } catch (e) {
      delete this.state.players[client.sessionId]
    }
  }
}
