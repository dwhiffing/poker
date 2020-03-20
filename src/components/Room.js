import React from 'react'
import { Seat } from './Seat'

export function Room({ activeId, players = [], room }) {
  const onSit = seatIndex => {
    room.send({ action: 'sit', seatIndex })
  }
  return (
    <div className="player-container">
      <div className="flex-1">
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 0)}
          onSit={() => onSit(0)}
        />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 1)}
          onSit={() => onSit(1)}
        />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 2)}
          onSit={() => onSit(2)}
        />
        <div className="blank-seat" />
      </div>

      <div className="flex-1">
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 3)}
          onSit={() => onSit(3)}
        />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 4)}
          onSit={() => onSit(4)}
        />
      </div>

      <div className="flex-1">
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 5)}
          onSit={() => onSit(5)}
        />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 6)}
          onSit={() => onSit(6)}
        />
      </div>

      <div className="flex-1">
        <div className="blank-seat" />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 7)}
          onSit={() => onSit(7)}
        />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 8)}
          onSit={() => onSit(8)}
        />
        <Seat
          activeId={activeId}
          player={players.find(p => p.seatIndex === 9)}
          onSit={() => onSit(9)}
        />
        <div className="blank-seat" />
      </div>
    </div>
  )
}
