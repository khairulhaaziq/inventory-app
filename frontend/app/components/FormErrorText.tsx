import React from "react"

interface FormErrorTextProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const FormErrorText = React.forwardRef<HTMLParagraphElement, FormErrorTextProps>(({...props}, ref ) => {
  return (
    <p ref={ref} className="text-red-500" {...props} />
  )
})

FormErrorText.displayName = 'FormErrorText'
