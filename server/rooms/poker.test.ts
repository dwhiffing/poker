import { Poker } from './poker'

let room
describe('Poker', () => {
  beforeAll(() => {
    room = new Poker()
    room.onCreate({})
  })

  afterAll(() => {
    room.disconnect()
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
})
