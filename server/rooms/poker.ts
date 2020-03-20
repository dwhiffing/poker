import { Room, Delayed, Client } from 'colyseus'
import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema'
import { Player } from '../schema/Player'
import { Card } from '../schema/Card'
import { shuffleCards, handleReconnect } from '../utils'

// TODO: need to handle turn logic when player disconnects (should wait for player to reconnect if its their turn)
// TODO: need to allow players to leave manually and join specific rooms
// TODO: need to make turn order go around table: const turnOrder = [0,1,2,4,6,9,8,7,5,3]
// TODO: determine winner of hand
// TOOD: Allow betting

const MOVE_TIME = 30

class State extends Schema {
  @type('string')
  currentTurn: string

  @type([Player])
  players = new ArraySchema<Player>()

  @type([Card])
  cards = new ArraySchema<Card>()
}

export class Poker extends Room<State> {
  maxClients = 10
  moveTimeout: Delayed
  deck = []

  onCreate() {
    this.setState(new State())
  }

  onJoin(client: Client) {
    if (this.state.players.find(p => p.id === client.sessionId)) {
      return
    }
    this.state.players.push(new Player(client.sessionId))

    if (this.state.players.length === 10) {
      this.lock()
    }
  }

  onMessage(client: Client, data: any) {
    const player = this.getPlayer(client.sessionId)
    const isTheirTurn = client.sessionId === this.state.currentTurn

    if (data.action === 'check' && isTheirTurn) {
      player.check()
      this.determineNextPlayer()
    } else if (data.action === 'fold' && isTheirTurn) {
      player.fold()
      this.determineNextPlayer()
    } else if (data.action === 'deal') {
      this.dealCards()
    } else if (data.action === 'sit') {
      this.takeSeat(client.sessionId, data.seatIndex)
    } else if (data.action === 'stand') {
      this.leaveSeat(client.sessionId)
    }
  }

  onLeave = async (client, consented) => {
    const player = this.getPlayer(client.sessionId)
    player.connected = false

    if (consented) {
      player.fold()
      this.state.players = this.state.players.filter(
        p => p.id !== client.sessionId,
      )
      return
    }

    await handleReconnect(this.allowReconnection(client), player)
  }

  takeSeat(sessionId, seatIndex) {
    const player = this.getPlayer(sessionId)
    if (player.seatIndex > -1) {
      return
    }
    player.seatIndex = seatIndex
    if (!this.getDealer()) {
      player.dealer = true
    }
  }

  leaveSeat(sessionId) {
    const player = this.getPlayer(sessionId)
    player.fold()
    player.seatIndex = -1
  }

  dealCards() {
    this.state.players.forEach(player => {
      player.turnPending = true
    })

    if (this.getActivePlayers().length === 0) {
      this.dealNewHand()
    } else if (this.state.cards.length === 0) {
      this.state.cards.push(...this.deck.splice(-3, 3)) // flop
    } else if (this.state.cards.length === 3) {
      this.state.cards.push(...this.deck.splice(-1, 1)) // turn
    } else if (this.state.cards.length === 4) {
      this.state.cards.push(...this.deck.splice(-1, 1)) // river
    }

    this.state.currentTurn = this.state.players.find(p => p.dealer).id

    this.setAutoMoveTimeout()
  }

  dealNewHand() {
    this.deck = shuffleCards().map(
      card => new Card(card.value, card.suit, card.index),
    )

    this.getSeatedPlayers().forEach(player => {
      player.giveCards(this.deck.splice(-2, 2))
    })
  }

  determineNextPlayer() {
    const remainingPlayers = this.state.players.filter(p => p.inPlay)

    if (remainingPlayers.length === 1) {
      return this.endGame()
    }

    const nextPlayer = remainingPlayers.find(p => p.turnPending)

    if (!nextPlayer) {
      if (this.state.cards.length === 5) {
        return this.endGame()
      }
      return this.dealCards()
    }

    this.state.currentTurn = nextPlayer.id

    this.setAutoMoveTimeout()
  }

  getCurrentPlayer() {
    return this.getPlayer(this.state.currentTurn)
  }

  endGame() {
    this.state.cards = this.state.cards.filter(f => false)
    this.state.currentTurn = ''
    this.state.players.forEach(player => player.fold())
    if (this.moveTimeout) {
      this.moveTimeout.clear()
    }

    const currentDealer = this.state.players.find(p => p.dealer)
    const nextDealer = this.state.players.find(p => !p.dealer)
    currentDealer.dealer = false
    nextDealer.dealer = true
  }

  setAutoMoveTimeout() {
    const player = this.getCurrentPlayer()
    if (this.moveTimeout) {
      this.moveTimeout.clear()
    }

    player.remainingMoveTime = 1 || MOVE_TIME
    this.moveTimeout = this.clock.setInterval(() => {
      player.remainingMoveTime -= 1

      if (player.remainingMoveTime <= 0) {
        this.onMessage({ sessionId: this.state.currentTurn } as Client, {
          action: 'check',
        })
      }
    }, 1000)
  }

  getPlayer(sessionId) {
    return this.state.players.find(p => p.id === sessionId)
  }

  getActivePlayers() {
    return this.state.players.filter(p => p.inPlay)
  }

  getSeatedPlayers() {
    return this.state.players.filter(p => p.seatIndex > -1)
  }

  getDealer() {
    return this.state.players.find(p => p.dealer)
  }
}
