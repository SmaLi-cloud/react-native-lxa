import {useCallback, useEffect, useMemo, useRef, useReducer} from 'react';
import * as _ from 'lodash';
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
function useToRef(value) {
  const stateRef = useRef();
  stateRef.current = value;
  return stateRef;
}
const updateReducer = num => (num + 1) % 1000000;
function useUpdate() {
  const [, update] = useReducer(updateReducer, 0);

  return update;
}
function cancelRaf(rafId) {
  if (_.isNumber(rafId)) {
    requestAnimationFrame?.cancel(rafId);
  } else if (_.isArray(rafId)) {
    _.forEach(rafId, cancelRaf);
  }
}

const raf = callback => {
  const id = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(id);
};
export function parseTime(time) {
  const days = Math.floor(time / DAY);
  const hours = Math.floor((time % DAY) / HOUR);
  const minutes = Math.floor((time % HOUR) / MINUTE);
  const seconds = Math.floor((time % MINUTE) / SECOND);
  const milliseconds = Math.floor(time % SECOND);

  return {
    total: time,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
  };
}

function isSameTime(time1, time2, interval) {
  return Math.floor(time1 / interval) === Math.floor(time2 / interval);
}
export default function useCountdown(options) {
  const {
    value: valueProp,
    autostart: autostartProp,
    interval: intervalOption = 1000,
    onChange,
    onComplete,
  } = options;

  const update = useUpdate();

  const intervalRef = useToRef(Math.max(intervalOption, 1));

  const valueRef = useToRef(valueProp);

  const rafIdRef = useRef();

  const statusRef = useRef();

  const endTimeRef = useRef(0);

  const remainRef = useRef(valueProp);

  const current = parseTime(remainRef.current);
  // Set the current toRef when rerendering
  const currentRef = useToRef(current);

  const pause = useCallback(() => {
    statusRef.current = 'paused';
    if (rafIdRef.current) {
      cancelRaf(rafIdRef.current);
    }
  }, []);

  const getCurrentRemain = () => Math.max(endTimeRef.current - Date.now(), 0);

  const nextRemain = nextValue => {
    remainRef.current = nextValue;
    update();
    // current is immutable,
    // Use the currentRef value instead of the current
    onChange?.(currentRef.current);
    if (nextValue === 0) {
      pause();
      onComplete?.();
    }
  };

  function macroTick() {
    rafIdRef.current = raf(() => {
      // in case of call reset immediately after finish
      if (statusRef.current === 'started') {
        const remainRemain = getCurrentRemain();

        if (
          !isSameTime(remainRemain, remainRef.current, intervalRef.current) ||
          remainRemain === 0
        ) {
          nextRemain(remainRemain);
        }
        if (remainRef.current > 0) {
          macroTick();
        }
      }
    });
  }

  const start = useCallback(
    () => {
      if (statusRef.current !== 'started') {
        // If status is paused, set endTime to now() + remain.
        // If status is stopped, set endTime to now() + initial value.
        endTimeRef.current =
          Date.now() +
          (statusRef.current === 'paused'
            ? remainRef.current
            : valueRef.current);
        statusRef.current = 'started';
        macroTick();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const stop = useCallback(
    () => {
      pause();
      statusRef.current = 'stopped';
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const autostart = useCallback(
    () => {
      if (autostartProp) {
        start();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const reset = useCallback(
    () => {
      stop();
      autostart();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const restart = useCallback(
    () => {
      stop();
      start();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(
    () => autostart(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Update remain to next value
  useEffect(
    () => restart(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [valueProp],
  );

  return useMemo(
    () => ({
      current,
      start,
      reset,
      restart,
      pause,
      stop,
    }),
    [current, pause, reset, restart, start, stop],
  );
}
