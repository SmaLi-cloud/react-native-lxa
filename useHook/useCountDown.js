import dayjs from 'dayjs';
import { useEffect, useMemo, useState, useRef } from 'react';

/**
 * 创建人：smallLi
 * 创建时间：2023-15-16 13:37
 */

function useLatest(value) {
    const ref = useRef(value);
    ref.current = value;
    return ref;
}

const calcLeft = (target) => {
    if (!target) {
        return 0;
    }
    const left = dayjs(target).valueOf() - Date.now();
    return left < 0 ? 0 : left;
};

const parseMs = (milliseconds) => {
    return {
        days: Math.floor(milliseconds / 86400000),
        hours: Math.floor(milliseconds / 3600000) % 24,
        minutes: Math.floor(milliseconds / 60000) % 60,
        seconds: Math.floor(milliseconds / 1000) % 60,
        milliseconds: Math.floor(milliseconds) % 1000,
    };
};

const useCountdown = (options = {}) => {
    const { leftTime, targetDate, interval = 1000, onEnd } = options || {};

    const target = useMemo(() => {
        if (leftTime) {
            return typeof (leftTime) === 'number' && leftTime > 0 ? Date.now() + leftTime : undefined;
        } else {
            return targetDate || undefined;
        }
    }, [leftTime, targetDate]);

    const [timeLeft, setTimeLeft] = useState(() => calcLeft(target));

    const onEndRef = useLatest(onEnd);

    useEffect(() => {
        if (!target) {
            // for stop
            setTimeLeft(0);
            return;
        }
        // 立即执行一次
        setTimeLeft(calcLeft(target));

        const timer = setInterval(() => {
            const targetLeft = calcLeft(target);
            setTimeLeft(targetLeft);
            if (targetLeft === 0) {
                clearInterval(timer);
                if (onEndRef.current) {
                    onEndRef.current()
                }
            }
        }, interval);

        return () => clearInterval(timer);
    }, [target, interval,onEndRef]);

    const formattedRes = useMemo(() => parseMs(timeLeft), [timeLeft]);

    return [timeLeft, formattedRes];
};

export default useCountdown;



