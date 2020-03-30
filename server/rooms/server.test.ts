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

  describe('onJoin', () => {
    it('adds a player', () => {
      room.onJoin({ sessionId: 'foo' })

      expect(room.state.players.length).toBe(1)
    })
    it('adds a player only once', () => {
      room.onJoin({ sessionId: 'foo' })
      room.onJoin({ sessionId: 'foo' })

      expect(room.state.players.length).toBe(1)
    })
    it('makes the first player an admin', () => {
      room.onJoin({ sessionId: 'foo' })

      expect(room.state.players[0].isAdmin).toBe(true)
    })
    it('makes only the first player an admin', () => {
      room.onJoin({ sessionId: 'foo' })
      room.onJoin({ sessionId: 'bar' })
      room.onJoin({ sessionId: 'baz' })

      expect(room.state.players.length).toBe(3)
      expect(room.state.players.filter(p => p.isAdmin).length).toBe(1)
    })
  })

  describe('onMessage', () => {
    it('does nothing if player does not exist', () => {
      const result = room.onMessage({ sessionId: 'foo' })
      expect(result).toBe(null)
    })

    it('allows them to check if it is their turn', () => {
      room.onJoin({ sessionId: 'foo' })
      room.onJoin({ sessionId: 'bar' })
      const func = jest.spyOn(room, 'doNextTurn')
      room.setCurrentTurn({ id: 'foo', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'check' })

      room.setCurrentTurn({ id: 'bar', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'check' })

      expect(func).toHaveBeenCalledTimes(1)
    })

    it('allows them to call if it is their turn', () => {
      room.onJoin({ sessionId: 'foo' })
      room.onJoin({ sessionId: 'bar' })
      const func = jest.spyOn(room, 'doNextTurn')
      room.setCurrentTurn({ id: 'foo', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'call' })

      room.setCurrentTurn({ id: 'bar', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'call' })

      expect(func).toHaveBeenCalledTimes(1)
    })

    it('allows them to fold if it is their turn', () => {
      room.onJoin({ sessionId: 'foo' })
      room.onJoin({ sessionId: 'bar' })
      const func = jest.spyOn(room, 'doNextTurn')
      room.setCurrentTurn({ id: 'foo', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'fold' })

      room.setCurrentTurn({ id: 'bar', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'fold' })

      expect(func).toHaveBeenCalledTimes(1)
    })

    it('allows them to bet if it is their turn', () => {
      room.onJoin({ sessionId: 'foo' })
      room.onJoin({ sessionId: 'bar' })
      const func = jest.spyOn(room, 'doNextTurn')
      room.setCurrentTurn({ id: 'foo', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'bet' })

      room.setCurrentTurn({ id: 'bar', seatIndex: 0 })
      room.onMessage({ sessionId: 'foo' }, { action: 'bet' })

      expect(func).toHaveBeenCalledTimes(1)
    })

    test.todo('allows them to deal if dealing is valid')
    test.todo('allows them to sit if there is an available seat')
    test.todo('allows them to set their name')
  })

  describe('onLeave', () => {
    test.todo('does nothing if the player cannot be found')
    test.todo('unlocks the room')
    test.todo('removes the player if they left manually')
    test.todo('waits for reconnect if they did not leave manually')
  })

  describe('removePlayer', () => {
    test.todo('adds their current bet to the pot')
    test.todo('removes their cards')
    test.todo('ends the game if there is only one player left')
    test.todo('triggers the next turn if it was their turn')
    test.todo('triggers the next turn if it was their turn')
  })

  describe('addBot', () => {
    it('adds a bot', () => {
      room.addBot()
      expect(room.state.players.length).toBe(1)
    })
    it('does not add a bot if the room is full', () => {
      for (let i = 0; i < 12; i++) {
        room.addBot()
      }
      expect(room.state.players.length).toBe(10)
    })
  })

  describe('removeBot', () => {
    it('removes a bot if one is present', () => {
      room.addBot()
      room.addBot()
      room.addBot()
      room.removeBot()
      expect(room.state.players.length).toBe(2)
    })
    it('does not remove a player', () => {
      room.onJoin({ sessionId: 'foo' })
      room.onJoin({ sessionId: 'bar' })
      room.onJoin({ sessionId: 'baz' })
      room.removeBot()
      expect(room.state.players.length).toBe(3)
    })
  })

  // describe('doPlayerMove', () => {})
  // describe('doBotMove', () => {})
  describe('sitInAvailableSeat', () => {
    test.todo('sits in available seat')
  })
})
