import { Room, Delayed, Client } from 'colyseus'
import { Player, Table } from '../schema'
import { shuffleCards, handleReconnect } from '../utils'

// TODO: need to handle turn logic when player disconnects (should wait for player to reconnect if its their turn)
// TODO: need to allow players to leave manually and join specific rooms
// TODO: determine winner of hand
// TOOD: Allow betting

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
    const isTheirTurn = client.sessionId === this.state.currentTurn
    const canDeal = this.getActivePlayers().length === 0 && player.dealer

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
    } else if (data.action === 'stand') {
      player.stand()
    }

    // ensure dealer exists
    this.getDealer()
  }

  onLeave = async (client, consented) => {
    const player = this.getPlayer(client.sessionId)
    player.connected = false

    if (consented) {
      player.fold()
      this.state.players = this.getPlayers().filter(p => p.id !== player.id)
      return
    }

    await handleReconnect(this.allowReconnection(client), player)
  }

  doNextPhase() {
    if (this.state.cards.length === 5) {
      this.endGame()
    } else if (this.getActivePlayers().length === 0) {
      this.deck = shuffleCards()
      this.getSeatedPlayers().forEach(player => {
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

    const currentDealer = this.getDealer()
    const nextDealer = this.getPlayers().find(p => !p.dealer)
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

  getPlayers = () => this.state.players

  getPlayer = sessionId => this.getPlayers().find(p => p.id === sessionId)

  getActivePlayers = () => this.getSeatedPlayers().filter(p => p.inPlay)

  getSeatedPlayers = () => this.getPlayers().filter(p => p.seatIndex > -1)

  getDealer() {
    let dealerPlayer = this.getPlayers().find(p => p.dealer)
    const seatedPlayer = this.getSeatedPlayers()[0]
    if (!dealerPlayer && seatedPlayer) {
      dealerPlayer = seatedPlayer
      dealerPlayer.dealer = true
    }
    return dealerPlayer
  }
}
