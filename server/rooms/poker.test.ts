import { Poker } from './poker'

let room
describe('Poker', () => {
  beforeEach(() => {
    room = new Poker()
    room.onCreate({})
  })

  afterEach(() => {
    room.disconnect()
  })

  describe('doNextPhase', () => {
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
