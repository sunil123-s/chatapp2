import { useState } from "react"

const useToggle = () => {
    const [isOpen, setisOpen] = useState(false)
    
    const toggle = () => setisOpen((prev) => !prev)
    const open = () => setisOpen(true)
    const close = () => setisOpen(false)

  return {toggle,open,close,isOpen}
}

export default useToggle
