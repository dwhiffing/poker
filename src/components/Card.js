import React from 'react'
const SUITS = ['spades', 'clubs', 'hearts', 'diamonds']

export const Card = ({ card, x = 0, y = 0, scale = 1, style = {} }) => {
  const classes = [
    'card',
    card && `rank${card.value}`,
    !card.value && 'finished',
    card && SUITS[card.suit],
  ]

  return (
    <div
      className={classes.join(' ')}
      style={{
        transform: `translate3d(${x}px, ${y}px, 0px) scale(${scale})`,
        ...style,
      }}
    >
      <div className="face" />
      <div className="back" />
    </div>
  )
}
