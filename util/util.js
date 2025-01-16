import {
  Dimensions,
  Linking,
  NativeModules,
  PermissionsAndroid,
  PixelRatio,
  Platform,
} from 'react-native';
import * as _ from 'lodash';

export const deviceWidth = Dimensions.get('window').width; //设备的宽度
export const deviceHeight = Dimensions.get('window').height; //设备的高度 皆为无刘海高度（含安全区及全面屏模式
export const deviceHeightAll = Dimensions.get('screen').height; //皆为有刘海高度（含安全区及全面屏模式

let pixelRatio = PixelRatio.get(); //当前设备的像素密度
let screenPxH = PixelRatio.getPixelSizeForLayoutSize(deviceHeight);

// 安卓存储权限校验
async function hasAndroidPermission() {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);
  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
}

/**
 * @param size px
 * @returns number dp
 */
export function setSpText(size) {
  return (size * deviceWidth) / 750;
}

/**
 *
 * @param size px
 * @returns number dp
 */
export function scaleSizeW(size) {
  return ((size ?? 0) * deviceWidth) / 750;
}
export function scaleHtml(size) {
  const pxScale = 1 / PixelRatio.get();
  return size * pxScale;
}

export function scaleSizeH(size) {
  var scaleHeight = (size * screenPxH) / 1334;
  size = Math.round(scaleHeight / pixelRatio + 0.5);
  return size;
}

// 业务类型
export function getType(value) {
  let type = value || '无';
  switch (true) {
    case value === 1:
      type = '回收';
      break;
    case value === 2:
      type = '寄卖';
      break;
    case value === 3:
      type = '鉴定';
      break;
  }
  return type;
}

// 新旧程度
export function getLevel(value) {
  let type = value || '无';
  switch (true) {
    case value === 1000:
      type = '全新/N级';
      break;
    case value === 990:
      type = '99新/S级';
      break;
    case value === 980:
      type = '98新/A级';
      break;
    case value === 950:
      type = '95新/B级';
      break;
    case value === 900:
      type = '90新/C级';
      break;
    case value === 850:
      type = '85新/D级';
      break;
  }
  return type;
}
export function formatPrice(num, flag) {
  if (flag && (flag + '')?.includes('*')) {
    return flag;
  }
  if (!num) {
    return 0;
  }
  let str = num?.toString(); // 将数值转换成字符串
  if (str.length <= 3) {
    return str;
  } // 如果小于三位数就直接放回字符串
  let integer = []; // 用于存放整数数组
  let floater = []; // 用于存放小数数组
  // 判断字符串是整数还是小数
  if (!str.includes('.')) {
    integer = str.split('');
  } else {
    // 传入的有小数
    //有小数点，保留至小数点后两位
    let dotindex = str.indexOf('.');
    let len = str.length;
    if (len - dotindex >= 3) {
      str = str.substring(0, dotindex + 3);
    }
    let ary = str.split('.'); // 将字符串以.形式分割成左右数组
    integer = ary[0].split(''); // 整数
    floater = ary[1]; // 小数
  }
  let count = 0; // 循环次数
  integer.length % 3 === 0
    ? (count = integer.length / 3 - 1)
    : (count = Math.floor(integer.length / 3));
  // 开始循环
  for (let i = 0; i < count; i++) {
    integer.splice(integer.length - (i + 1) * 3 - i, 0, ',');
  }
  let finalStr = ''; // 最终结果
  // 判断小数数组中是否存在数据，如果有数据则拼接小数，如果没有就返回整数数组
  floater.length === 0
    ? (finalStr = integer.join(''))
    : (finalStr = integer.join('') + '.' + floater);
  return finalStr;
}

