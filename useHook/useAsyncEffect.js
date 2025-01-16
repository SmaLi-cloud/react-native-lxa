import {useEffect, useState} from 'react';

const useAsyncEffect = (asyncFunction, dependencies = []) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await asyncFunction();
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return [loading, data];
};

export default useAsyncEffect;
