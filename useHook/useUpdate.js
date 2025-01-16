import { useCallback, useState } from 'react';
/**
 * 创建者：SmallLi
 * 创建时间：2023-05-16 14:59
 */
function useUpdate() {
    const [, setState] = useState({});

    return useCallback(() => setState({}), []);
};

export default useUpdate;