export function formatPriceNew(num) {
  if (!num) {
    return 0;
  }
  if (+num < 100000) {
    let str = parseInt(num, 10)?.toString(); // 将数值转换成字符串
    if (str.length <= 3) {
      return str;
    } // 如果小于三位数就直接放回字符串
    let integer = []; // 用于存放整数数组
    let floater = []; // 用于存放小数数组
    integer = str.split('');
    let count = 0; // 循环次数
    integer.length % 3 === 0
      ? (count = integer.length / 3 - 1)
      : (count = Math.floor(integer.length / 3));
    // 开始循环
    for (let i = 0; i < count; i++) {
      integer.splice(integer.length - (i + 1) * 3 - i, 0, ',');
    }
    let finalStr = ''; // 最终结果
    // 判断小数数组中是否存在数据，如果有数据则拼接小数，如果没有就返回整数数组
    floater.length === 0
      ? (finalStr = integer.join(''))
      : (finalStr = integer.join('') + '.' + floater);
    return finalStr;
  } else {
    // 将数字除以10000得到以“万”为单位的值
    let result = num / 10000;
    // 使用toFixed(2)来保留两位小数
    return result.toFixed(2) + '万';
  }
}

//超过100就显示万单位，保留1位小数字，超出10完，不显示小数
export function formatPriceNew2(num) {
  if (!num) {
    return 0;
  }
  if (+num < 100) {
    let str = parseInt(num, 10)?.toString(); // 将数值转换成字符串
    if (str.length <= 3) {
      return str;
    } // 如果小于三位数就直接放回字符串
    let integer = []; // 用于存放整数数组
    let floater = []; // 用于存放小数数组
    integer = str.split('');
    let count = 0; // 循环次数
    integer.length % 3 === 0
      ? (count = integer.length / 3 - 1)
      : (count = Math.floor(integer.length / 3));
    // 开始循环
    for (let i = 0; i < count; i++) {
      integer.splice(integer.length - (i + 1) * 3 - i, 0, ',');
    }
    let finalStr = ''; // 最终结果
    // 判断小数数组中是否存在数据，如果有数据则拼接小数，如果没有就返回整数数组
    floater.length === 0
      ? (finalStr = integer.join(''))
      : (finalStr = integer.join('') + '.' + floater);
    return finalStr;
  } else {
    // 将数字除以10000得到以“万”为单位的值
    let result = num / 10000;
    // 使用toFixed(2)来保留两位小数
    if (result > 10) {
      return result.toFixed(0) + '万';
    } else {
      return result.toFixed(1) + '万';
    }
  }
}

export function formatMonth(t) {
  if (t) {
    const time = t.split(' ')[0];
    const arr = time.split('-');
    return arr[0] + '-' + arr[1];
  } else {
    return '--';
  }
}

// export function formatMonth(t) {
//   if (t) {
//     const time = t.split(' ')[0];
//     const arr = time.split('-');
//     return arr[0] + '-' + arr[1];
//   } else {
//     return '--';
//   }
// }

export function isANDROID() {
  if (Platform.OS === 'android') {
    return true;
  } else {
    return false;
  }
}

export function isIOS() {
  if (Platform.OS === 'ios') {
    return true;
  } else {
    return false;
  }
}



function rawurlencodeCustom(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return ('%' + c.charCodeAt(0).toString(16)).toUpperCase();
  });
}

export function filterBankName(e) {
  let str = '';
  let value = e || '';
  if (value.indexOf('银行') > -1) {
    str = value.slice(0, value.indexOf('银行') + 2);
  } else {
    str = value;
  }
  return str;
}

export function filterBankNo(e) {
  let str = '';
  let value = e || '';
  str =
    value.substring(0, 4) + ' **** **** ' + value.substring(value.length - 4);
  return str;
}

export function filterPhone(value) {
  let str = '';
  str = value.substring(0, 3) + '****' + value.substring(value.length - 4);
  return str;
}

