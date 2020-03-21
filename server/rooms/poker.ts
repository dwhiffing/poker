import { Room, Delayed, Client } from 'colyseus'
import { Player, Table } from '../schema'
import { shuffleCards, handleReconnect } from '../utils'

// TODO: need to handle turn logic when player disconnects (should wait for player to reconnect if its their turn)
// TODO: need to allow players to leave manually and join specific rooms
// TODO: determine winner of hand
// TOOD: Allow betting
// TODO: show cards for a bit after round end, select winner

const MOVE_TIME = 30

export class Poker extends Room<Table> {
  maxClients = 10
  moveTimeout: Delayed
  deck = []

  onCreate() {
    this.setState(new Table())
  }

  onJoin(client: Client) {
    if (this.getPlayer(client.sessionId)) return

    this.state.players.push(new Player(client.sessionId))

    if (this.getPlayers().length === 10) {
      this.lock()
    }
  }

  onMessage(client: Client, data: any) {
    const player = this.getPlayer(client.sessionId)
    if (!player) return
    const isTheirTurn = client.sessionId === this.state.currentTurn
    const canDeal =
      this.getActivePlayers().length === 0 && player && player.dealer

    if (data.action === 'check' && isTheirTurn) {
      player.check()
      this.doNextTurn()
    } else if (data.action === 'fold' && isTheirTurn) {
      player.fold()
      this.doNextTurn()
    } else if (data.action === 'deal' && canDeal) {
      this.doNextPhase()
    } else if (data.action === 'sit') {
      player.sit(data.seatIndex)
      this.getDealer()
    } else if (data.action === 'stand') {
      player.stand()
      if (this.getActivePlayers().length === 1) {
        this.endGame()
      }
      this.getDealer()
    } else if (data.action === 'setName') {
      player.setName(data.name)
    }
  }

  onLeave = async (client, consented) => {
    const player = this.getPlayer(client.sessionId)
    player.connected = false

    if (consented) {
      player.fold()
      this.removePlayer(player.id)
      return
    }

    await handleReconnect(this.allowReconnection(client), player, () => {
      player.fold()
      if (client.sessionId === player.id) {
        this.doNextTurn()
      }
      this.removePlayer(player.id)
    })
  }

  removePlayer(id) {
    this.state.players = this.state.players.filter(p => p.id !== id)
  }

  doNextPhase() {
    if (this.state.cards.length === 5) {
      this.endGame()
    } else if (this.getActivePlayers().length === 0) {
      this.deck = shuffleCards()
      this.state.cards = this.state.cards.filter(f => false)
      this.getSeatedPlayers()
        .filter(p => p.connected)
        .forEach(player => {
          player.giveCards(this.deck.splice(-2, 2))
        })
    } else if (this.state.cards.length === 0) {
      this.state.cards.push(...this.deck.splice(-3, 3)) // flop
    } else if (this.state.cards.length === 3) {
      this.state.cards.push(...this.deck.splice(-1, 1)) // turn
    } else if (this.state.cards.length === 4) {
      this.state.cards.push(...this.deck.splice(-1, 1)) // river
    }

    this.getSeatedPlayers().forEach(player => player.resetTurn())
    this.setCurrentTurn(this.getDealer())
  }

  doNextTurn() {
    const activePlayers = this.getActivePlayers()
    const nextPlayer = activePlayers.find(p => p.turnPending)

    if (activePlayers.length === 1) {
      return this.endGame()
    }

    if (nextPlayer) {
      this.setCurrentTurn(nextPlayer)
    } else {
      if (this.state.cards.length === 5) {
        this.endGame()
      } else {
        this.doNextPhase()
      }
    }
  }

  setCurrentTurn(player = null) {
    const currentPlayer = this.getCurrentPlayer()
    if (currentPlayer) {
      currentPlayer.isTurn = false
    }
    if (player) {
      this.state.currentTurn = player.id
      player.isTurn = true
      this.setAutoMoveTimeout()
    } else {
      this.state.currentTurn = ''
    }
  }

  getCurrentPlayer() {
    return this.getPlayer(this.state.currentTurn)
  }

  endGame() {
    this.state.cards = this.state.cards.filter(f => false)
    this.setCurrentTurn()
    this.getSeatedPlayers().forEach(player => player.fold())
    if (this.moveTimeout) {
      this.moveTimeout.clear()
    }

    this.setDealer()
  }

  setAutoMoveTimeout() {
    const player = this.getCurrentPlayer()
    if (this.moveTimeout) {
      this.moveTimeout.clear()
    }

    player.remainingMoveTime = MOVE_TIME
    this.moveTimeout = this.clock.setInterval(() => {
      player.remainingMoveTime -= 1

      if (player.remainingMoveTime <= 0) {
        this.onMessage({ sessionId: this.state.currentTurn } as Client, {
          action: 'check',
        })
      }
    }, 1000)
  }

  getPlayers = () => [...this.state.players.values()]

  getPlayer = sessionId => this.getPlayers().find(p => p.id === sessionId)

  getActivePlayers = () => this.getSeatedPlayers().filter(p => p.inPlay)

  getSeatedPlayers = () => {
    const sortedPlayers = this.getPlayers()
      .filter(p => p.seatIndex > -1)
      .sort((a, b) => a.seatIndex - b.seatIndex)

    const dealerIndex = sortedPlayers.findIndex(p => p.dealer)

    return [
      ...sortedPlayers.slice(dealerIndex, sortedPlayers.length),
      ...sortedPlayers.slice(0, dealerIndex),
    ]
  }

  getDealer() {
    let dealerPlayer = this.getSeatedPlayers().find(p => p.dealer)
    if (!dealerPlayer) {
      this.setDealer()
    }
    return dealerPlayer
  }

  setDealer() {
    let player = this.getSeatedPlayers().find(p => p.dealerPending)

    this.getPlayers().forEach(p => {
      p.dealer = false
      if (!player) {
        p.dealerPending = true
      }
    })
    if (!player) player = this.getSeatedPlayers().find(p => p.dealerPending)

    if (player) {
      player.makeDealer()
      return player
    }
  }
}
