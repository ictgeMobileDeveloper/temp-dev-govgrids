import React, {useMemo, useState} from 'react';
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppFonts,
  AppHorizontalMargin,
  normalized,
  parkingTypes,
} from '../../Utils/AppConstants';
import {lightenHexColor} from '../../Utils/Helper';
import CustomHeader from '../Components/CustomHeader';
import {Routes} from '../../Utils/Routes';

const ParkingPermitTypeScreen = (props: any) => {
  const insets = useSafeAreaInsets();

  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const isDarkTheme = useSelector(
    (state: AppRootStore) => state.SliceReducer.isDarkTheme,
  );

  const styles = useMemo(
    () => ({
      ...AppStyles(colors),
      ...makeStyles(colors),
    }),
    [colors],
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top - normalized(Platform.OS === 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
      ]}>
      <StatusBar barStyle={isDarkTheme ? 'light-content' : 'dark-content'} />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text="Parking Permit"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: AppHorizontalMargin,
          paddingBottom: normalized(30),
          paddingTop: normalized(20),
        }}>
        <Text style={[styles.Heading, styles.leftAlign]}>
          Choose Your Parking Type
        </Text>
        <View style={{height: normalized(10)}} />
        <Text style={[styles.Desc_Txt_N, styles.leftAlign]}>
          Select the parking option that works best for your schedule and
          budget.
        </Text>

        {parkingTypes.map(({type, id, title, description, Icon}) => {
          return (
            <TouchableOpacity
              key={type}
              activeOpacity={0.8}
              onPress={() =>
                props?.navigation.navigate(Routes.ParkingPermit.ParkingSite, {
                  type: id,
                })
              }
              style={[styles.parkingCard]}>
              <View
                style={[
                  styles.iconCont,
                  {
                    backgroundColor: lightenHexColor(colors.Primary, 0.85),
                  },
                ]}>
                <Icon
                  width={normalized(24)}
                  height={normalized(24)}
                  primary={colors.Primary}
                />
              </View>

              <Text style={styles.CardheadingTxt}>{title}</Text>

              <Text style={styles.CarddescTxt}>{description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ParkingPermitTypeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },

    leftAlign: {
      textAlign: 'left',
    },

    introText: {
      marginTop: normalized(6),
      marginBottom: normalized(8),
    },

    parkingCard: {
      borderRadius: normalized(12),
      padding: normalized(15),
      marginTop: normalized(12),
      borderColor: colors.Primary,
      borderWidth: 1,
    },

    iconCont: {
      width: normalized(55),
      height: normalized(55),
      borderRadius: normalized(8),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalized(14),
    },
  });
