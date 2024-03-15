import React from "react"

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'large' | 'medium'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({size, ...props}, ref) => {
  return (
    <input ref={ref} className={`border border-slate-200 drop-shadow-sm w-full rounded-md indent-[14px] outline-none  focus:ring-2 focus:ring-sky-400/40 focus:border-sky-500 transition-all ${size === 'large' ? 'h-12' : 'h-11'} aria-[invalid]:border-red-500`} {...props} />
  )
})

Input.displayName = 'Input'
