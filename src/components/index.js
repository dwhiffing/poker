import React from 'react'
import { Box, Chip } from '@material-ui/core'
import numeral from 'numeral'

export const Flex = ({
  variant,
  flex = 1,
  children,
  style: passedStyles = {},
  ...props
}) => {
  let style = { display: 'flex', flex }

  if (/column/.test(variant)) {
    style.flexDirection = 'column'
  }

  if (/justify-between/.test(variant)) {
    style.justifyContent = 'space-between'
  }

  if (/align-center/.test(variant)) {
    style.alignItems = 'center'
  } else if (/justify-center/.test(variant)) {
    style.justifyContent = 'center'
  } else if (/center/.test(variant)) {
    style.justifyContent = 'center'
    style.alignItems = 'center'
  }

  return (
    <Box style={{ ...style, ...passedStyles }} {...props}>
      {children}
    </Box>
  )
}

export function Chips({ amount, ...props }) {
  return (
    <Chip
      {...props}
      label={numeral(amount)
        .format('(0[.]00a)')
        .toUpperCase()}
    />
  )
}
