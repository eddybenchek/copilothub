import classNames from 'classnames';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNames('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}

export { Skeleton };

