import { useRef, useEffect } from 'react';
import isEqual from 'lodash/isEqual';


const depsEqual = (aDeps = [], bDeps = []) => {
    return isEqual(aDeps, bDeps);
};

function useDeepCompareEffect(effect, deps) {
    const ref = useRef();
    const signalRef = useRef(false);

    if (deps === undefined || !depsEqual(deps, ref.current)) {
        ref.current = deps;
        signalRef.current = !signalRef.current;
    }
    useEffect(effect, [signalRef.current]);
};

export default useDeepCompareEffect