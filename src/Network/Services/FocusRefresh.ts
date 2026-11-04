import {useEffect, useRef} from 'react';
import {useIsFocused} from '@react-navigation/native';

type FetchOpts = {silent?: boolean};
export const useFocusRefresh = (
  fetchFn: (opts?: FetchOpts) => void,
  deps: any[] = [],
) => {
  const isFocused = useIsFocused();
  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchFn({silent: false});
  }, deps);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (isFocused) {
      fetchFn({silent: true});
    }
  }, [isFocused]);
};
