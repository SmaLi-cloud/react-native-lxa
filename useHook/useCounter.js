import { useState } from "react";


function getTargetValue(val, options = {}) {
    const { min, max } = options;
    let target = val;
    if (typeof (max) === 'number') {
        target = Math.min(max, target);
    }
    if (typeof (min) === 'number') {
        target = Math.max(min, target);
    }
    return target;
}

function useCounter(initialValue, options={min:0}) {
    const { min, max } = options;

    const [current, setCurrent] = useState(() => {
        return getTargetValue(initialValue, {
            min,
            max,
        });
    });
    const setValue = (value) => {
        setCurrent((c) => {
            const target = typeof(value) === 'number' ? value : value(c);
            return getTargetValue(target, {
                max,
                min,
            });
        });
    };
    const inc = (delta = 1) => {
        setValue((c) => c + delta);
    };

    const dec = (delta = 1) => {
        setValue((c) => c - delta);
    };

    const set = (value) => {
        setValue(value);
    };

    const reset = () => {
        setValue(initialValue);
    };

    return [
        current,
        {
            inc,
            dec,
            set,
            reset
        }
    ]
}
export default useCounter