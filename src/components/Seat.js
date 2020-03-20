import React from 'react'
import { Card } from './Card'

export const Seat = ({ activeId, clientId, onSit, player = {} }) => {
  const {
    id,
    remainingConnectionTime,
    remainingMoveTime,
    connected,
    money,
    status,
    cards,
    dealer,
  } = player

  return id ? (
    <div
      className={`${activeId === id ? 'active' : ''} ${
        clientId === id ? 'is-client' : ''
      } ${!connected ? 'disconnected' : ''}`}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p>{id}</p>

      <p>${money}</p>

      <p>{status}</p>

      {dealer && <p>dealer</p>}

      {activeId === id && <p>{remainingMoveTime} seconds to play</p>}

      {!connected && <p>{remainingConnectionTime} seconds to reconnect</p>}

      <div style={{ position: 'relative' }}>
        {cards.map((card, i) => (
          <Card key={i} x={20 * i} y={0} scale={0.6} card={card} />
        ))}
      </div>
    </div>
  ) : (
    <div
      onClick={onSit}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p>Empty seat</p>
    </div>
  )
}
