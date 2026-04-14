import type { MouseEvent, PropsWithChildren } from 'react';

import { useNavigation } from '../hooks/useNavigation';

type AppLinkProps = PropsWithChildren<{
  to: string;
  className?: string;
  title?: string;
}>;

export function AppLink({ children, className, title, to }: AppLinkProps) {
  const { navigate } = useNavigation();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    navigate(to);
  };

  return (
    <a className={className} href={to} onClick={handleClick} title={title}>
      {children}
    </a>
  );
}
