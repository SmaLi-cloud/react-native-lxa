import {useCallback, useState} from 'react';

function useSetState(initialState) {
  const [state, setState] = useState(initialState);

  const setMergeState = useCallback(patch => {
    setState(prevState => {
      const newState = typeof patch === 'function' ? patch(prevState) : patch;
      return newState ? {...prevState, ...newState} : prevState;
    });
  }, []);

  const resetState = () => {
    setState(initialState);
  };

  return [state, setMergeState, resetState, setState];
}

export default useSetState;
