import React from 'react'
import { Seat } from './Seat'
import { Card } from './Card'

export function Room({ getPlayer, room, cards, canSit }) {
  const onSit = seatIndex =>
    canSit ? () => room.send({ action: 'sit', seatIndex }) : null
  return (
    <div className="player-container">
      <div className="flex-1">
        <div className="blank-seat" />
        <Seat position="top" player={getPlayer(0)} onSit={onSit(0)} />
        <Seat position="top" player={getPlayer(1)} onSit={onSit(1)} />
        <Seat position="top" player={getPlayer(2)} onSit={onSit(2)} />
        <div className="blank-seat" />
      </div>

      <div className="flex-1" style={{ flex: 2 }}>
        <div className="flex-1" style={{ flexDirection: 'column' }}>
          <Seat position="left" player={getPlayer(9)} onSit={onSit(9)} />
          <Seat position="left" player={getPlayer(8)} onSit={onSit(8)} />
        </div>
        <div
          className="flex-1"
          style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}
        >
          {cards.map((card, i) => (
            <Card key={card.index} card={card} style={{ margin: 5 }} />
          ))}
        </div>
        <div className="flex-1" style={{ flexDirection: 'column' }}>
          <Seat position="right" player={getPlayer(3)} onSit={onSit(3)} />
          <Seat position="right" player={getPlayer(4)} onSit={onSit(4)} />
        </div>
      </div>

      {/* <div className="flex-1">
      </div> */}

      <div className="flex-1">
        <div className="blank-seat" />
        <Seat position="bottom" player={getPlayer(7)} onSit={onSit(7)} />
        <Seat position="bottom" player={getPlayer(6)} onSit={onSit(6)} />
        <Seat position="bottom" player={getPlayer(5)} onSit={onSit(5)} />
        <div className="blank-seat" />
      </div>
    </div>
  )
}
