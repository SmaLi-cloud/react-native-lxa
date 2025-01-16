import {useState} from 'react';
import userHelper from '../helper/userHelper';
import Toast from '../utils/toast';
import useAsyncEffect from './useAsyncEffect';

export async function hasPermisson(initialState) {
  const isArr = Array.isArray(initialState);
  let obj = {};
  const isBossAdmin = await userHelper.isBossAdmin();
  if (isBossAdmin) {
    // 老板或者超管 拥有所有权限
    if (isArr) {
      for (const key of initialState) {
        obj[key] = true;
      }
      return obj;
    } else {
      return true;
    }
  }
  const staffInfo = await userHelper.getStaffInfo();
  let permissionInfo = await userHelper.getStaffPermission();
  permissionInfo = new Set(permissionInfo.map(item => item.front_end_tag));
  staffInfo.is_admin && permissionInfo.add('is_admin'); // 管理员
  staffInfo.is_chat && permissionInfo.add('is_chat'); // im 聊天
  // staffInfo.is_show_cost && permissionInfo.add('is_show_cost'); //显示成本价
  if (isArr) {
    for (const key of initialState) {
      // 此处刘强变更权限配置，需转换
      if (key === 'is_show_cost') {
        obj[key] = permissionInfo.has('goods_cost_price');
        continue;
      }
      obj[key] = permissionInfo.has(key);
    }
    return obj;
  } else {
    // 此处刘强变更权限配置，需转换
    if (initialState === 'is_show_cost') {
      return permissionInfo.has('goods_cost_price');
    }
    return permissionInfo.has(initialState);
  }
}

export const noPermissionToast = text => {
  Toast.show(text || '暂无此功能权限，请联系管理员开通权限');
};

function usePermission(initialState) {
  const isArr = Array.isArray(initialState);
  const [state, setState] = useState(isArr ? {} : false);

  useAsyncEffect(async () => {
    let permissions = await hasPermisson(initialState);
    setState(permissions);
  }, []);

  return [state];
}
export default usePermission;
