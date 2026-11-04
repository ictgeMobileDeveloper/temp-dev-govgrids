import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated as RNAnimated,
  Text,
  Linking,
  Pressable,
} from 'react-native';
import {
  AppFonts,
  normalized,
  Payment_Status,
  ScreenSize,
  sortingList,
  Status_List,
} from '../../Utils/AppConstants';
import DateTimeComp from './DateTimeComp';
import CloseIcon from '../Svg/CloseIcon';
import {AppStyles} from '../../Utils/AppStyles';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import CustomInput from './CustomInput';
import SearchIcon from '../Svg/SearchIcon';
import CustomDropDownList from './CustomDropDownList';
import CustomButton from './CustomButton';
import {formatDateOnly} from '../../Utils/Helper';
import SettingsDrawerContent from './SettingsContent';
import ThemeModal from '../Modal/ThemeModal';
import {Routes} from '../../Utils/Routes';
import {useNavigation} from '@react-navigation/native';

interface CustomDrawerProps {
  drawerAnim: RNAnimated.Value;
  overlayAnim: RNAnimated.Value;
  onClose: () => void;
  topOffset?: number;
  drawerWidth?: number;
  closeDrawer: () => void;
  onApply?: (queryString: string, params: any) => void;
  statusList?: any[];
  paymentStatusList?: any[];
  isVisible: boolean;
  hideSortBy?: boolean;
  isSettingDrawer?: boolean;
  paymentStatusParamKey?: string;
  hidePaymentStatus?: boolean;
  hideSearchBar?: boolean;
  isResidentIssuePortal?: boolean;
}