// 获取参数
export function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
export const touchLink = async (url, sel) => {
  if (url.indexOf('https://sourl.cn') !== -1) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
      });
      if (
        response?.url?.includes('/pages/content/content') ||
        response?.url?.includes('/pages/content/index')
      ) {
        sel.navigation.push('WebView', {
          url: response.url,
        });
      } else if (response?.url?.includes('/pages/share/post')) {
        let id = getParameterByName('id', response.url);
        sel.navigation.push('CommunityDetail', {id: id});
      } else if (response?.url?.includes('/pages/share/community')) {
        let id = getParameterByName('id', response.url);
        sel.navigation.push('Community', {id: id});
      } else {
        Linking.openURL(url);
      }
    } catch (err) {
      Linking.openURL(url);
    }
  } else {
    if (
      url.includes('/pages/content/content') ||
      url.includes('/pages/content/index')
    ) {
      sel.navigation.push('WebView', {
        url: url,
      });
    } else if (url.includes('/pages/share/post')) {
      let id = getParameterByName('id', url);
      sel.navigation.push('CommunityDetail', {id: id});
    } else if (url.includes('/pages/share/community')) {
      let id = getParameterByName('id', url);
      sel.navigation.push('Community', {id: id});
    } else {
      Linking.openURL(url);
    }
  }
};
export function randomString() {
  const arr = [
    '这个内容太棒啦！快来和我一起看看~',
    '快来看看我发现了什么？！！',
    '涨知识了！你快来看看~',
  ];
  const randomIndex = Math.floor(Math.random() * arr.length);
  const randomContent = arr[randomIndex];
  return randomContent;
}
export function hasActionH(url, title, share_info = {}) {
  if (url?.includes('/pages/coupon/index')) {
    return {
      title: title,
      introduction: '分享了一张优惠券给你，点击领取>>>',
      url: url,
      icon: 'https://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/quan.png',
      flag: true,
    };
  } else if (url?.includes('/pages/handbook/index')) {
    return {
      title: '学员手册',
      introduction: '点击查看雷小安手册',
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      flag: true,
    };
  } else if (url?.includes('/pages/handbook/detail')) {
    return {
      title: title,
      introduction: `点击查看【${title}】使用指南`,
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      flag: true,
    };
  } else if (url?.includes('/pages/handbook/search')) {
    return {
      title: '',
      introduction: '',
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      flag: false,
    };
  } else if (url?.includes('/pages/activity/index')) {
    return {
      title,
      introduction: share_info.introduction || '雷小安|二奢一站式服务',
      url: url,
      icon:
        share_info.icon ||
        'https://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-img/leixiaoan.jpeg?x-oss-process=style/list-img',
      flag: true,
    };
  }
}
export function hasAction(url, title, image) {
  // 学员试题
  if (url?.includes('eyJpZCI6IjM5NzM2NDIifQ')) {
    return {
      title: '内部教材',
      introduction: '',
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      type: 6,
      flag: true,
    };
  } else if (url?.includes('eyJpZCI6IjMyMjk1MjcifQ')) {
    return {
      title: '学员试题',
      introduction: '',
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      type: 7,
      flag: true,
    };
  } else if (url?.includes('eyJpZCI6IjMzOTMxMTAifQ')) {
    return {
      title: '考证预约',
      introduction: '',
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      type: 8,
      flag: true,
    };
  } else if (url?.includes('eyJpZCI6IjMzOTg0MzMifQ')) {
    return {
      title: title,
      introduction: '',
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      type: 9,
      flag: true,
    };
  } else if (url?.includes('jfa.h5.xeknow.com/sl')) {
    return {
      title: title,
      introduction: '',
      url: url,
      icon: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      type: 11,
      flag: true,
    };
  } else if (url?.includes('/decorate/page')) {
    return {
      title: title,
      introduction: '',
      url: url,
      icon:
        image ||
        'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/shareXiaoe.png',
      type: 10,
      flag: true,
    };
  }
}
export const hash8 = length => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let hash = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    hash += chars.charAt(randomIndex);
  }

  return hash;
};
// 倒计时
function rightCurrentTime(format, currentTime) {
  const {total, days} = currentTime;
  let {hours, minutes, seconds, milliseconds} = currentTime;

  if (!format.includes('D')) {
    hours += days * 24;
  }

  if (!format.includes('H') && !format.includes('h')) {
    minutes += hours * 60;
  }

  if (!format.includes('m')) {
    seconds += minutes * 60;
  }

  if (!format.includes('s')) {
    milliseconds += seconds * 1000;
  }

  return {total, days, hours, minutes, seconds, milliseconds};
}
function padZero(num, targetLength = 2) {
  return _.padStart(_.toString(num), targetLength, '0');
}
export function parseFormat(format, currentTime) {
  const {days, hours, minutes, seconds, milliseconds} = rightCurrentTime(
    format,
    currentTime,
  );

  const matches = {
    D: days,
    DD: padZero(days),
    H: hours,
    HH: padZero(hours),
    m: minutes,
    mm: padZero(minutes),
    s: seconds,
    ss: padZero(seconds),
    S: padZero(milliseconds, 3).charAt(0),
    SS: padZero(milliseconds, 3).slice(0, 2),
    SSS: padZero(milliseconds, 3),
  };

  return _.replace(
    format,
    /\[([^\]]+)]|D{1,2}|H{1,2}|h{1,2}|m{1,2}|s{1,2}|S{1,3}/g,
    (match, $1) => $1 || _.get(matches, match),
  );
}

