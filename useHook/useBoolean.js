import {useState, useMemo} from 'react';

/**
 * 创建者：SmallLi
 * 创建时间：2023-05-15 15:00
 */

export default useBoolean = initialValue => {
  const [value, setValue] = useState(initialValue);

  const actions = useMemo(() => {
    return {
      toggle: () => setValue(v => !v),
      setTrue: () => setValue(true),
      setFalse: () => setValue(false),
    };
  }, []);

  return [value, actions];
};
