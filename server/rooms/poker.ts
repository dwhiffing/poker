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
  activePlayerIndex = 0
  stateIndex = 0
  cards = []

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

    if (Object.keys(this.state.players).length >= 2 && this.stateIndex === 0) {
      this.dealCards()
    }

    if (Object.keys(this.state.players).length === 10) {
      this.lock()
    }
  }

  dealCards() {
    const numPlayers = Object.values(this.state.players).length
    if (this.stateIndex === 0) {
      this.stateIndex = 1
      let cardIndex = 0

      delete this.state.cards[0]
      delete this.state.cards[1]
      delete this.state.cards[2]
      delete this.state.cards[3]
      delete this.state.cards[4]

      this.cards = shuffleCards().map(
        card => new Card(card.value, card.suit, card.index),
      )

      for (let id in this.state.players) {
        const player = this.state.players[id]
        player.cards[0] = this.cards[cardIndex++]
        player.cards[1] = this.cards[cardIndex++]
      }
    } else if (this.stateIndex === 1) {
      this.stateIndex = 2
      this.state.cards[0] = this.cards[numPlayers * 2]
      this.state.cards[1] = this.cards[numPlayers * 2 + 1]
      this.state.cards[2] = this.cards[numPlayers * 2 + 2]
    } else if (this.stateIndex === 2) {
      this.stateIndex = 3
      this.state.cards[3] = this.cards[numPlayers * 2 + 3]
    } else if (this.stateIndex === 3) {
      this.stateIndex = 4
      this.state.cards[4] = this.cards[numPlayers * 2 + 4]
    }
  }

  onMessage(client: Client, data: any) {
    if (client.sessionId === this.state.currentTurn) {
      const playerIds = Object.keys(this.state.players)
      const index = playerIds.indexOf(client.sessionId) + 1
      this.activePlayerIndex += 1
      this.state.currentTurn =
        index >= playerIds.length ? playerIds[0] : playerIds[index]

      if (this.activePlayerIndex >= playerIds.length) {
        this.activePlayerIndex = 0
        if (this.stateIndex >= 4) {
          this.stateIndex = 0
        }
        this.dealCards()
      }
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

    player.remainingMoveTime = 2
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
