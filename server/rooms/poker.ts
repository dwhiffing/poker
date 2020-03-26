import { Room, Delayed, Client } from 'colyseus'
import { Player, Table } from '../schema'
import { SUITS, VALUES, shuffleCards } from '../utils'
import { Hand } from 'pokersolver'

const MOVE_TIME = 30
const END_OF_HAND_TIME = 5
const FAST_MODE = false

export class Poker extends Room<Table> {
  maxClients = 15
  leaveInterval: Delayed
  moveTimeout: Delayed
  deck = []

  onCreate(options) {
    this.setState(new Table())
    this.setMetadata({ roomName: options.roomName })
  }

  onJoin(client: Client) {
    if (this.getPlayer(client.sessionId)) return

    this.state.players.push(new Player(client.sessionId))
  }

  onMessage(client: Client, data: any) {
    const player = this.getPlayer(client.sessionId)
    if (!player) return
    const isTheirTurn = client.sessionId === this.state.currentTurn
    const eligiblePlayers = this.getSeatedPlayers().filter(
      p => p.cards.length === 0 && p.money > 0,
    )
    const canDeal = eligiblePlayers.length >= 2 && player && player.dealer

    if (data.action === 'check' && isTheirTurn) {
      player.check()
      this.doNextTurn()
    } else if (data.action === 'fold' && isTheirTurn) {
      this.state.pot += player.bet
      player.fold()
      this.doNextTurn()
    } else if (data.action === 'call' && isTheirTurn) {
      player.wager(this.state.currentBet)
      this.doNextTurn()
    } else if (data.action === 'bet' && isTheirTurn) {
      player.wager(data.amount)
      this.state.currentBet = player.bet
      this.doNextTurn()
    } else if (data.action === 'deal' && canDeal) {
      this.doNextPhase()
    } else if (data.action === 'sit') {
      if (typeof data.seatIndex === 'number') {
        player.sit(data.seatIndex)
      }
      this.sitInAvailableSeat(player)
      this.getDealer()
    } else if (data.action === 'stand') {
      this.state.pot += player.bet
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
    if (!player) {
      return
    }

    this.unlock()

    if (consented) {
      this.removePlayer(player)
      return
    }

    player.startReconnect(this.clock, this.allowReconnection(client), () => {
      this.removePlayer(player)
    })
  }

  removePlayer(player) {
    const currentPlayer = this.getCurrentPlayer()
    this.state.pot += player.bet
    player.fold()
    this.state.players = this.state.players.filter(p => p.id !== player.id)

    if (this.getActivePlayers().length === 1) {
      return this.endGame()
    } else if (currentPlayer && currentPlayer.id === player.id) {
      this.doNextTurn()
    }
  }

  putBetsInPot() {
    this.state.currentBet = 0

    this.getActivePlayers().forEach(player => {
      this.state.pot += player.bet
      player.bet = 0
    })
  }

  doNextPhase() {
    const playersYetToCall = this.getActivePlayers().filter(
      p => p.bet < this.state.currentBet,
    )
    if (playersYetToCall.length > 0) {
      playersYetToCall.forEach(player => player.resetTurn())
      this.setCurrentTurn(playersYetToCall[0])
      return
    }

    this.putBetsInPot()

    if (this.state.cards.length === 5) {
      this.endGame()
    } else if (this.getActivePlayers().length === 0) {
      this.deck = shuffleCards()
      this.state.cards = this.state.cards.filter(f => false)
      this.getSeatedPlayers()
        .filter(p => p.connected && p.money > 0)
        .forEach((player, index, players) => {
          player.giveCards(this.deck.splice(-2, 2))
          if (index === players.length - 1 || index === players.length - 2) {
            player.wager(
              index === players.length - 1
                ? this.state.blind * 2
                : this.state.blind,
            )
            this.state.currentBet = player.bet
          }
        })
    } else if (this.state.cards.length === 0) {
      this.state.cards.push(...this.deck.splice(-3, 3)) // flop
    } else if (this.state.cards.length === 3) {
      this.state.cards.push(...this.deck.splice(-1, 1)) // turn
    } else if (this.state.cards.length === 4) {
      this.state.cards.push(...this.deck.splice(-1, 1)) // river
    }

    this.getSeatedPlayers().forEach(player => player.resetTurn())
    this.setCurrentTurn(this.getActivePlayers()[0])
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

    if (!player) {
      this.state.currentTurn = ''
    }

    if (player) {
      this.state.currentTurn = player.id
      player.isTurn = true
      this.setAutoMoveTimeout()
    }
  }

  getCurrentPlayer() {
    return this.getPlayer(this.state.currentTurn)
  }

  getWinners() {
    const cards = this.state.cards.map(
      c => `${VALUES[c.value]}${SUITS[c.suit]}`,
    )

    this.getActivePlayers().forEach(p => (p.showCards = true))

    const playersWithHands = this.getActivePlayers().map(p => ({
      id: p.id,
      hand: [...p.cards.values()]
        .map(c => `${VALUES[c.value]}${SUITS[c.suit]}`)
        .concat(cards),
    }))

    const playerHands = playersWithHands.map(p => Hand.solve(p.hand))
    const winners = Hand.winners(playerHands)
    return winners.map(winningHand => {
      const playerHandIndex = playerHands.indexOf(winningHand)
      return this.getPlayer(playersWithHands[playerHandIndex].id)
    })
  }

  payoutWinners() {
    const winners = this.getWinners()
    const splitPot = Math.floor(this.state.pot / winners.length)
    winners.forEach(player => player.winPot(splitPot))
    this.state.pot = 0
  }

  endGame() {
    this.getActivePlayers().forEach(p => (p.showCards = true))
    this.setCurrentTurn()
    this.putBetsInPot()
    this.payoutWinners()

    this.clock.setTimeout(() => {
      this.state.cards = this.state.cards.filter(f => false)

      this.getSeatedPlayers().forEach(player => player.fold())
      if (this.moveTimeout) {
        this.moveTimeout.clear()
      }
      this.setDealer()
    }, END_OF_HAND_TIME * 1000)
  }

  setAutoMoveTimeout() {
    const player = this.getCurrentPlayer()
    if (this.moveTimeout) {
      this.moveTimeout.clear()
    }

    if (FAST_MODE) {
      this.onMessage({ sessionId: this.state.currentTurn } as Client, {
        action: 'check',
      })
    }
    {
      player.remainingMoveTime = MOVE_TIME
      this.moveTimeout = this.clock.setInterval(() => {
        player.remainingMoveTime -= 1

        if (player.remainingMoveTime <= 0) {
          this.onMessage({ sessionId: this.state.currentTurn } as Client, {
            action: this.state.currentBet > 0 ? 'fold' : 'check',
          })
        }
      }, 1000)
    }
  }

  getPlayers = () =>
    [...this.state.players.values()].sort((a, b) => a.seatIndex - b.seatIndex)

  getPlayer = sessionId => this.getPlayers().find(p => p.id === sessionId)

  getActivePlayers = () => this.getSeatedPlayers().filter(p => p.inPlay)

  sitInAvailableSeat = player => {
    const takenSeats = this.getSeatedPlayers().map(p => p.seatIndex)
    const availableSeats = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      n => !takenSeats.includes(n),
    )
    const availableSeat = availableSeats[0] // sample(availableSeats)
    if (typeof availableSeat === 'number') {
      player.sit(availableSeat)
    }
  }

  getSeatedPlayers = ({ getDealerIndex = false } = {}) => {
    const sortedPlayers = this.getPlayers().filter(p => p.seatIndex > -1)
    const dealerIndex = sortedPlayers.findIndex(p => p.dealer)
    let index = dealerIndex
    if (!getDealerIndex) {
      index = dealerIndex + 3
      if (index > sortedPlayers.length) {
        index -= sortedPlayers.length
      }
    }

    return [
      ...sortedPlayers.slice(index, sortedPlayers.length),
      ...sortedPlayers.slice(0, index),
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
    let player = this.getSeatedPlayers({ getDealerIndex: true })
      .filter(p => p.connected)
      .find(p => p.dealerPending)

    this.getPlayers().forEach(p => {
      p.dealer = false
      if (!player) {
        p.dealerPending = true
      }
    })
    if (!player)
      player = this.getSeatedPlayers()
        .filter(p => p.connected)
        .find(p => p.dealerPending)

    if (player) {
      player.makeDealer()
      return player
    }
  }
}
