import React from 'react'
import { Player } from './Player'

export function Players({ activeId, players = [] }) {
  return (
    <div className="player-container">
      <div className="flex-1">
        <div className="blank-seat" />
        <Player activeId={activeId} {...players[0]} />
        <Player activeId={activeId} {...players[1]} />
        <Player activeId={activeId} {...players[2]} />
        <div className="blank-seat" />
      </div>

      <div className="flex-1">
        <Player activeId={activeId} {...players[3]} />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Player activeId={activeId} {...players[4]} />
      </div>

      <div className="flex-1">
        <Player activeId={activeId} {...players[5]} />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <div className="blank-seat" />
        <Player activeId={activeId} {...players[6]} />
      </div>

      <div className="flex-1">
        <div className="blank-seat" />
        <Player activeId={activeId} {...players[7]} />
        <Player activeId={activeId} {...players[8]} />
        <Player activeId={activeId} {...players[9]} />
        <div className="blank-seat" />
      </div>
    </div>
  )
}
