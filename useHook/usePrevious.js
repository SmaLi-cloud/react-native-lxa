import { useRef } from "react"

/**
 * 创建者：SmallLi
 * 创建时间：2023-05-15 15:11
 */

function usePrevious(value) {
  const currentRef = useRef(value)
  const previousRef = useRef()

  if (currentRef.current !== value) {
    previousRef.current = currentRef.current
    currentRef.current = value
  }

  return previousRef.current
}

export default usePrevious