export function toThousands(area) {
  return String(area).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
export function maskNumber(phoneNumber, start, end) {
  if (!phoneNumber) {
    return '';
  }
  if (phoneNumber.length <= start) {
    return phoneNumber;
  }

  // 遮盖中间段的数字
  const maskedNumber =
    phoneNumber.slice(0, start) +
    '*'.repeat(phoneNumber.length - start - end) +
    phoneNumber.slice(-end);

  // 返回加密后的手机号
  return maskedNumber;
}
export function isEqual(obj1, obj2) {
  return _.isEqual(obj1, obj2);
}
export function validateNumber(value, min, max) {
  if (value === '') {
    return true;
  }
  // 校验输入值是否为数字或者字符串形式的数字
  if (!/^-?\d*\.?\d+$/.test(value)) {
    return false;
  }
  // 将字符串转换为整数
  const intValue = parseInt(value, 10);
  // 检查是否为整数且在范围内
  if (Number.isInteger(intValue) && intValue >= min && intValue <= max) {
    return true;
  } else {
    return false;
  }
}

export const backZipImage = (url, type) => {
  if (!url) {
    return undefined;
  }
  if (url?.indexOf('?x-oss-process') > -1) {
    return url;
  } else {
    if (type === 1) {
      // type === 1 ?x-oss-process=style/preview-iden
      return url + '?x-oss-process=style/preview-iden';
    } else if (type === 2) {
      // type ==== 2 ?x-oss-process=style/list-img
      return url + '?x-oss-process=style/list-img';
    } else if (type === 3) {
      return url + '??x-oss-process=style/preview-img';
    } else {
      return url;
    }
  }
};

export function numberToTenThousands(num) {
  if (!num) {
    return '0';
  }
  num = parseInt(num, 10);
  if (num < 10000) {
    return toThousands(Math.floor(num));
  } else {
    num = Math.floor(num / 100) / 100;
    if (num % 1 === 0) {
      num = parseFloat(num).toFixed(0);
    } else if ((num * 10) % 1 === 0) {
      num = parseFloat(num).toFixed(1);
    }
    return toThousands(num) + '万';
  }
}
export function generateHashCode(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}


// 用于生成唯一ID的简单函数
export function generateUniqueId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
export const hideCode = (str, frontLen) => {
  // str = Math.trunc(Number(str) / 100).toString(); // 是否取整数部分
  str = (Number(str) / 100).toString();
  var len = str.length - frontLen;
  var xing = '';
  for (var i = 0; i < len; i++) {
    xing += '*';
  }
  return str.substring(0, frontLen) + xing;
};

export function hiddenInformation(str) {
  let s = str[0];
  for (let i = 0; i < str.length; i++) {
    s += '*';
  }
  s += str[str.length - 1];
  return s;
}

export function concatenate(a, b, c) {
  let result = '';
  if (a !== undefined && a !== '') {
    result += a;
    if (b !== undefined && b !== '') {
      result += '-' + b;
    }
    if (c !== undefined && c !== '' && c !== '0.00') {
      result += '-' + c;
    }
  } else if (b !== undefined && b !== '') {
    result += b;
    if (c !== undefined && c !== '' && c !== '0.00') {
      result += '-' + '底长' + c;
    }
  } else if (c !== undefined && c !== '' && c !== '0.00') {
    result += '底长' + c;
  }
  return result;
}
export default {
  setSpText,
  scaleSizeW,
  hash8,
  hasAction,
  hasActionH,
  getType,
  getLevel,
  parseFormat,
  isANDROID,
  isIOS,
  formatPrice,
  formatMonth,
  filterBankName,
  filterBankNo,
  filterPhone,
  getParameterByName,
  randomString,
  touchLink,
  backZipImage,
  generateHashCode,
  scaleHtml,
  hideCode,
  concatenate,
};
