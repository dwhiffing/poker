import { Hand } from 'pokersolver'

export const maskCards = (player, id) => ({
  ...player,
  // TODO: hide cards from server
  cards:
    player.id === id || player.showCards
      ? player.cards
      : player.cards.map(c => ({})),
})

export const joinRoomWithReconnect = async roomId => {
  let room,
    sessionId = localStorage.getItem(roomId)

  if (sessionId) {
    try {
      room = await window.colyseus.reconnect(roomId, sessionId)
    } catch (e) {}
  }

  room = room || (await window.colyseus.joinById(roomId))

  return room
}

export const saveRoom = (room, name) => {
  localStorage.setItem('name', name)
  localStorage.setItem(room.id, room.sessionId)
}

export const getIsSmall = () =>
  document.documentElement.clientWidth <= 500 ||
  document.documentElement.clientHeight <= 500

export const getIsLarge = () =>
  document.documentElement.clientWidth >= 700 &&
  document.documentElement.clientHeight >= 700

export const SUITS = ['s', 'c', 'h', 'd']
export const VALUES = [
  0,
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
]

export const getHandLabel = (player, cards) => {
  if (cards.length === 0) {
    return ''
  }
  const cardsString = cards.map(c => `${VALUES[c.value]}${SUITS[c.suit]}`)
  const hand = player.cards
    .map(c => `${VALUES[c.value]}${SUITS[c.suit]}`)
    .concat(cardsString)
  const value = Hand.solve(hand)
  return value.descr
}

export const getIsPortrait = () =>
  document.documentElement.clientWidth < document.documentElement.clientHeight
