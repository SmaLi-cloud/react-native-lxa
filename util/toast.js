import {Component} from 'react';
import Toast from 'react-native-tiny-toast';
import {scaleSizeW, setSpText} from './util';

export default class ToastBox extends Component {
  static show = (content, duration) => {
    if (typeof this.toast !== 'undefined') {
      Toast.hide(this.toast);
    }
    this.toast = Toast.show(content.toString(), {
      duration: duration || 3000,
      position: 0,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      textStyle: {
        fontSize: setSpText(24),
        fontWeight: '600',
        color: '#ffffff',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 4,
        marginBottom: 4,
      },
      zIndex: 999999,
    });
  };

  static hide = () => {
    if (typeof this.toast !== 'undefined') {
      Toast.hide(this.toast);
    }
  };

  static showBottom = content => {
    // toastShortBottom
    if (this.toast !== undefined) {
      Toast.hide(this.toast);
    }
    this.toast = Toast.show(content.toString(), {
      duration: 3000,
      position: -200,
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      zIndex: 999999,
      textStyle: {fontSize: setSpText(28)},
    });
  };

  static showTop = (content, config = {}) => {
    // toastShortBottom
    if (this.toast !== undefined) {
      Toast.hide(this.toast);
    }
    this.toast = Toast.show(content.toString(), {
      duration: 3000,
      position: scaleSizeW(config.position || 260),
      shadow: true,
      animation: true,
      hideOnPress: true,
      delay: 0,
      zIndex: 999999,
      textStyle: {fontSize: setSpText(28)},
    });
  };
}
