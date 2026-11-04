import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useMemo} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppFonts, normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import moment from 'moment';

const PropertyDetailScreen = (props: ScreenProps) => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const keyValueArray = Object.entries(props?.route?.params?.item || {}).map(
    ([key, value]) => ({key, value}),
  );

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';

    const K = (key || '').toUpperCase();

    if (K.includes('DATE')) {
      const m = moment(value);
      return m.isValid() ? m.format('ll') : String(value);
    }

    if (/\bPR\b/.test(K)) {
      const n = Number(value);
      return Number.isFinite(n)
        ? `$${n.toLocaleString('en-US', {maximumFractionDigits: 0})}`
        : String(value);
    }

    if (K.includes('SQ FT') || K.includes('SQFT')) {
      const n = Number(value);
      return Number.isFinite(n)
        ? `${n.toLocaleString('en-US')} sq ft`
        : String(value);
    }

    if (K.includes('RATIO')) {
      const n = Number(value);
      return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : String(value);
    }

    return String(value);
  };

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
        text={props?.route?.params?.item?.STREET}
      />

      <View
        style={{marginHorizontal: normalized(20), marginTop: normalized(15)}}>
        <View style={styles.itemCont}>
          <FlatList
            data={keyValueArray}
            keyExtractor={(item: any, index) => item.key + index}
            numColumns={3}
            contentContainerStyle={{gap: normalized(10)}}
            renderItem={({item}) => (
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{item?.key}</Text>
                <Text style={styles.valueTxt}>
                  {formatValue(item?.key, item?.value)}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
};

export default PropertyDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(12),
    },
    headTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Heading_Txt,
      marginBottom: normalized(12),
    },
    keyTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(13),
      color: colors.Desc_Txt,
    },
    valueTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: normalized(15),
    },
    item: {
      flex: 1,
      gap: normalized(5),
      alignItems: 'flex-start',
    },
  });
