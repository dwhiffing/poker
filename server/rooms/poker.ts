import { Room, Delayed, Client } from 'colyseus'
import { Player, Table } from '../schema'
import { SUITS, VALUES, shuffleCards, getPots } from '../utils'
import { Hand } from 'pokersolver'
import faker from 'faker'
import random from 'lodash/random'
import sample from 'lodash/sample'

const MOVE_TIME = 30
const END_OF_HAND_TIME = 5
const BOT_TIMEOUT = 1000
const FAST_MODE = false

export class Poker extends Room<Table> {
  maxClients = 15
  turnSeatIndex = 0
  leaveInterval: Delayed
  moveTimeout: Delayed
  deck = []

  onCreate(options) {
    this.setState(new Table())
    this.setMetadata({ roomName: options.roomName })
  }

  onJoin(client: Client) {
    if (this.getPlayer(client.sessionId)) return
    const player = new Player(client.sessionId, { clock: this.clock })
    if (this.state.players.length === 0) {
      player.isAdmin = true
    }
    this.state.players.push(player)
  }

  addBot() {
    if (this.state.players.length >= 10) {
      return
    }

    const bot = new Player(faker.random.uuid().slice(0, 8), {
      isBot: true,
      name: faker.name.firstName(),
      clock: this.clock,
    })
    this.state.players.push(bot)
    this.sitInAvailableSeat(bot)
  }

  removeBot() {
    const nextBotToRemove = this.getSeatedPlayers()
      .sort((a, b) => b.seatIndex - a.seatIndex)
      .find(p => p.isBot)
    if (nextBotToRemove) {
      this.removePlayer(nextBotToRemove)
    }
  }

  doPlayerMove(bot, action = {}, timeout = BOT_TIMEOUT) {
    this.clock.setTimeout(() => {
      this.onMessage({ sessionId: bot.id } as Client, {
        ...action,
      })
    }, random(timeout / 2, timeout * 2))
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
      this.state.pot += player.currentBet
      player.fold()
      this.doNextTurn()
    } else if (data.action === 'call' && isTheirTurn) {
      player.call(this.state.currentBet)
      this.doNextTurn()
    } else if (data.action === 'bet' && isTheirTurn) {
      this.resetPlayerTurns()
      player.bet(data.amount, this.state.currentBet > 0)
      if (player.currentBet > this.state.currentBet) {
        this.state.currentBet = player.currentBet
      }
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
      this.state.pot += player.currentBet
      player.stand()
      if (isTheirTurn) {
        this.doNextTurn()
      }
      if (this.getActivePlayers().length === 1) {
        this.endGame()
      }
      this.getDealer()
    } else if (data.action === 'setName') {
      player.setName(data.name)
    } else if (data.action === 'addBot') {
      this.addBot()
    } else if (data.action === 'removeBot') {
      this.removeBot()
    } else if (data.action === 'increaseBlinds') {
      this.state.blind = this.state.blind + 10
    } else if (data.action === 'decreaseBlinds') {
      this.state.blind = this.state.blind - 10
    } else if (data.action === 'gift') {
      this.state.players.forEach(p => (p.money += 1000))
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
    this.state.pot += player.currentBet
    player.removeCards()
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
      this.state.pot += player.currentBet
      player.currentBet = 0
    })
  }

  resetPlayerTurns() {
    this.getActivePlayers().forEach(player => player.resetTurn())
  }

  doNextPhase() {
    const playersYetToCall = this.getActivePlayers().filter(
      p => p.currentBet < this.state.currentBet && p.money > 0,
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
            this.state.currentBet = player.currentBet
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

    const moneyPlayers = this.getActivePlayers().filter(p => p.money > 0)
    if (
      moneyPlayers.length < 2 &&
      this.getActivePlayers().length > 1 &&
      this.state.cards.length < 5
    ) {
      this.doNextPhase()
    } else {
      this.setCurrentTurn(this.getActivePlayers().filter(p => p.money > 0)[0])
    }
  }

  doNextTurn() {
    const moneyPlayers = this.getActivePlayers().filter(p => p.money > 0)
    const seats = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n =>
      moneyPlayers.find(p => p.seatIndex === n),
    )
    const orderedSeats = [
      ...seats.slice(this.turnSeatIndex),
      ...seats.slice(0, this.turnSeatIndex),
    ]
    const nextPlayer = orderedSeats.find(p => p && p.turnPending)
    if (this.getActivePlayers().length === 1) {
      return this.endGame()
    }

    if (moneyPlayers.length < 2 && this.getActivePlayers().length > 1) {
      this.doNextPhase()
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
      this.turnSeatIndex = player.seatIndex
      player.isTurn = true
      this.setAutoMoveTimeout()
    }
  }

  getCurrentPlayer() {
    return this.getPlayer(this.state.currentTurn)
  }

  getWinners(ids) {
    const cards = this.state.cards.map(
      c => `${VALUES[c.value]}${SUITS[c.suit]}`,
    )

    const players = this.getActivePlayers().filter(p => ids.includes(p.id))

    players.forEach(p => (p.showCards = true))

    const playersWithHands = players.map(p => ({
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
    const pots = getPots(this.getActivePlayers())
    pots.forEach(({ pot, players: playerIds }) => {
      const winners = this.getWinners(playerIds)
      const splitPot = Math.floor(pot / winners.length)
      winners.forEach(player => player.winPot(splitPot))
    })
    this.state.pot = 0
  }

  endGame() {
    this.getActivePlayers().forEach(p => (p.showCards = true))
    this.setCurrentTurn()
    this.putBetsInPot()
    this.payoutWinners()

    this.clock.setTimeout(() => {
      this.state.cards = this.state.cards.filter(f => false)

      this.getSeatedPlayers().forEach(player => player.removeCards())
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

    if (FAST_MODE || player.isBot) {
      let amount
      const allIn = player.money + player.currentBet < this.state.currentBet

      let action = this.state.currentBet > 0 ? 'call' : 'check'

      if (action === 'check') {
        action = sample(['bet', 'check', 'check'])
      }

      if (action === 'call') {
        action = sample(['bet', 'call', 'call', 'call', 'call', 'call', 'fold'])
      }

      if (action === 'bet') {
        amount = allIn ? player.money + player.currentBet : this.state.blind * 2
      }

      this.doPlayerMove(player, { action, amount })
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
      .filter(p => p.connected && p.money > 0)
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
      if (player.isBot) {
        this.doPlayerMove(player, { action: 'deal' })
      }
      return player
    }
  }
}
