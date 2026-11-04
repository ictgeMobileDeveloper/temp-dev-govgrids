import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {
  AppFonts,
  AppHorizontalMargin,
  dateFormat,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import CustomHeader from '../../Components/CustomHeader';
import CustomDrawer from '../../Components/CustomDrawer';
import {
  lightenHexColor,
  normalizeValue,
  getErrorMessage,
} from '../../../Utils/Helper';
import EyeIcon from '../../Svg/EyeIcon';
import moment from 'moment';
import SimpleButton from '../../Components/SimpleButton';
import SaveIcon from '../../Svg/SaveIcon';
import ShareIcon from '../../Svg/ShareIcon';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings} from '../../../Utils/AppStrings';
import {useIsFocused} from '@react-navigation/native';
import {Routes} from '../../../Utils/Routes';

const extractArticles = (resp: any) => {
  const candidates = [
    resp?.data?.data?.data?.articles,
    resp?.data?.data?.articles,
    resp?.data?.articles,
    resp?.data?.data,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const KnowledgeScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalItems, setTotalItems] = useState<any>('');
  const [search, setSearch] = useState('');
  const [list, setList] = useState<any[]>([]);

  const fetchArticles = useCallback(() => {
    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.helpDeskArticleList,
      method: 'GET',
      queryParams: {
        page,
        pageSize: '10',
        query: search,
      },
      authContext: 'HELPDESK',
      onComplete: (resp: any) => {
        if (resp?.status) {
          const data = extractArticles(resp);
          const total =
            resp?.data?.pagination?.totalItems ??
            resp?.data?.data?.pagination?.totalItems ??
            data?.length ??
            0;

          setTotalItems(total);
          if (page === 1) {
            setList(data);
          } else {
            setList(prevList => [
              ...prevList,
              ...data.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem?.id === item?.id),
              ),
            ]);
          }
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
        }

        setIsLoading(false);
      },
    });
  }, [dispatch, page, search]);

  useEffect(() => {
    if (isFocused) {
      fetchArticles();
    }
  }, [fetchArticles, isFocused]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Knowledge Base'}
      />

      <FlatList
        data={list}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        contentContainerStyle={styles.listCont}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.2}
        onEndReached={() => {
          if (!isLoading && list.length < Number(totalItems || 0)) {
            setPage(prev => prev + 1);
          }
        }}
        renderItem={({item}) => {
          const categoryName =
            item?.articleCategory?.name ||
            item?.category?.name ||
            item?.categoryName ||
            'General';

          const title = item?.title || item?.name || 'N/A';
          const views = item?.viewsCount ?? item?.views ?? 0;
          const createdAt =
            item?.createdAt || item?.created_at || item?.publishDate;

          return (
            <View style={styles.itemCont}>
              <View>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: lightenHexColor(colors.Primary, 0.7),
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  <Text style={[styles.statusTxt, {color: colors.Primary}]}>
                    {normalizeValue(categoryName)}
                  </Text>
                </View>

                <Text numberOfLines={2} style={styles.txt}>
                  {normalizeValue(title)}
                </Text>
              </View>

              <View style={styles.cardBottom}>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <EyeIcon width={18} primary={colors.Desc_Txt} />
                    <Text style={styles.descTxt}>{views}</Text>
                  </View>

                  <Text style={styles.dateTxt}>
                    {createdAt ? moment(createdAt).format(dateFormat) : 'N/A'}
                  </Text>
                </View>

                <SimpleButton
                  text="Read"
                  style={styles.readBtn}
                  onPress={() => {
                    props.navigation.navigate(
                      Routes.HelpDesk.KnowledgeDetailScreen,
                      {
                        articleId: item?.id,
                        title: title,
                      },
                    );
                  }}
                />
              </View>
              <TouchableOpacity
                style={styles.iconCont}
                activeOpacity={1}
                onPress={() => {}}>
                {/* <SaveIcon primary={colors.Heading_Txt} /> */}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => {}}
                style={styles.iconCont}>
                {/* <ShareIcon primary={colors.Heading_Txt} /> */}
              </TouchableOpacity>
            </View>
          );
        }}
        ListFooterComponent={() =>
          isLoading ? (
            <View
              style={{
                height: ScreenSize.height - normalized(60),
                justifyContent: 'center',
              }}>
              <ActivityIndicator color={colors.Primary} size="large" />
            </View>
          ) : (
            <View style={{height: normalized(40)}} />
          )
        }
      />
    </View>
  );
};

export default KnowledgeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },
    listCont: {
      padding: normalized(10),
      gap: normalized(14),
    },
    itemCont: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      backgroundColor: colors.Background,
      borderRadius: normalized(12),
      padding: normalized(14),
      justifyContent: 'space-between',
    },

    txt: {
      fontSize: normalized(15),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Heading_Txt,
      marginTop: normalized(10),
      lineHeight: normalized(21),
    },

    cardBottom: {
      gap: normalized(12),
    },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    descTxt: {
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Desc_Txt,
      marginLeft: normalized(6),
    },

    dateTxt: {
      fontSize: normalized(12),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Desc_Txt,
    },

    readBtn: {
      marginTop: 0,
      width: '100%',
    },

    iconCont: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
