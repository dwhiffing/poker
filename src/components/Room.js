import React from 'react'
import { Seat } from './Seat'

export function Room({ getPlayer, room, canSit }) {
  const onSit = seatIndex =>
    canSit ? () => room.send({ action: 'sit', seatIndex }) : null
  return (
    <div className="player-container">
      <div className="flex-1">
        <div className="blank-seat" />
        <Seat player={getPlayer(0)} onSit={onSit(0)} />
        <Seat player={getPlayer(1)} onSit={onSit(1)} />
        <Seat player={getPlayer(2)} onSit={onSit(2)} />
        <div className="blank-seat" />
      </div>

      <div className="flex-1">
        <Seat player={getPlayer(9)} onSit={onSit(9)} />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Seat player={getPlayer(3)} onSit={onSit(3)} />
      </div>

      <div className="flex-1">
        <Seat player={getPlayer(8)} onSit={onSit(8)} />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Seat player={getPlayer(4)} onSit={onSit(4)} />
      </div>

      <div className="flex-1">
        <div className="blank-seat" />
        <Seat player={getPlayer(7)} onSit={onSit(7)} />
        <Seat player={getPlayer(6)} onSit={onSit(6)} />
        <Seat player={getPlayer(5)} onSit={onSit(5)} />
        <div className="blank-seat" />
      </div>
    </div>
  )
}
