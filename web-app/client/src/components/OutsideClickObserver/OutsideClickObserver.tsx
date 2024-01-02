import { HTMLProps, useEffect, useRef } from 'react';
import { FCWithChildren } from 'types/react';

interface Props extends HTMLProps<HTMLDivElement> {
  onClickOutside?: () => void;
}

const OutsideClickObserver: FCWithChildren<Props> = ({
  onClickOutside,
  children,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const didClickStartOutside = useRef(false);

  useEffect(() => {
    const isOutside = (element: Element) => {
      if (!containerRef.current) {
        return false;
      }

      return !containerRef.current.contains(element);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      didClickStartOutside.current = isOutside(event.target);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (didClickStartOutside.current && isOutside(event.target)) {
        onClickOutside?.();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onClickOutside]);

  return (
    <div ref={containerRef} {...props}>
      {children}
    </div>
  );
};

export default OutsideClickObserver;
