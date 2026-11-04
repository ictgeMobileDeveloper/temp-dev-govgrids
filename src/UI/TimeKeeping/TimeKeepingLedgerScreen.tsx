import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import CustomHeader from '../Components/CustomHeader';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  ScreenProps,
} from '../../Utils/AppConstants';
import {normalizeHours} from '../../Utils/Helper';

const Button = ({item}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  return (
    <View style={styles.btnCont}>
      <Text style={styles.firstTxt}>{item?.key}</Text>
      <Text style={styles.secondTxt}>{item?.value}</Text>
    </View>
  );
};

const TimeKeepingLedgerScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const dispatch = useDispatch();
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [data, setData] = useState(props?.route?.params?.data);
  const [list, setList] = useState(props?.route?.params?.data?.transactions);
  const insects = useSafeAreaInsets();

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
        // translucent
        // backgroundColor="transparent"
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={`Ledger For ${data?.bankName}`}
      />

      <FlatList
        data={[1, 2, 3]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listCont}
        renderItem={({index}) => {
          return (
            <>
              {index == 0 ? (
                <View style={styles.btnRow}>
                  <Button
                    item={{
                      key: 'Accrued',
                      value: normalizeHours(data?.totalHours),
                    }}
                  />
                  <Button
                    item={{
                      key: 'Used',
                      value: normalizeHours(data?.totalUsedHours),
                    }}
                  />
                </View>
              ) : index == 1 ? (
                <View style={styles.btnRow}>
                  <Button
                    item={{
                      key: 'Expired',
                      value: '00h 00m',
                    }}
                  />
                  <Button
                    item={{
                      key: 'Balanced',
                      value: normalizeHours(data?.totalRemainingHours),
                    }}
                  />
                </View>
              ) : index == 2 ? (
                <FlatList
                  data={list}
                  showsVerticalScrollIndicator={false}
                  style={{gap: normalized(10)}}
                  renderItem={({item}) => {
                    return (
                      <View style={styles.itemCont}>
                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>Name</Text>
                          <Text style={styles.valueTxt}>{data?.bankName}</Text>
                        </View>
                        <View style={styles.rowCont}>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Active Rules</Text>
                            <Text style={styles.valueTxt}>N/A</Text>
                          </View>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Accrued</Text>
                            <Text style={styles.valueTxt}>
                              {normalizeHours(item?.accrued)}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.rowCont}>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Used</Text>
                            <Text style={styles.valueTxt}>
                              {normalizeHours(item?.used)}
                            </Text>
                          </View>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Expired</Text>
                            <Text style={styles.valueTxt}>{'00h 00m'}</Text>
                          </View>
                        </View>
                        <View style={styles.rowCont}>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Manual</Text>
                            <Text style={styles.valueTxt}>
                              {item?.isManual ? 'Yes' : 'No'}
                            </Text>
                          </View>
                          <View style={styles.item}>
                            <Text style={styles.keyTxt}>Adjusted</Text>
                            <Text style={styles.valueTxt}>
                              {item?.isAdjusted ? 'Yes' : 'No'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.item}>
                          <Text style={styles.keyTxt}>Imported</Text>
                          <Text style={styles.valueTxt}>
                            {item?.isImported ? 'Yes' : 'No'}
                          </Text>
                        </View>
                      </View>
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      />
    </View>
  );
};

export default TimeKeepingLedgerScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    btnCont: {
      borderRadius: normalized(12),
      backgroundColor: colors.Primary,
      justifyContent: 'center',
      padding: normalized(10),
      height: normalized(90),
      flex: 1,
      gap: normalized(5),
    },
    firstTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.White,
      textAlign: 'center',
    },
    secondTxt: {
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.White,
      textAlign: 'center',
    },
    btnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      justifyContent: 'space-between',
    },
    searchBtn: {
      width: normalized(80),
    },
    listCont: {
      gap: normalized(12),
      marginTop: normalized(15),
      marginHorizontal: AppHorizontalMargin,
    },
  });
