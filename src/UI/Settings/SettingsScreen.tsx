import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  normalized,
  ScreenProps,
  SettingContent,
} from '../../Utils/AppConstants';
import {Routes} from '../../Utils/Routes';
import CustomHeader from '../Components/CustomHeader';
import BackArrowIcon from '../Svg/BackArrowIcon';
import ThemeModal from '../Modal/ThemeModal';

const SettingsScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [isShowThemeModal, setIsShowThemeModal] = useState(false);
  const showChangePass = props?.route?.params?.showChangePass ?? true;

  const insects = useSafeAreaInsets();
  const role = props?.route?.params?.role;

  const sections = useMemo(
    () =>
      SettingContent(
        props?.navigation,
        () => setIsShowThemeModal(true),
        selector,
        role,
        showChangePass,
      ),
    [props?.navigation, selector, role],
  );

  useEffect(() => {
    const role = props?.route?.params?.role;
    console.log('Settings params:', props?.route?.params, 'role:', role);
    console.log('sections', sections);
  });
  return (
    <View
      style={{
        paddingTop: insects.top,
        flex: 1,
        backgroundColor: colors.Background,
      }}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />
      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text="Settings"
        desc="Manage your account, preferences and privacy."
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: insects.bottom + normalized(20),
          paddingTop: normalized(20),
        }}
        showsVerticalScrollIndicator={false}>
        {sections.map(section => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.Modal_Heading_Txt}>{section.heading}</Text>

            <View style={styles.itemCont}>
              {section.items.map((item, index) => (
                <View key={item.title}>
                  {index > 0 && <View style={styles.divider} />}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={`${item.title}. ${item.subtitle}`}
                    onPress={item.onPress}
                    style={[styles.rowCont, {gap: normalized(12)}]}>
                    <View
                      style={[
                        styles.sidePanelCont,
                        {backgroundColor: `${colors.Primary}1A`},
                      ]}>
                      <item.Icon primary={colors.Primary} size={19} />
                    </View>

                    <View style={styles.item}>
                      <Text style={styles.nameTxt}>{item.title}</Text>
                      <Text style={[styles.Desc_Txt_N, {textAlign: 'left'}]}>
                        {item.subtitle}
                      </Text>
                    </View>

                    <BackArrowIcon primary={colors.Heading_Txt} inverted />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <ThemeModal
        isVisible={isShowThemeModal}
        onClose={() => {
          setIsShowThemeModal(false);
        }}
        onThemeChange={() => {
          setIsShowThemeModal(false);
        }}
      />
    </View>
  );
};

export default SettingsScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    section: {
      gap: normalized(12),
      marginBottom: normalized(24),
    },
    divider: {
      height: 1,
      backgroundColor: colors.BorderColor,
      marginVertical: normalized(12),
      marginLeft: normalized(48),
    },
  });
