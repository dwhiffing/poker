export const maskCards = (player, id) => ({
  ...player,
  cards: player.id === id ? player.cards : player.cards.map(c => ({})),
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
