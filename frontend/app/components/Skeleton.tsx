export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <p
      className={`animate-pulse rounded-full bg-black/10 ${className}`}
      {...props}
    />
  );
}
