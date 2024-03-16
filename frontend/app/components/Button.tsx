import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  size?: 'large' | 'medium'
  variant?: 'primary' | 'secondary' | 'danger'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({text, size='medium', variant='primary', children, className, ...props}, ref) => {
  return (
    <button ref={ref} className={
      `font-medium uppercase px-4 rounded-md tracking-widest transition-all outline-none focus:outline-sky-500 ${
        size === 'large' ? 'h-14' : 'h-11 text-[14px]'} ${
          variant === 'primary' ? ' bg-sky-500 text-white hover:bg-sky-400 active:bg-sky-400' :
          variant === 'secondary' ? 'text-sky-500 border-sky-500 border-[1.5px] hover:text-sky-400 active:text-sky-400 hover:border-sky-400 active:border-sky-400' :
          variant === 'danger' ? 'bg-red-500 text-white' :''
        } ${className}`} {...props}>
      {text} {children}
    </button>
  )
})

Button.displayName = 'Button'
