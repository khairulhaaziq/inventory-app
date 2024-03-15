interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = ({className, ...props}: CardProps ) => {
  return (
    <div className={`bg-white shadow-[0px_2px_2px_0_rgba(0,0,0,0.08)] rounded-lg overflow-hidden ${className}`} {...props} />
  )
}
