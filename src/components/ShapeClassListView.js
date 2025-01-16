import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  scaleSizeW,
  setSpText,
  isANDROID,
  formatPriceNew,
  generateUniqueId,
} from '../../util/util.js';
import moment from 'moment';
import ToastBox from '../../util/toast.js';

export default class ShapeClassListView extends Component {
  constructor(props) {
    super(props);
    this.contentHeight = Dimensions.get('window').height - 78;
    this.state = {
      showEmpty: false,
      imgs: [],
      moveAnim: new Animated.Value(this.contentHeight),
      preImg: '',
      showPreview: false,
      spuId: 0,
      showResult: false,
      recognizingViewOffset: new Animated.Value(scaleSizeW(229 * 2)),
      uniqueList: [],
      similarQuery: {},
      showPopver: false,
    };
  }

  componentDidMount() { }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.url !== this.props.url ||
      (this.props.middleTrue != prevProps.middleTrue &&
        this.props.middleTrue &&
        this.props.url != undefined &&
        this.props.url != '') ||
      prevProps.cid !== this.props.cid
    ) {
      const url = this.props.url;
      const getData = async () => {
        try {
          await this.getImgSearch(
            url,
            prevProps.visible != this.props.visible &&
            this.props.visible == true,
          );
        } catch (e) { }
      };
      getData();
      this.props.eventWithUserId('PriceQuery.ResultPage');
    }
  }

  startAnimation() {
    if (this.props.visible) {
      Animated.timing(this.state.moveAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }

  async getImgSearch(url, showAnim) {
    try {
      if (this.props.type == undefined) {
        return;
      }
      const obj = {
        image_src: url,
        // category_id: this.props.cid,
        source: 21,
        upload_source: this.props.type,
        platform: 1,
      };
      if (this.props.cid != undefined) {
        obj.category_id = this.props.cid;
      }
      if (this.props.metaData) {
        let metaData = this.props.metaData;
        if (isANDROID() && metaData.length > 0) {
          delete metaData[0].base64;
        }
        obj.target_detection_results = JSON.stringify({
          origin_img_src: url,
          result: metaData,
        });
      }
      this.setState({
        showLoad: true,
      });
      let before = moment();
      const res = await this.props.api?.getAiImgV2(obj);
      let after = moment();
      const rows = res?.data?.items || [];
      const sku = res?.data?.filterListMap || {};
      const sames = res.data?.similarPlatformItem;
      let timediff = Math.abs(before.diff(after, 'seconds'));

      // 基于 id 去重
      const mergedList = rows.concat(sames || []);
      const uniqueList = Array.from(
        new Map(mergedList.map(item => [item.id, item])).values(),
      );
      const firstAiData = uniqueList.shift();
      if (timediff < 2) {
        let delta = 2 - timediff;
        setTimeout(() => {
          this.setState(
            {
              imgs: uniqueList,
              firstAiData: firstAiData,
              sku: sku,
              showEmpty: uniqueList.length ? false : true,
              similarQuery: res.data.similarQuery || {},
              // showLoad: false,
            },
            () => {
              this.setState({ showLoad: false });
              if (showAnim) {
                this.startAnimation();
              }
              this.props.handleShow();
            },
          );
        }, delta * 1000);
      } else {
        this.setState(
          {
            imgs: uniqueList,
            firstAiData: firstAiData,
            sku: sku,
            showEmpty: uniqueList.length ? false : true,
            similarQuery: res.data.similarQuery || {},
            // showLoad: false,
          },
          () => {
            this.setState({ showLoad: false });
            if (showAnim) {
              this.startAnimation();
            }
            this.props.handleShow();
          },
        );
      }
      // eslint-disable-next-line no-empty
    } catch {
      this.setState({ showLoad: false, showEmpty: true }, () => {
        this.props.handleShow();
      });
    }
  }

  handleCancel() {
    Animated.timing(this.state.moveAnim, {
      toValue: this.contentHeight,
      duration: 300,
      useNativeDriver: false,
    }).start();
    Animated.timing(this.state.recognizingViewOffset, {
      toValue: scaleSizeW(229 * 2),
      duration: 300,
      useNativeDriver: false,
    }).start();
    setTimeout(() => {
      this.props.handleClose();
    }, 300);
  }

  goDetail(item) {
    this.props.navigation.push('CheckPriceDetail', {
      id: item.id,
      cid: this.props.cid,
      imgs: this.state.imgs,
      sku: true,
      url: item.media?.official_positive_images,
      path: this.props.path || 2,
    });
  }

  goodsFilter() {
    const o = this.state.similarQuery;
    const cname = this.getCName(this.props.cid);
    this.props.navigation.push('CheckPriceNewSearch', {
      category: {
        id: this.props.cid,
        name: cname,
      },
      brand: o.brand_id || null,
      p_series: o.p_series_id || null,
      series: o.series_id || null,
      child_category: o.child_category_id || null,
      material: o.material_classification_id || null,
      color: o.color_classification_id || null,
    });
  }
  goGu(item) {
    global.goPage('AddBid', {
      category: {
        category_configure_id: item?.category_configure?.id, //获取估价图片鉴定点
        id: item?.category?.id,
        name: item?.category?.name,
      },
      brand: item.brand,
      front_pic: this.props?.url,
    });
  }
  async goInbound(item) {
    const defaultValue = {
      brand: {
        name: item.brand.name,
        id: item.brand.id,
      },
      goods_pic_list: [{ img: this.props.url, key: generateUniqueId() }],
    };

    global.goPage('Inbound', {
      goods_type: 1, //入库类型：1回收
      type: 'in',
      category_id: item.category_id,
      defaultValue: defaultValue,
      ai_data: item,
    });
  }
  goFind() {
    global.goPage('TradeSearchCamera', {
      searchImg: this.props.url,
      fromPage: 'checkPriceScan',
    });
    this.props.eventWithUserId('Trade.Photo.Click');
  }

  async verifyBrand(item) {
    const res = await this.props.api?.idenVerifyBrand({
      loading: true,
      brand_id: item.brand_id,
    });
    if (res.code === 0) {
      return res.data.is_merchant_ident;
    }
  }
  async getSearialData(item) {
    const res = await this.props.api?.getAuthenSerialListData({
      //获取款式数据
      loading: true,
      page: 1,
      per_page: 2,
      brand_id: item.brand_id,
      category_id: item.category_id,
    });
    const serialList = res.data.data || [];
    this.serialData = serialList || -1;
    return serialList;
  }
  async goIden(item) {
    const is_complete = await this.verifyBrand(item);
    if (!is_complete) {
      ToastBox.show('不支持该品牌');
      return;
    }
    const serialList = await this.getSearialData(item);
    //若有款式则直接跳过选择款式页面
    if (serialList?.length) {
      const serial = serialList[0];
      global.goPage('IdentificationActionView', {
        brandid: item.brand?.id,
        sid: serial.id,
        name: item.brand?.name,
        sname: serial.name,
        image: serial.image_url,
        category_name: item.category?.name,
        category_id: item.category_id,
        brand: item.brand,

        front_pic: this.props.url,
      });
    } else {
      ToastBox.show('不支持该品牌');
    }
  }

  _renderItem(item, index) {
    let min_price = 0;
    let max_price = 0;
    if (item.average_market_price?.average_market_price) {
      min_price =
        item.average_market_price?.min_average_market_price_month / 100;
      max_price =
        item.average_market_price?.max_average_market_price_month / 100;
      if (max_price === min_price) {
        max_price = 0;
      }
    }

    return (
      <TouchableOpacity
        key={'ai_goods_' + index}
        onPress={this.goDetail.bind(this, item)}
        style={[
          styles.item,
          { marginRight: (index + 1) % 2 === 1 ? scaleSizeW(16) : 0 },
        ]}>
        <View style={styles.tag}>
          {item.tag_hot ? (
            <Image
              source={{ uri: 'https://oss.leixiaoan.com/aiv3/hot.png' }}
              style={styles.tag_icon}
            />
          ) : null}
          {item.tag_new ? (
            <Image
              source={{ uri: 'https://oss.leixiaoan.com/aiv3/new.png' }}
              style={styles.tag_icon}
            />
          ) : null}
        </View>

        <View style={{ alignItems: 'center', marginTop: scaleSizeW(32) }}>
          <Image
            source={{
              uri:
                item?.media?.official_positive_images +
                '?x-oss-process=style/mark-img',
            }}
            resizeMode="contain"
            style={styles.item_img}
          />
          {item.category_id === 1 && item.official_size_subtable?.length ? (
            <View style={styles.first_pic_size}>
              <Text style={styles.first_pic_size_tx}>
                {`尺寸 ${item.official_size_subtable.name} `}
                {`${item.official_size_subtable.length}*${item.official_size_subtable.height}CM`}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={{ marginTop: scaleSizeW(32) }}>
          <Text
            numberOfLines={3}
            style={{
              fontSize: setSpText(24),
              lineHeight: scaleSizeW(34),
              color: '#41485D',
            }}>
            {item.title}
          </Text>
        </View>
        <View style={styles.item_just}>
          <View style={styles.item_box}>
            <Text style={styles.item_tx1}>近90天售价</Text>
            {item?.average_market_price?.average_market_price ? (
              <Text>
                <Text style={styles.item_tx2}>¥</Text>
                <Text style={styles.item_tx3}>
                  {formatPriceNew(min_price)}
                  {max_price ? ' - ' : ''}
                  {max_price ? <Text style={styles.item_tx2}>¥</Text> : null}
                  {max_price ? formatPriceNew(max_price) : ''}
                </Text>
              </Text>
            ) : (
              <Text style={styles.item_tx3}>--</Text>
            )}
          </View>
        </View>
        {this.props.app === "interal" ? null : <View>
          <TouchableOpacity
            style={{ paddingTop: scaleSizeW(16), }}
            onPress={() => {
              if (this.state.showPopver?.index === index) {
                this.setState({ showPopver: false });
              } else {
                this.setState({ showPopver: { index, item } });
              }
            }}>
            <View style={styles.more_btn}>
              <Text style={styles.more_btn_tx}>更多操作</Text>
              <Image
                source={{
                  uri: 'https://oss.leixiaoan.com/lxz-icon/erp/arrow_thin.png',
                }}
                style={styles.more_btn_icon}
              />
            </View>
          </TouchableOpacity>
          {this.state.showPopver?.index === index ? (
            <View style={styles.popver}>
              {[
                {
                  title: '去估价',
                  icon: 'https://oss.leixiaoan.com/lxz-icon/ai/valuation_icon.png',
                  onPress: this.goGu.bind(this),
                },
                {
                  title: '去鉴定',
                  icon: 'https://oss.leixiaoan.com/lxz-icon/ai/iden_icon.png',
                  onPress: this.goIden.bind(this),
                },
                {
                  title: '去入库',
                  icon: 'https://oss.leixiaoan.com/lxz-icon/ai/inbound_icon.png',
                  onPress: this.goInbound.bind(this),
                },
                {
                  title: '去找货',
                  icon: 'https://oss.leixiaoan.com/lxz-icon/ai/find_icon.png',
                  onPress: this.goFind.bind(this),
                },
              ].map((el, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      el.onPress(item);
                    }}
                    style={styles.popver_item}>
                    <View style={styles.flex_row}>
                      <Image
                        style={[
                          styles.card_icon,
                          { marginRight: scaleSizeW(12) },
                        ]}
                        source={{ uri: el.icon }}
                      />
                      <Text style={styles.popver_title}>{el.title}</Text>
                    </View>
                    <Image
                      source={{
                        uri: 'https://oss.leixiaoan.com/lxz-icon/erp/arrow_thin.png',
                      }}
                      style={styles.popver_arrow}
                    />
                  </TouchableOpacity>
                );
              })}

              <View style={styles.triangle} />
            </View>
          ) : null}
        </View>}
      </TouchableOpacity>
    );
  }

  closePreview() {
    this.setState({
      showPreview: false,
    });
  }

  getCName(id) {
    switch (id) {
      case 1:
        return '箱包';
      case 157:
        return '腕表';
      case 158:
        return '服装';
      case 159:
        return '首饰';
      case 160:
        return '鞋靴';
      case 161:
        return '配饰';
    }
  }

  _renderFirstGoods() {
    if (!this.state.firstAiData) {
      return null;
    }
    const item = this.state.firstAiData;
    let min_price = 0;
    let max_price = 0;
    if (item.average_market_price?.average_market_price) {
      min_price =
        item.average_market_price?.min_average_market_price_month / 100;
      max_price =
        item.average_market_price?.max_average_market_price_month / 100;
      if (max_price === min_price) {
        max_price = 0;
      }
    }
    return (
      <View style={styles.first_goods}>
        <TouchableOpacity
          onPress={() => this.goDetail(item)}
          style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{
              borderRadius: scaleSizeW(12),
              marginRight: scaleSizeW(20),
              overflow: 'hidden',
            }}>
            <Image
              source={{
                uri:
                  item?.media?.official_positive_images +
                  '?x-oss-process=style/mark-img',
              }}
              resizeMode="contain"
              style={styles.first_pic}
            />
            {item.category_id === 1 && item.official_size_subtable?.length ? (
              <View style={styles.first_pic_size}>
                <Text style={styles.first_pic_size_tx}>
                  {`尺寸 ${item.official_size_subtable.name} `}
                  {`${item.official_size_subtable.length}*${item.official_size_subtable.height}CM`}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.first_title} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={{}}>
              <Text style={[styles.item_tx1, { marginTop: scaleSizeW(12) }]}>
                近90天售价
              </Text>
              {min_price ? (
                <Text style={styles.price}>
                  <Text style={{ fontSize: scaleSizeW(20) }}>¥</Text>
                  {formatPriceNew(min_price)}
                  {max_price ? ' - ' : ''}
                  {max_price ? (
                    <Text style={{ fontSize: scaleSizeW(20) }}>¥</Text>
                  ) : null}
                  {max_price ? formatPriceNew(max_price) : ''}
                </Text>
              ) : (
                <Text style={styles.price}>--</Text>
              )}
            </View>
            <View style={styles.detail_btn}>
              <Text style={styles.detail_tx}>查看详情</Text>
              <Image
                style={styles.arrow_thin}
                source={{
                  uri: 'https://oss.leixiaoan.com/lxz-icon/erp/set_arrow_icon.png',
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
        {this.props.app === "interal" ? null : <View style={styles.flex_row}>
          {[
            {
              color: '#FF7D41',
              title: '去估价',
              icon: 'https://oss.leixiaoan.com/lxz-icon/ai/row_card_1.png',
              desc: '快速商品估价',
              onPress: this.goGu.bind(this),
            },
            {
              color: '#36C626',
              title: '去鉴定',
              icon: 'https://oss.leixiaoan.com/lxz-icon/ai/row_card_2.png',
              desc: '快速商品鉴定',
              onPress: this.goIden.bind(this),
            },
            {
              color: '#028BFE',
              title: '去入库',
              icon: 'https://oss.leixiaoan.com/lxz-icon/ai/row_card_3.png',
              desc: '快速商品入库',
              onPress: this.goInbound.bind(this),
            },
            {
              color: '#19B2FF',
              title: '去找货',
              icon: 'https://oss.leixiaoan.com/lxz-icon/ai/row_card_4.png',
              desc: '快速商品找货',
              onPress: this.goFind.bind(this),
            },
          ].map((el, index) => {
            return (
              <TouchableOpacity
                onPress={() => el.onPress(item)}
                key={index}
                style={[styles.row_card, { backgroundColor: el.color }]}>
                <View>
                  <View style={styles.flex_row}>
                    <Image style={styles.card_icon} source={{ uri: el.icon }} />
                    <Text style={styles.card_title}>{el.title}</Text>
                  </View>
                  <Text style={styles.card_desc}>{el.desc}</Text>
                </View>
                <Image
                  source={{
                    uri: 'https://oss.leixiaoan.com/lxz-icon/ai/arrow_two.png',
                  }}
                  style={styles.card_right_icon}
                />
              </TouchableOpacity>
            );
          })}
        </View>}
      </View>
    );
  }
  render() {
    const { showLoad, moveAnim, imgs, showEmpty, preImg } = this.state;
    return (
      <>
        {this.props.visible ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}>
            {showLoad ? (
              // http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/app/checked.png
              <View
                onLayout={() => {
                  Animated.timing(this.state.recognizingViewOffset, {
                    toValue: -scaleSizeW(100),
                    duration: 500,
                    useNativeDriver: false,
                  }).start();
                }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0)',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }}>
                <Animated.View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: scaleSizeW(32),
                    width: scaleSizeW(352 * 2),
                    height: scaleSizeW(229 * 2),
                    alignItems: 'center',
                    transform: [{ translateY: this.state.recognizingViewOffset }],
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: scaleSizeW(40),
                      alignItems: 'center',
                    }}>
                    <Image
                      source={{
                        uri: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/app/checked.png',
                      }}
                      style={{
                        width: scaleSizeW(32),
                        height: scaleSizeW(32),
                      }}
                    />
                    <Text
                      style={{
                        color: '#02803A',
                        fontSize: scaleSizeW(32),
                        fontWeight: '600',
                      }}>
                      {this.props.manuallySelectCategory
                        ? '正在匹配，请稍候'
                        : '识别成功，查询数据中'}
                    </Text>
                  </View>
                  <Image
                    source={{
                      uri: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/assets/finding.gif',
                    }}
                    style={{
                      width: scaleSizeW(292 * 2),
                      height: scaleSizeW(145 * 2),
                      marginTop: scaleSizeW(40),
                    }}
                  />
                </Animated.View>
              </View>
            ) : null}
            <Animated.View
              style={{
                transform: [{ translateY: moveAnim }],
              }}>
              <View
                style={{
                  height: this.contentHeight,
                  alignItems: 'center',
                  width: scaleSizeW(750),
                  zIndex: 999,
                }}>
                <View
                  style={{
                    width: '100%',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingLeft: scaleSizeW(40),
                    paddingRight: scaleSizeW(24),
                  }}>
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        showPreview: true,
                        preImg: this.props.url,
                      });
                    }}>
                    <Image
                      source={{
                        uri: this.props.url + '?x-oss-process=style/list-img',
                      }}
                      style={styles.preImg}
                      resizeMode="contain"
                    />
                    <Image
                      source={{
                        uri: 'http://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/app/click-preview.png',
                      }}
                      style={{
                        width: scaleSizeW(32),
                        height: scaleSizeW(32),
                        position: 'absolute',
                        bottom: scaleSizeW(28),
                        right: scaleSizeW(6),
                      }}
                    />
                  </TouchableOpacity>

                  <View style={styles.flex_row}>
                    <TouchableOpacity
                      onPress={this.goodsFilter.bind(this)}
                      style={styles.search}>
                      <Image
                        style={styles.search_icon}
                        source={{
                          uri: 'https://oss.leixiaoan.com/lxz-icon/ai/ai_search_icon.png',
                        }}
                      />
                      <Text style={styles.search_text}>没找到 搜一搜</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.handleCancel.bind(this)}>
                      <Image
                        style={styles.close_icon}
                        source={{
                          uri: 'https://oss.leixiaoan.com/lxz-icon/ai/close_white.png',
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View
                  style={{
                    width: scaleSizeW(750),
                    backgroundColor: '#F9FAFB',
                    flex: 1,
                    borderTopLeftRadius: scaleSizeW(24),
                    borderTopRightRadius: scaleSizeW(24),
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: scaleSizeW(26),
                      marginBottom: scaleSizeW(16),
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        marginLeft: scaleSizeW(40),
                        alignItems: 'center',
                      }}>
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                        activeOpacity={1}
                        onPress={this.handleCancel.bind(this)}>
                        <Image
                          source={{
                            uri: 'https://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/check-price/aiBack.png',
                          }}
                          style={{
                            width: scaleSizeW(60),
                            height: scaleSizeW(40),
                          }}
                          resizeMode="contain"
                        />
                        <Text
                          style={{
                            fontSize: setSpText(32),
                            color: '#111A34',
                            fontWeight: '600',
                            textAlign: 'center',
                          }}>
                          {imgs.length ? '识别出以下款式' : '识别失败'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                      onPress={this.goodsFilter.bind(this)}
                      activeOpacity={1}
                      style={{
                        marginRight: scaleSizeW(24),
                        flexDirection: 'row',
                        alignItems: 'center',
                        width: scaleSizeW(212),
                        height: scaleSizeW(50),
                        borderRadius: scaleSizeW(39),
                        borderWidth: scaleSizeW(2),
                        borderColor: '#028BFE',
                      }}>
                      <Text
                        style={{
                          color: '#028BFE',
                          fontSize: scaleSizeW(24),
                          lineHeight: scaleSizeW(34),
                          marginLeft: scaleSizeW(24),
                        }}>
                        去商品库筛选
                      </Text>
                      <Image
                        source={{
                          uri: 'https://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/aiv3/blueRight.png',
                        }}
                        style={{
                          width: scaleSizeW(12),
                          height: scaleSizeW(20),
                          marginLeft: scaleSizeW(8),
                        }}
                      />
                    </TouchableOpacity>
                  </View>
                  {showEmpty ? (
                    <View style={styles.empty}>
                      <Image
                        source={{
                          uri: 'https://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/ai/noSearch.png',
                        }}
                        style={styles.empty_img}
                      />
                      <Text style={styles.empty_tx}>暂未找到</Text>
                      <TouchableOpacity
                        style={styles.empty_btn}
                        onPress={this.handleCancel.bind(this)}>
                        <Image
                          source={{
                            uri: 'https://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/ai/xjIcon.png',
                          }}
                          style={styles.empty_icon}
                        />
                        <Text style={styles.empty_btnTx}>重新拍摄</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flex: 1 }}>
                      {this.props.confidence > 0 &&
                        this.props.confidence < 0.9 ? (
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: 'rgba(2, 139, 254, 0.3)',
                            marginTop: scaleSizeW(12),
                            height: scaleSizeW(60),
                          }}>
                          <Text
                            style={{
                              fontSize: scaleSizeW(24),
                              color: '#333333',
                            }}>
                            <Text>相似度偏低，建议您重新拍摄或者从</Text>
                            <Text style={{ color: '#028BFE' }}>“搜索”</Text>
                            <Text>中查找</Text>
                          </Text>
                          <TouchableOpacity
                            style={{ marginRight: scaleSizeW(26) }}
                            onPress={this.handleCancel.bind(this)}>
                            <Image
                              source={{
                                uri: 'https://ajl-lxa.oss-cn-hangzhou.aliyuncs.com/lxa-app/shareAction/community/modal_close.png',
                              }}
                              style={{
                                width: scaleSizeW(40),
                                height: scaleSizeW(40),
                              }}
                            />
                          </TouchableOpacity>
                        </View>
                      ) : null}
                      <ScrollView
                        onScroll={() => {
                          if (this.state.showPopver) {
                            this.setState({ showPopver: false });
                          }
                        }}
                        showsVerticalScrollIndicator={false}
                        style={{ flex: 1, paddingHorizontal: scaleSizeW(24) }}>
                        {this._renderFirstGoods()}
                        {imgs.length ? (
                          <Text style={styles.similar_tx}>相似款式</Text>
                        ) : null}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                          {imgs.map((item, index) => {
                            return this._renderItem(item, index);
                          })}
                        </View>
                        <View style={{ marginTop: scaleSizeW(100) }} />
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>

          </View>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  flex_row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preImg: {
    width: scaleSizeW(50 * 2),
    height: scaleSizeW(50 * 2),
    borderRadius: scaleSizeW(8),
    marginBottom: scaleSizeW(22),
    backgroundColor: 'white',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
  },
  empty_img: {
    width: scaleSizeW(392),
    height: scaleSizeW(268),
    marginTop: scaleSizeW(180),
    marginLeft: scaleSizeW(138),
  },
  empty_tx: {
    fontSize: setSpText(28),
    lineHeight: setSpText(36),
    color: '#999999',
    marginTop: scaleSizeW(46),
  },
  empty_btn: {
    width: scaleSizeW(538),
    height: scaleSizeW(76),
    borderRadius: scaleSizeW(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scaleSizeW(88),
    backgroundColor: '#028BFE',
  },
  empty_icon: {
    width: scaleSizeW(32),
    height: scaleSizeW(28),
  },
  empty_btnTx: {
    fontSize: setSpText(32),
    lineHeight: setSpText(44),
    color: '#ffffff',
    marginLeft: scaleSizeW(16),
  },
  tag: {
    position: 'absolute',
    top: scaleSizeW(24),
    left: scaleSizeW(24),
    zIndex: 99,
    flexDirection: 'row',
  },
  tag_icon: {
    width: scaleSizeW(52),
    height: scaleSizeW(30),
    marginRight: scaleSizeW(8),
  },

  first_goods: {
    borderRadius: scaleSizeW(24),
    marginTop: scaleSizeW(38),
  },
  first_pic: {
    backgroundColor: '#fff',
    width: scaleSizeW(212),
    height: scaleSizeW(212),
  },
  first_pic_size: {
    position: 'absolute',
    right: scaleSizeW(0),
    bottom: scaleSizeW(0),
    height: scaleSizeW(34),
    zIndex: 99,
    width: '100%',
    backgroundColor: 'rgba(16,0,0,0.3)',
  },
  first_pic_size_tx: {
    fontSize: scaleSizeW(18),
    lineHeight: scaleSizeW(34),
    color: '#ffffff',
    textAlign: 'center',
  },
  first_title: {
    fontSize: scaleSizeW(24),
    lineHeight: scaleSizeW(34),
    color: '#111a34',
  },

  item: {
    width: scaleSizeW(342),
    borderRadius: scaleSizeW(24),
    marginBottom: scaleSizeW(16),
    backgroundColor: '#ffffff',
    paddingHorizontal: scaleSizeW(16),
    paddingBottom: scaleSizeW(16)
  },
  item_img: {
    width: scaleSizeW(260),
    height: scaleSizeW(260),
  },
  item_just: {
    width: scaleSizeW(316),
    marginTop: scaleSizeW(10),
  },
  item_box: {
    height: scaleSizeW(84),
    borderRadius: scaleSizeW(8),
    backgroundColor: '#F9FAFB',
    paddingLeft: scaleSizeW(12),
    paddingVertical: scaleSizeW(8),
    justifyContent: 'space-between',
  },
  item_tx1: {
    fontSize: setSpText(20),
    lineHeight: setSpText(28),
    color: '#858B9C',
  },
  item_tx2: {
    fontSize: setSpText(18),
    lineHeight: setSpText(32),
    color: '#111A34',
    fontWeight: '600',
  },
  item_tx3: {
    fontSize: setSpText(28),
    lineHeight: setSpText(32),
    color: '#111A34',
    fontWeight: '600',
  },
  price: {
    color: '#111A34',
    fontWeight: 'bold',
    fontSize: scaleSizeW(28),
    lineHeight: scaleSizeW(34),
  },
  detail_btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: scaleSizeW(38),
    borderRadius: scaleSizeW(40),
    marginTop: scaleSizeW(22),
    backgroundColor: 'rgba(7, 142, 254, 0.1)',
  },
  detail_tx: {
    color: '#2F86F6',
    fontSize: scaleSizeW(18),
    lineHeight: scaleSizeW(26),
  },
  arrow_thin: {
    width: scaleSizeW(16),
    height: scaleSizeW(16),
    marginLeft: scaleSizeW(6),
  },
  row_card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: scaleSizeW(164),
    height: scaleSizeW(90),
    paddingHorizontal: scaleSizeW(16),
    borderRadius: scaleSizeW(8),
    marginRight: scaleSizeW(16),
    marginTop: scaleSizeW(24),
  },
  card_icon: {
    height: scaleSizeW(22),
    width: scaleSizeW(22),
  },
  card_title: {
    fontSize: scaleSizeW(20),
    color: '#FFFFFF',
    marginLeft: scaleSizeW(8),
    lineHeight: scaleSizeW(28),
    fontWeight: 'bold',
  },
  card_desc: {
    opacity: 0.54,
    color: '#FFFFFF',
    marginTop: scaleSizeW(8),
    fontSize: scaleSizeW(16),
    lineHeight: scaleSizeW(22),
  },
  card_right_icon: {
    width: scaleSizeW(18),
    height: scaleSizeW(14),
    marginLeft: scaleSizeW(16),
  },
  similar_tx: {
    fontSize: scaleSizeW(36),
    lineHeight: scaleSizeW(50),
    color: '#111A34',
    fontWeight: 'bold',
    marginTop: scaleSizeW(48),
    marginBottom: scaleSizeW(24),
  },
  more_btn: {
    borderRadius: scaleSizeW(40),
    height: scaleSizeW(38),
    borderWidth: scaleSizeW(1),
    borderColor: 'rgba(26, 26, 26, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  more_btn_tx: {
    fontSize: scaleSizeW(18),
    color: '#41485D',
    lineHeight: scaleSizeW(26),
  },
  more_btn_icon: {
    width: scaleSizeW(6),
    height: scaleSizeW(12),
    marginLeft: scaleSizeW(6),
  },
  popver: {
    position: 'absolute',
    top: scaleSizeW(-296),
    left: '50%',
    transform: [{ translateX: -scaleSizeW(127) }],
    width: scaleSizeW(254),
    height: scaleSizeW(272),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSizeW(20),
    backgroundColor: '#fff',
    borderRadius: scaleSizeW(8),
    borderWidth: scaleSizeW(1),
    borderColor: '#eee',
    elelevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    zIndex: 99,
  },
  triangle: {
    position: 'absolute',
    bottom: -7,
    left: '50%',
    transform: [{ translateX: -10 }, { rotate: '180deg' }],
    width: 0,
    height: 0,
    borderLeftWidth: 10, // 底边长度的一半
    borderRightWidth: 10, // 底边长度的一半
    borderBottomWidth: 8, // 三角形的高度
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff', // 三角形的颜色
  },
  popver_item: {
    width: '100%',
    height: scaleSizeW(68),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popver_title: {
    color: '#41485D',
    fontSize: scaleSizeW(20),
    lineHeight: scaleSizeW(28),
    fontWeight: 'bold',
  },
  popver_arrow: {
    width: scaleSizeW(12),
    height: scaleSizeW(20),
  },
  close_icon: {
    width: scaleSizeW(40),
    height: scaleSizeW(40),
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    width: scaleSizeW(240),
    height: scaleSizeW(68),
    paddingLeft: scaleSizeW(16),
    borderRadius: scaleSizeW(16),
    marginRight: scaleSizeW(32),
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
  },
  search_icon: {
    width: scaleSizeW(28),
    height: scaleSizeW(28),
    marginRight: scaleSizeW(16),
  },
  search_text: {
    fontSize: scaleSizeW(24),
    lineHeight: scaleSizeW(32),
    color: 'rgba(255, 255, 255, 0.4)',
  },
});
