import {useMemo, useRef} from 'react';

function useMemoizedFn(fn) {
  if (!(typeof fn === 'function')) {
    console.error('useMemoizedFn expected parameter is a function');
  }
  const fnRef = useRef(fn);
  fnRef.current = useMemo(() => fn, [fn]);
  const memoizedFn = useRef();
  if (!memoizedFn.current) {
    memoizedFn.current = function (that, ...args) {
      return fnRef.current.apply(that, ...args);
    };
  }
  return memoizedFn.current;
}

export default useMemoizedFn;
