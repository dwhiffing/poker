import React from 'react'
const SUITS = ['spades', 'clubs', 'hearts', 'diamonds']

export const Card = ({ card, x = 0, y = 0, style = {} }) => {
  const classes = [
    'card',
    `rank${card.value}`,
    card.isFinished && 'finished',
    card.canMove && 'can-move',
    card.isActive && 'disable-touch',
    card.isEmpty && 'empty',
    SUITS[card.suit],
  ]

  return (
    <div
      data-index={card.index}
      data-pileindex={card.pileIndex}
      className={classes.join(' ')}
      style={{ transform: `translate3d(${x}px, ${y}px, 0px)`, ...style }}
    >
      <div className="face" />
      <div className="back" />
    </div>
  )
}
