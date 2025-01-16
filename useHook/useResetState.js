import { useState } from 'react';
const useResetState = (initialValue) => {
    const [state, setState] = useState(initialValue);

    const resetState = () => {
        setState(initialValue);
    };

    return [state, setState, resetState];
}
export default useResetState