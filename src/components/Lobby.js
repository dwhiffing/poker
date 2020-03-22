import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Box, Typography, Button, TextField } from '@material-ui/core'
import { saveRoom, joinRoomWithReconnect } from '../utils'
import { Flex } from '.'
import faker from 'faker'

const AUTOCONNECT = true

export function Lobby({ setRoom }) {
  const [availableRooms, setAvailableRooms] = useState([])
  const [name, setName] = useState(
    localStorage.getItem('name') || faker.name.firstName(),
  )
  const intervalRef = useRef()
  const autoConnectAttempted = useRef(false)

  const createRoom = useCallback(
    async name => {
      const roomName = prompt('Room name?')
      const room = await window.colyseus.create('poker', { roomName })
      saveRoom(room, name)
      room.send({ action: 'setName', name })
      room.send({ action: 'sit' })
      setRoom(room)
    },
    [setRoom],
  )

  const joinRoom = useCallback(
    async (roomId, name) => {
      const room = await joinRoomWithReconnect(roomId)
      saveRoom(room, name)
      room.send({ action: 'setName', name })
      room.send({ action: 'sit' })
      setRoom(room)
    },
    [setRoom],
  )

  const getAvailableRooms = useCallback(async () => {
    const rooms = await window.colyseus.getAvailableRooms()
    setAvailableRooms(rooms)
  }, [])

  useEffect(() => {
    getAvailableRooms()
    intervalRef.current = setInterval(getAvailableRooms, 3000)
    return () => clearInterval(intervalRef.current)
  }, [getAvailableRooms])

  useEffect(() => {
    if (availableRooms) {
      const lastRoom = availableRooms.find(room =>
        localStorage.getItem(room.roomId),
      )

      if (AUTOCONNECT && lastRoom && !autoConnectAttempted.current) {
        autoConnectAttempted.current = true
        joinRoom(lastRoom.roomId, name)
      }
    }
  }, [availableRooms, joinRoom, name])

  return (
    <Flex variant="column center" style={{ height: '100vh' }}>
      <TextField
        placeholder="Enter name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      <Typography variant="h5">Available Tables:</Typography>

      <Flex flex={0} variant="column center" style={{ minHeight: 200 }}>
        {availableRooms.length === 0 && <EmptyState />}

        {availableRooms.map(room => (
          <RoomListItem
            key={room.roomId}
            room={room}
            onClick={() => joinRoom(room.roomId, name)}
          />
        ))}
      </Flex>

      <Button variant="contained" onClick={() => createRoom(name)}>
        Create room
      </Button>
    </Flex>
  )
}

const RoomListItem = ({ room, onClick }) => (
  <Box>
    <Typography
      style={{ cursor: 'pointer', textDecoration: 'underline' }}
      onClick={onClick}
    >
      {room.metadata.roomName || room.roomId}
    </Typography>
  </Box>
)

const EmptyState = () => <Typography>No rooms available</Typography>
