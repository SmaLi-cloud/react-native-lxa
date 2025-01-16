import {useState, useMemo} from 'react';

/**
 * 创建者：SmallLi
 * 创建时间：2023-05-15 15:49
 */

function useSet(initialSet = []) {
  const [set, setSet] = useState(new Set(initialSet));

  const arr = useMemo(() => {
    return Array.from(set);
  }, [set]);

  const addItem = item => {
    setSet(prevSet => new Set([...prevSet, item]));
  };
  const setValue = newArr => {
    setSet(() => new Set([...newArr]));
  };

  const removeItem = item => {
    setSet(prevSet => {
      const newSet = new Set(prevSet);
      newSet.delete(item);
      return newSet;
    });
  };

  const toggleItem = item => {
    setSet(prevSet => {
      const newSet = new Set(prevSet);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const clearSet = () => {
    setSet(new Set());
  };

  return [
    set,
    {
      addItem,
      removeItem,
      toggleItem,
      clearSet,
      setValue,
    },
    arr,
  ];
}
export default useSet;
