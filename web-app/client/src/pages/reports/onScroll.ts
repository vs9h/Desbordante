import { ScrollDirection } from '@components/ScrollableNodeTable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { data } from './AFDFakeData';

const defaultLimit = 150;
const defaultOffsetDifference = 50;

export const Scrolling = () => {
  const shouldIgnoreScrollEvent = useRef(false);

  const [limit, setLimit] = useState(defaultLimit);

  useEffect(() => {
    shouldIgnoreScrollEvent.current = false;
  }, [shouldIgnoreScrollEvent]);

  return useCallback(
    (direction: ScrollDirection) => {
      if (!shouldIgnoreScrollEvent.current && direction === 'down') {
        shouldIgnoreScrollEvent.current = true;
        if (limit < data.result.clustersTotalCount) {
          setLimit((limit) => limit + defaultOffsetDifference);
        } else {
          shouldIgnoreScrollEvent.current = false;
        }
      }
    },
    [limit],
  );
};
