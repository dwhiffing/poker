import React from 'react'
import { Card } from './Card'

export const Player = ({ activeId, connected, id, money, status, cards }) =>
  id ? (
    <div
      className={`${activeId === id ? 'active' : ''} ${
        !connected ? 'disconnected' : ''
      }`}
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
      <div style={{ position: 'relative' }}>
        {cards.map((card, i) => (
          <Card key={card.index} x={20 * i} y={-50} scale={0.6} card={card} />
        ))}
      </div>
    </div>
  ) : (
    <div
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
