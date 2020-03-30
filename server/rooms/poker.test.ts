import { Poker } from './poker'
import { Client } from 'colyseus'

let room
let sendMessage = (room, sessionId, data) =>
  room.onMessage({ sessionId } as Client, data)

let sendMessages = (room, actions) =>
  actions.forEach(a => sendMessage(room, a.id, a.data))

let connectPlayers = (room, players) =>
  players.forEach(p => {
    room.onJoin({ sessionId: p })
    sendMessage(room, p, { action: 'sit' })
  })

let startGameWithPlayers = (room, playerIds) => {
  connectPlayers(room, playerIds)
  sendMessage(room, playerIds[0], { action: 'deal' })
  const players = room.getSeatedPlayers({ getDealerIndex: true })
  players.forEach(player => expect(player.cards.length).toBe(2))
  return players
}

describe('Poker', () => {
  beforeEach(() => {
    room = new Poker()
    room.onCreate({})
  })

  afterEach(() => {
    room.disconnect()
  })

  describe('doNextPhase', () => {
    describe('handles start of game correctly', () => {
      it('deals out the cards correctly for n players', () => {
        for (let i = 2; i <= 10; i++) {
          room = new Poker()
          room.onCreate({})
          const ids = new Array(i).fill('').map((_, i) => `${i + 1}`)
          const players = startGameWithPlayers(room, ids)
          expect(players[0].dealer).toBe(true)
          expect(players[players.length > 2 ? 1 : 0].currentBet).toBe(10)
          expect(players[players.length > 2 ? 2 : 1].currentBet).toBe(20)
          expect(room.state.currentTurn).toBe(players.length > 3 ? '4' : '1')
          room.disconnect()
        }
      })
    })

    test.todo('handles flop correctly')
    test.todo('handles turn correctly')
    test.todo('handles river correctly')
    test.todo('handles end of game correctly')
    test.todo('starts the next phase if no actions are possible')
    test.todo('sets the next player turn')
    test.todo('handles any players that have not called')
    test.todo('gathers bets')
  })

  describe('doNextTurn', () => {
    test.todo('')
  })

  describe('putBetsInPot', () => {
    test.todo('sets the current bet to 0')
    test.todo('adds each players bet and resets their current bet')
  })

  describe('resetPlayerTurns', () => {
    test.todo('resets each players turn')
  })

  describe('getNextPlayer', () => {
    test.todo('returns players in the correct order')
  })

  describe('setCurrentTurn', () => {
    test.todo('sets the current turn')
    test.todo('sets timeout to auto move')
  })

  describe('getWinners', () => {
    test.todo('returns the correct players')
  })

  describe('payoutWinners', () => {
    test.todo('pays out the correct amount')
  })

  describe('endGame', () => {
    test.todo('shows cards')
    test.todo('sets current turn null')
    test.todo('puts bets in pot')
    test.todo('pays out winners')
    test.todo('hides hand after timeout')
  })

  // describe('doPlayerMove', () => {})
  // describe('doBotMove', () => {})
  describe('setAutoMoveTimeout', () => {
    test.todo('clears existing timeout')
    test.todo('performs move if bot')
    test.todo('sets remaining time interval')
    test.todo('autofolds after duration')
  })

  describe('sitInAvailableSeat', () => {
    test.todo('sits in available seat')
  })

  describe('getDealer', () => {
    test.todo('returns the dealer')
    test.todo('calls set dealer if no dealer')
  })

  describe('setDealer', () => {
    test.todo('sets other players as pending')
    test.todo('sets the correct player as dealer')
  })

  describe('getPlayers', () => {
    test.todo('returns players in the correct order')
  })

  describe('getPlayer', () => {
    test.todo('returns correct player')
  })

  describe('getActivePlayers', () => {
    test.todo('returns correct players')
  })

  describe('getSeatedPlayers', () => {
    test.todo('returns correct players in the correct order')
  })
})