const CustomDrawer = ({
  drawerAnim,
  overlayAnim,
  onClose,
  topOffset = 0,
  drawerWidth = ScreenSize.width * 0.7,
  closeDrawer,
  paymentStatusList = Payment_Status,
  onApply,
  isVisible,
  hideSortBy = false,
  statusList = Status_List,
  paymentStatusParamKey = 'requestPaymentStatus',
  isResidentIssuePortal = false,
  hidePaymentStatus = false,
  hideSearchBar = true,
}: CustomDrawerProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const navigation: any = useNavigation();
  const [search, setSearch] = useState('');
  const [statusIndex, setStatusIndex] = useState(0);
  const [paymentStatusIndex, setPaymentStatusIndex] = useState(0);
  const [sortIndex, setSortIndex] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const [startSubmissionDate, setStartSubmissionDate] = useState<any>(null);
  const [endSubmissionDate, setEndSubmissionDate] = useState<any>(null);

  if (!isVisible) return null;
  return (
    <View
      style={{
        width: ScreenSize.width,
        height: ScreenSize.height,
        position: 'absolute',
        top: topOffset,
        bottom: 0,
      }}>
      <RNAnimated.View
        pointerEvents={isVisible ? 'auto' : 'none'}
        style={[styles.bgEffect, {opacity: overlayAnim}]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} />
      </RNAnimated.View>

      <RNAnimated.View
        pointerEvents="box-none"
        style={[styles.drawerContainer, {left: drawerAnim}]}>
        <View
          style={{
            backgroundColor: colors.Background,
            flex: 1,
            width: drawerWidth,
            alignSelf: 'flex-end',
          }}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: normalized(20),
              backgroundColor: colors.Background,
              flex: 1,
            }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}>
            <View style={[styles.rowCont, {marginTop: normalized(5)}]}>
              <Text style={styles.filterTxt}>{'Filters'}</Text>
              <TouchableOpacity onPress={closeDrawer} activeOpacity={0.8}>
                <CloseIcon primary={colors.Desc_Txt} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* {isSettingDrawer ? (
              <SettingsDrawerContent
                onTheme={() => setIsShowThemeModal(true)}
                onCityHelp={() => navigation?.navigate(Routes.CityHelpScreen)}
              />
            ) : ( */}
            {/* <> */}
            {!hideSearchBar && (
              <>
                <Text style={styles.txt}>Search</Text>
                <CustomInput
                  value={search}
                  setValue={setSearch}
                  placeholder={'Search Request'}
                  LeftIcon={SearchIcon}
                  style={{
                    height: normalized(42),
                    borderColor: colors.BorderColor,
                  }}
                />
              </>
            )}

            <Text style={styles.txt}>Status</Text>
            <CustomDropDownList
              list={statusList.map((o: any) => o.name)}
              selectedIndex={statusIndex}
              onChange={i => {
                setStatusIndex(i);
              }}
              borderColor={colors.BorderColor}
              isOpen={openDropdown === 'status'}
              setIsOpen={val => setOpenDropdown(val ? 'status' : null)}
            />
            {!hidePaymentStatus && (
              <>
                <Text style={styles.txt}>Payment Status</Text>
                <CustomDropDownList
                  list={paymentStatusList.map((o: any) => o.label ?? o.name)}
                  selectedIndex={paymentStatusIndex}
                  onChange={i => {
                    setPaymentStatusIndex(i);
                  }}
                  borderColor={colors.BorderColor}
                  isOpen={openDropdown === 'payment'}
                  setIsOpen={val => setOpenDropdown(val ? 'payment' : null)}
                />
              </>
            )}
            {!hideSortBy && (
              <>
                <Text style={styles.txt}>Sort By</Text>
                <CustomDropDownList
                  list={sortingList.map((o: any) => o.label)}
                  selectedIndex={sortIndex}
                  onChange={i => {
                    setSortIndex(i);
                  }}
                  borderColor={colors.BorderColor}
                  isOpen={openDropdown === 'sort'}
                  setIsOpen={val => setOpenDropdown(val ? 'sort' : null)}
                />
              </>
            )}
            {isResidentIssuePortal && (
              <>
                <View style={{height: normalized(15)}} />

                <View style={styles.dateLabelRow}>
                  <Text style={styles.txt}>Start Submission Date</Text>

                  {!!startSubmissionDate && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setStartSubmissionDate(null)}>
                      <Text style={styles.resetTxt}>Reset</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <DateTimeComp
                  mode="date"
                  dateValue={startSubmissionDate}
                  placeholderDate="Select start date"
                  maximumDate={endSubmissionDate}
                  onDateChange={(date: any) => {
                    if (date) {
                      setStartSubmissionDate(date);
                    }
                  }}
                />

                <View style={{height: normalized(15)}} />

                <View style={styles.dateLabelRow}>
                  <Text style={styles.txt}>End Submission Date</Text>

                  {!!endSubmissionDate && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setEndSubmissionDate(null)}>
                      <Text style={styles.resetTxt}>Reset</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <DateTimeComp
                  mode="date"
                  dateValue={endSubmissionDate}
                  placeholderDate="Select end date"
                  minimumDate={startSubmissionDate}
                  onDateChange={(date: any) => {
                    if (date) {
                      setEndSubmissionDate(date);
                    }
                  }}
                />
              </>
            )}
            <CustomButton
              text={'Apply'}
              onPress={() => {
                const selectedStatus = statusList[statusIndex];
                const selectedPaymentStatus =
                  paymentStatusList[paymentStatusIndex];
                const selectedSort = sortingList[sortIndex];
                const params: any = {};
                if (selectedStatus?.key && selectedStatus.key !== 'all') {
                  params.status = selectedStatus.key;
                }
                if (
                  selectedPaymentStatus?.key &&
                  selectedPaymentStatus.key !== 'all'
                ) {
                  params[paymentStatusParamKey] = selectedPaymentStatus.key;
                }
                if (search?.trim()) {
                  params.query = search.trim();
                }
                if (selectedSort?.key) {
                  params.sort = selectedSort.key;
                }
                if (isResidentIssuePortal && startSubmissionDate) {
                  params.startSubmissionDate =
                    formatDateOnly(startSubmissionDate);
                }

                if (isResidentIssuePortal && endSubmissionDate) {
                  params.endSubmissionDate = formatDateOnly(endSubmissionDate);
                }
                const queryString = Object.entries(params)
                  .map(
                    ([key, value]) =>
                      `${key}=${encodeURIComponent(value as string)}`,
                  )
                  .join('&');
                console.log('queryString--0000-- ', queryString);

                onApply?.(queryString, params);
                closeDrawer();
              }}
              loading={false}
            />
          </ScrollView>
        </View>
      </RNAnimated.View>
    </View>
  );
};

export default CustomDrawer;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    drawerContainer: {
      position: 'absolute',
      width: ScreenSize.width,
      minHeight: ScreenSize.height,
      zIndex: 999,
    },
    bgEffect: {
      flex: 1,
      width: ScreenSize.width,
      backgroundColor: 'rgba(0,0,0,0.5)',
      position: 'absolute',
      height: ScreenSize.height,
    },

    txt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginTop: normalized(6),
      marginBottom: normalized(5),
    },
    filterTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(18),
      fontWeight: 'bold',
    },
    dateLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: normalized(6),
      marginBottom: normalized(5),
    },

    resetTxt: {
      fontSize: normalized(13),
      color: colors.Primary,
      fontFamily: AppFonts.UbuntuMedium,
    },
  });
