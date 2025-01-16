import { useEffect, useRef } from "react";

function useUpdateEffect(effect, deps) {
    const isMounted = useRef(false)

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
        } else {
            return effect();
        }ß
    }, deps); // eslint-disable-next-line no-empty
}
export default useUpdateEffect