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
  document.documentElement.clientWidth <= 320 ||
  document.documentElement.clientHeight <= 320
