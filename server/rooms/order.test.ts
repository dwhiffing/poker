import { Poker } from './poker'
import { Client } from 'colyseus'
import * as utils from '../utils'
import { Card } from '../schema'

const MAX_PLAYERS = 10
const DEFAULT_MONEY = 1000

let sendMessage = (room, sessionId, data) =>
  room.onMessage({ sessionId } as Client, data)

let connectPlayers = (room, players) =>
  players.forEach(p => {
    room.onJoin({ sessionId: p })
    sendMessage(room, p, { action: 'sit' })
  })

let startGameWithPlayers = playerIds => {
  let room = new Poker()
  room.onCreate({})
  room.clock.setTimeout = fn => fn()
  connectPlayers(room, playerIds)
  sendMessage(room, playerIds[0], { action: 'deal' })
  const players = room.getSeatedPlayers({ getDealerIndex: true })
  players.forEach(player => expect(player.cards.length).toBe(2))
  return room
}

let getPlayer = (room, id) => room.state.players.find(p => p.id === id)

describe('Poker', () => {
  describe('doNextPhase', () => {
    describe('handles standard game order correctly', () => {
      for (let i = 2; i <= MAX_PLAYERS; i++) {
        const ids = new Array(i).fill('').map((_, i) => `${i + 1}`)
        const room = startGameWithPlayers(ids)
        const { currentBet } = room.state
        const players = room.getSeatedPlayers({ getDealerIndex: true })

        it(`handles deal correctly for ${i} players`, () => {
          const n = players.length > 2 ? 1 : 0
          expect(players[0].dealer).toBe(true)
          expect(players[n].currentBet).toBe(10)
          expect(players[n + 1].currentBet).toBe(20)
          expect(room.state.currentTurn).toBe(players.length > 3 ? '4' : '1')
        })

        it(`handles flop correctly for ${i} players`, () => {
          const players = room.getSeatedPlayers({ getDealerIndex: i < 4 })
          players.forEach(p => {
            const action = p.currentBet === currentBet ? 'check' : 'call'
            sendMessage(room, p.id, { action })
          })
          expect(room.state.cards.length).toBe(3)
        })

        it(`handles turn correctly for ${i} players`, () => {
          let players = room.getSeatedPlayers({ getDealerIndex: true })
          players.push(players.shift())
          players.forEach(p => sendMessage(room, p.id, { action: 'check' }))
          expect(room.state.cards.length).toBe(4)
        })

        it(`handles river correctly for ${i} players`, () => {
          let players = room.getSeatedPlayers({ getDealerIndex: true })
          players.push(players.shift())
          players.forEach(p => sendMessage(room, p.id, { action: 'check' }))
          expect(room.state.cards.length).toBe(5)
        })

        it(`handles end correctly for ${i} players`, () => {
          let players = room.getSeatedPlayers({ getDealerIndex: true })
          players.push(players.shift())
          players.forEach(p => sendMessage(room, p.id, { action: 'check' }))
          expect(room.state.cards.length).toBe(0)
          players.forEach(p => expect(p.cards.length).toBe(0))
        })

        room.disconnect()
      }
    })
    describe('handles betting order correctly', () => {
      const ids = new Array(10).fill('').map((_, i) => `${i + 1}`)
      const room = startGameWithPlayers(ids)
      const { blind } = room.state

      it('10 player preflop bet', () => {
        sendMessage(room, '4', { action: 'call' })
        sendMessage(room, '5', { action: 'call' })
        sendMessage(room, '6', { action: 'bet', amount: 40 })

        expect(room.state.currentBet).toBe(40)

        sendMessage(room, '7', { action: 'call' })
        sendMessage(room, '8', { action: 'fold' })
        sendMessage(room, '9', { action: 'fold' })
        sendMessage(room, '10', { action: 'fold' })
        sendMessage(room, '1', { action: 'fold' })
        sendMessage(room, '2', { action: 'fold' })
        sendMessage(room, '3', { action: 'call' })
        sendMessage(room, '4', { action: 'fold' })
        sendMessage(room, '5', { action: 'call' })

        expect(getPlayer(room, '1').money).toBe(DEFAULT_MONEY)
        expect(getPlayer(room, '2').money).toBe(DEFAULT_MONEY - blind)
        expect(getPlayer(room, '3').money).toBe(DEFAULT_MONEY - blind * 4) // bb, called after bet
        expect(getPlayer(room, '4').money).toBe(DEFAULT_MONEY - blind * 2) // fold after calling bb
        expect(getPlayer(room, '5').money).toBe(DEFAULT_MONEY - blind * 4) // called bb then bet
        expect(getPlayer(room, '6').money).toBe(DEFAULT_MONEY - blind * 4) // bet 20 after bb
        expect(getPlayer(room, '7').money).toBe(DEFAULT_MONEY - blind * 4) // called 40
        expect(room.getActivePlayers().length).toBe(4)
        expect(room.state.currentBet).toBe(0)
        expect(room.state.pot).toBe(190)
        expect(room.state.cards.length).toBe(3)
      })

      it('remaining 4 player flop bet', () => {
        sendMessage(room, '5', { action: 'check' })
        sendMessage(room, '6', { action: 'check' })
        sendMessage(room, '7', { action: 'check' })
        sendMessage(room, '3', { action: 'bet', amount: 20 })
        sendMessage(room, '5', { action: 'bet', amount: 40 })
        sendMessage(room, '6', { action: 'bet', amount: 60 })
        sendMessage(room, '7', { action: 'bet', amount: 80 })

        expect(room.state.currentBet).toBe(80)

        sendMessage(room, '3', { action: 'fold' })
        sendMessage(room, '5', { action: 'call' })
        sendMessage(room, '6', { action: 'call' })
        sendMessage(room, '7', { action: 'call' })

        expect(room.state.pot).toBe(450)
        expect(room.state.cards.length).toBe(4)
      })

      it('remaining 3 player turn bet', () => {
        sendMessage(room, '5', { action: 'bet', amount: 20 })
        sendMessage(room, '6', { action: 'bet', amount: 40 })

        expect(room.state.currentBet).toBe(40)

        sendMessage(room, '7', { action: 'call' })
        sendMessage(room, '5', { action: 'fold' })

        expect(room.state.pot).toBe(530)
        expect(room.state.cards.length).toBe(5)
      })

      it('remaining 2 player river bet', () => {
        const [six, seven] = room.getActivePlayers()

        sendMessage(room, '6', { action: 'bet', amount: 20 })
        sendMessage(room, '7', { action: 'bet', amount: 40 })

        expect(room.state.currentBet).toBe(40)
        expect(room.state.pot).toBe(530)

        sendMessage(room, '6', { action: 'call' })

        const pot = room.pots[0]
        const winner = pot.winners[0]
        const loser = winner.id === '6' ? seven : six

        expect(winner.money).toBe(pot.winners.length === 2 ? 1105 : 1410)
        expect(loser.money).toBe(pot.winners.length === 2 ? 1105 : 800)
        expect(room.state.cards.length).toBe(0)
      })

      room.disconnect()
    })
    describe('handles sidepots correctly', () => {
      const spy = jest
        .spyOn(utils, 'shuffleCards')
        .mockImplementation(() =>
          [1, 13, 10, 11, 12, 9, 8, 7, 6].map((c, i) => new Card(c, 2, i)),
        )
      const ids = new Array(2).fill('').map((_, i) => `${i + 1}`)
      const room = startGameWithPlayers(ids)

      sendMessage(room, '1', { action: 'call' })
      sendMessage(room, '2', { action: 'check' })
      sendMessage(room, '1', { action: 'check' })
      sendMessage(room, '2', { action: 'check' })
      sendMessage(room, '1', { action: 'check' })
      sendMessage(room, '2', { action: 'check' })
      sendMessage(room, '1', { action: 'check' })
      sendMessage(room, '2', { action: 'check' })
      sendMessage(room, '1', { action: 'check' })

      expect(room.pots[0].winners.length).toBe(2)

      spy.mockRestore()
      room.disconnect()
    })
  })
})

// test turn order when betting in various configurations
// sidepot resolution
// winning hand calculation
