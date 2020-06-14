import React, { useRef, useEffect } from 'react'

const styles = {
  border: '16px solid #f3f3f3',
  borderTop: '16px solid #3498db',
  borderRadius: '50%',
  width: '120px',
  height: '120px',
}

export function LoadingIcon(): JSX.Element {
  const spinner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    spinner?.current?.animate(
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      {
        easing: 'linear',
        duration: 2000,
        iterations: Infinity,
      }
    )
  })

  return <div ref={spinner} style={styles}></div>
}
