import React, {useMemo} from 'react';
import {
  Linking,
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
import {normalized, ScreenProps} from '../../Utils/AppConstants';

import CustomHeader from '../Components/CustomHeader';
import BackArrowIcon from '../Svg/BackArrowIcon';
import EmailIcon from '../Svg/EmailIcon';
import PhoneIcon from '../Svg/PhoneIcon';

import LocationIcon from '../Svg/LocationIcon';
import ClockIcon from '../Svg/ClockIcon';
import WebSVG from '../Svg/WebSVG';

const ContactUsScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const insects = useSafeAreaInsets();

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const contactItems = [
    {
      title: 'Email support',
      value: 'solutions@govgrids.com',
      Icon: EmailIcon,
      onPress: () => Linking.openURL('mailto:solutions@govgrids.com'),
    },
    {
      title: 'Call us',
      value: '+1-800-686-4743',
      Icon: PhoneIcon,
      onPress: () => Linking.openURL('tel:+18006864743'),
    },
    {
      title: 'Visit our website',
      value: 'www.govgrids.com',
      Icon: WebSVG,
      onPress: () => Linking.openURL('https://www.govgrids.com'),
    },
  ];

  return (
    <View
      style={[
        styles.MainStyle,
        {paddingTop: insects.top, paddingHorizontal: 0},
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text="Contact Us"
        desc="Get in touch with our support team."
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: insects.bottom + normalized(20),
          paddingTop: normalized(20),
        }}>
        <View style={styles.itemCont}>
          {contactItems.map((item, index) => {
            const Icon = item.Icon;

            return (
              <View key={item.title}>
                {index > 0 && <View style={styles.divider} />}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={item.onPress}
                  style={[styles.rowCont, {gap: normalized(12)}]}>
                  <View
                    style={[
                      styles.sidePanelCont,
                      {
                        backgroundColor: `${colors.Primary}1A`,
                      },
                    ]}>
                    <Icon primary={colors.Primary} width={18} height={18} />
                  </View>

                  <View style={styles.item}>
                    <Text style={styles.nameTxt}>{item.title}</Text>

                    <Text
                      style={[
                        styles.Desc_Txt_N,
                        {
                          color: colors.Primary,
                          textAlign: 'left',
                        },
                      ]}>
                      {item.value}
                    </Text>
                  </View>

                  <BackArrowIcon primary={colors.Heading_Txt} inverted />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Text
          style={[
            styles.Modal_Heading_Txt,
            {
              marginTop: normalized(24),
              marginBottom: normalized(16),
            },
          ]}>
          Contact information
        </Text>

        <View
          style={[
            styles.rowCont,
            {justifyContent: 'flex-start', gap: normalized(16)},
          ]}>
          <LocationIcon primary={colors.Primary} width={21} height={21} />

          <View style={styles.item}>
            <Text style={styles.nameTxt}>Support office</Text>

            <Text
              style={[
                styles.Desc_Txt_N,
                {
                  textAlign: 'left',
                  marginTop: normalized(6),
                },
              ]}>
              1200 Municipal Plaza, Suite 400, Washington, DC 20004
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.rowCont,
            {
              justifyContent: 'flex-start',
              gap: normalized(16),
              marginTop: normalized(24),
            },
          ]}>
          <ClockIcon primary={colors.Primary} width={20} height={20} />

          <View style={styles.item}>
            <Text style={styles.nameTxt}>Support hours</Text>

            <Text
              style={[
                styles.Desc_Txt_N,
                {
                  textAlign: 'left',
                  marginTop: normalized(6),
                },
              ]}>
              Monday–Friday, 9:00 AM–5:00 PM ET
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactUsScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: colors.BorderColor,
      marginVertical: normalized(12),
      marginLeft: normalized(48),
    },
  });
