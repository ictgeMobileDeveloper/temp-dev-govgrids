import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import React, {useMemo} from 'react';
import CustomHeader from '../Components/CustomHeader';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {RIPStack} from '../../Navigation/RIPStack';
import PPStack from '../../Navigation/ParkingPermitStack';

const PPSubmitReqScreen = (props: ScreenProps) => {
  const site = props?.route?.params?.site;
  const zone = props?.route?.params?.zone;
  const category = props?.route?.params?.category;
  const isCompany = props?.route?.params?.isCompany ?? false;
  const companyId = props?.route?.params?.companyId;

  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const dispatch = useDispatch();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 10 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Submit Request'}
      />
      <Text
        style={[styles.valueTxt, {textAlign: 'left', margin: normalized(10)}]}>
        {isCompany
          ? 'Submit a permit request for the vehicles of your company.'
          : category === 'PAYG'
          ? 'Book an hourly, daily, or session-based Pay As You Go parking spot.'
          : 'Book monthly, worker, or residential contract parking online through operator portals.'}
      </Text>
      {!isCompany && (
        <Text
          style={[
            styles.Heading,
            {textAlign: 'left', marginLeft: normalized(20)},
          ]}>
          {site?.buildingName}
        </Text>
      )}
      <PPStack
        site={site}
        zone={zone}
        category={category}
        isCompany={isCompany}
        companyId={companyId}
      />
    </View>
  );
};

export default PPSubmitReqScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
  });
