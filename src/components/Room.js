import React from 'react'
import { Seat } from './Seat'

const TURN_ORDER = [0, 1, 2, 4, 6, 9, 8, 7, 5, 3]
export function Room({ activeId, clientId, players = [], room }) {
  const onSit = seatIndex => {
    room.send({ action: 'sit', seatIndex })
  }
  return (
    <div className="player-container">
      <div className="flex-1">
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          clientId={clientId}
          seatIndex={0}
          player={players.find(p => p.seatIndex === 0)}
          onSit={() => onSit(0)}
        />
        <Seat
          activeId={activeId}
          clientId={clientId}
          seatIndex={1}
          player={players.find(p => p.seatIndex === 1)}
          onSit={() => onSit(1)}
        />
        <Seat
          activeId={activeId}
          clientId={clientId}
          seatIndex={2}
          player={players.find(p => p.seatIndex === 2)}
          onSit={() => onSit(2)}
        />
        <div className="blank-seat" />
      </div>

      <div className="flex-1">
        <Seat
          activeId={activeId}
          clientId={clientId}
          seatIndex={9}
          player={players.find(p => p.seatIndex === 9)}
          onSit={() => onSit(9)}
        />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          seatIndex={3}
          clientId={clientId}
          player={players.find(p => p.seatIndex === 3)}
          onSit={() => onSit(3)}
        />
      </div>

      <div className="flex-1">
        <Seat
          activeId={activeId}
          seatIndex={8}
          clientId={clientId}
          player={players.find(p => p.seatIndex === 8)}
          onSit={() => onSit(8)}
        />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          seatIndex={4}
          clientId={clientId}
          player={players.find(p => p.seatIndex === 4)}
          onSit={() => onSit(4)}
        />
      </div>

      <div className="flex-1">
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          clientId={clientId}
          seatIndex={7}
          player={players.find(p => p.seatIndex === 7)}
          onSit={() => onSit(7)}
        />
        <Seat
          activeId={activeId}
          clientId={clientId}
          player={players.find(p => p.seatIndex === 6)}
          seatIndex={6}
          onSit={() => onSit(6)}
        />
        <Seat
          activeId={activeId}
          clientId={clientId}
          player={players.find(p => p.seatIndex === 5)}
          seatIndex={5}
          onSit={() => onSit(5)}
        />
        <div className="blank-seat" />
      </div>
    </div>
  )
}
