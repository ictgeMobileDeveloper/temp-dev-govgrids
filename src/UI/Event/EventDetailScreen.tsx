import React, {use, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import RenderHtml from 'react-native-render-html';
import Clipboard from '@react-native-clipboard/clipboard';
import CustomHeader from '../Components/CustomHeader';

import {AppRootStore} from '../../Redux/AppStore';
import {
  AppColors,
  AppFonts,
  AppHorizontalMargin,
  ScreenProps,
  isLargeWidth,
  normalized,
} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import {
  daysFromToday,
  formatAmountToUSD,
  getErrorMessage,
  ThemeHexLighten,
  isEmailValid,
} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import RequestAttachmentsGallery from '../ResidentIssuePortal/Components/FileListing';
import {Image} from 'react-native-svg';
import AppImageViewer from '../Components/AppImageView';
import EmptyComp from '../Components/EmptyComp';
import NavigationIcon from '../Svg/NavigationIcon';
import LocationIcon from '../Svg/LocationIcon';
import ClockCheck from '../Svg/ClockCheckIcon';
import CalendarIcon from '../Svg/CalendarIcon';
import moment from 'moment';
import ClockIcon from '../Svg/ClockIcon';
import {isTablet} from 'react-native-device-info';
import EmailIcon from '../Svg/EmailIcon';
import PhoneIcon from '../Svg/PhoneIcon';
import CustomButton from '../Components/CustomButton';
import SimpleButton from '../Components/SimpleButton';
import CustomSoftButton from '../Components/SoftButton';
import CopyLinkIcon from '../Svg/CopyLinkIcon';
import CustomInput from '../Components/CustomInput';

const EventDetailsScreen = (props: ScreenProps) => {
  const item = props?.route?.params?.item;
  console.log('item', item);
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [event, setEvent] = useState<any>(null);
  const [Subsloading, setSubLoading] = useState(false);
  const [Unsubloading, setunSubLoading] = useState(false);

  useEffect(() => {
    setEvent(item);
  }, []);

  const onSubscribe = async (Subscribe: boolean) => {
    if (!email || !isEmailValid(email)) {
      setEmailError(true);
      return;
    }
    Subscribe ? setSubLoading(true) : setunSubLoading(true);
    apiHandler({
      endpoint: Subscribe
        ? ENDPOINTS.subscribeEvent
        : ENDPOINTS.unsubcribeEvent,
      method: Subscribe ? 'POST' : 'DELETE',
      payload: {
        email,
        event: event.id,
      },
      queryParams: {
        email,
        event: event.id,
      },
      useRecaptcha: true,
      onComplete: (resp: any) => {
        Subscribe ? setSubLoading(false) : setunSubLoading(false);

        if (resp?.status) {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: Subscribe
                ? 'Event is subscribed'
                : 'Event is unsubscribed',
            }),
          );
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
        }
      },
    });
  };

  //   useEffect(() => {
  //     apiHandler({
  //       endpoint: `${ENDPOINTS.eventDetail}`,
  //       queryParams: {slug: item?.slug},
  //       method: 'GET',
  //       authContext: 'RESIDENT',
  //       onComplete: (resp: any) => {
  //         setLoading(false);

  //         if (resp?.status) {
  //           setEvent(resp?.data ?? null);
  //         } else {
  //           dispatch(
  //             setShowToast({
  //               type: AppStrings.ToastType.error,
  //               message: getErrorMessage(resp),
  //             }),
  //           );
  //         }
  //       },
  //     });
  //   }, [item?.slug]);
  const highlightAttachments = useMemo(
    () =>
      (event?.highlights ?? []).map((highlight: any) => ({
        ...highlight,
        url:
          highlight?.mediaType === 'video'
            ? highlight?.videoURL
            : highlight?.url ?? highlight?.imageURL ?? highlight?.mainImageURL,
        fileName: highlight?.fileName ?? highlight?.filename,
        kind: highlight?.mediaType === 'video' ? undefined : ('image' as const),
      })),
    [event?.highlights],
  );

  if (!event) {
    return (
      <View style={[styles.container, styles.centered]}>
        <EmptyComp type={Empty_Screen_Type.List} subText="No Event Found" />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top - normalized(Platform.OS === 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text="Event Details"
        desc="View details of a public event."
      />

      <ScrollView
        style={styles.bodyCont}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ---------------------------- HERO IMAGE ---------------------------- */}
        <View style={styles.heroCont}>
          <AppImageViewer
            source={{
              uri: event.mainImageURL,
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroOverlay} />

          <View style={styles.heroTextCont}>
            <View style={styles.row}>
              {!!event?.type?.name && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{event.type.name}</Text>
                </View>
              )}

              <View
                style={[
                  styles.statusCont,
                  styles.rowCont,
                  {backgroundColor: colors.Primary, alignSelf: 'flex-start'},
                ]}>
                <ClockCheck size={10} color={colors.Desc_Txt} />
                <Text
                  style={[
                    styles.statusTxt,
                    {fontSize: normalized(10), marginLeft: normalized(5)},
                  ]}>
                  {daysFromToday(event.eventDate)}
                  {' Days to go'}
                </Text>
              </View>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>
              {event.title}
            </Text>
          </View>
        </View>

        {/* ---------------------------- INFO CARD ------------------------------ */}
        <View style={styles.row}>
          <Text style={[styles.Desc_Txt_N, {fontStyle: 'italic'}]}>
            {event?.shortDescription}
          </Text>
        </View>

        <Text style={styles.nameTxt}>Event Details</Text>
        <View style={styles.pillWrap}>
          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: ThemeHexLighten(
                  colors.Primary,
                  selector?.isDarkTheme,
                ),
              },
            ]}>
            <View style={styles.pillCont}>
              <CalendarIcon
                width={12}
                height={12}
                primary={colors.Primary}
                stroke={3}
              />
              <Text style={styles.Heading2}>
                {moment(event.eventDate).format('dddd, MMMM D, YYYY')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: ThemeHexLighten(
                  colors.Primary,
                  selector?.isDarkTheme,
                ),
              },
            ]}>
            <View style={styles.pillCont}>
              <ClockIcon width={12} height={12} primary={colors.Primary} />
              <Text style={styles.Heading2}>
                {moment(event.eventDate).format('HH:mm')}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: ThemeHexLighten(
                  colors.Primary,
                  selector?.isDarkTheme,
                ),
                maxWidth: '100%',
              },
            ]}>
            <View style={[styles.pillCont, {flexShrink: 1}]}>
              <LocationIcon width={14} height={14} primary={colors.Primary} />
              <Text
                style={[styles.Heading2, {flexShrink: 1}]}
                numberOfLines={1}>
                {event.address}
              </Text>
            </View>
          </View>

          <View style={[styles.statusCont, {backgroundColor: colors.Primary}]}>
            <Text style={[styles.Heading2, {color: colors.Background}]}>
              {formatAmountToUSD(event.cost)}
            </Text>
          </View>
        </View>

        <Text style={styles.nameTxt}>Contact Details</Text>
        <View style={styles.pillCont}>
          <EmailIcon primary={colors.Primary} width={20} height={20} />
          <Text style={styles.Desc_Txt_N1}>{event?.contactEmail}</Text>
        </View>
        <View style={styles.pillCont}>
          <PhoneIcon primary={colors.Primary} width={15} height={15} />
          <Text style={styles.Desc_Txt_N1}>{event?.phoneNumber}</Text>
        </View>

        <View style={{flexDirection: 'row', columnGap: normalized(10)}}>
          <CustomSoftButton
            LeftIcon={CalendarIcon}
            text="Add to Calendar"
            onPress={() => {
              const start = moment(event.eventDate).format('YYYYMMDDTHHmmss');
              const end = moment(event.eventDate)
                .add(1, 'hour')
                .format('YYYYMMDDTHHmmss');

              const calendarUrl =
                `https://calendar.google.com/calendar/r/eventedit` +
                `?action=TEMPLATE` +
                `&text=${encodeURIComponent(event.title)}` +
                `&dates=${start}/${end}` +
                `&details=${encodeURIComponent(event.description || '')}` +
                `&location=${encodeURIComponent(event.address || '')}`;

              Linking.openURL(calendarUrl);
            }}
          />
          <CustomSoftButton
            LeftIcon={CopyLinkIcon}
            text="Copy Link"
            onPress={() => {
              Clipboard.setString(
                `${Base_Url}/${ENDPOINTS.eventDetail}/${item?.slug}`,
              );

              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.success,
                  message: 'Link has been copied to clipboard.',
                }),
              );
            }}
          />
        </View>

        <View style={[styles.rowCont, {gap: normalized(5)}]}></View>
        {!!event.description && (
          <View>
            <Text style={[styles.nameTxt, {textAlign: 'left'}]}>
              Event Description
            </Text>
            <RenderHtml
              contentWidth={width - AppHorizontalMargin * 2 - normalized(32)}
              source={{html: event.description}}
              baseStyle={styles.descriptionBase}
            />
          </View>
        )}

        {highlightAttachments.length > 0 && (
          <RequestAttachmentsGallery
            title="Highlights"
            attachments={highlightAttachments}
          />
        )}
        <View style={[styles.itemCont, {gap: normalized(0)}]}>
          <Text style={[styles.Heading1, {textAlign: 'left'}]}>
            Get Updates
          </Text>
          <Text style={styles.Input_Heading}>Email Address</Text>
          <CustomInput
            placeholder={'Enter Email'}
            value={email}
            setValue={(val: any) => {
              setEmail(val);
            }}
            errorMsg={emailError}
          />
          <View style={[styles.rowCont, {gap: normalized(5)}]}>
            <View style={{flex: 1, minWidth: 0}}>
              <CustomButton
                text="Subscribe"
                loading={Subsloading}
                onPress={() => onSubscribe(true)}
              />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <SimpleButton
                text="Unsubscribe"
                loading={Unsubloading}
                onPress={() => onSubscribe(false)}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EventDetailsScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.ScreenBackground},
    centered: {alignItems: 'center', justifyContent: 'center'},

    bodyCont: {flex: 1, paddingHorizontal: AppHorizontalMargin},
    scrollContent: {
      paddingTop: normalized(12),
      paddingBottom: normalized(30),
      gap: normalized(16),
    },

    /* Hero image */
    heroOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.65)',
    },
    heroCont: {
      width: '100%',
      height: normalized(220),
      borderRadius: normalized(14),
      overflow: 'hidden',
      backgroundColor: colors.BorderColor,
    },
    heroImage: {width: '100%', height: '100%'},

    heroTextCont: {
      position: 'absolute',
      left: normalized(16),
      right: normalized(16),
      bottom: normalized(14),
    },
    typeBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: normalized(6),
      paddingHorizontal: normalized(8),
      paddingVertical: normalized(4),
      marginBottom: normalized(6),
    },
    typeBadgeText: {
      fontFamily: AppFonts.UbuntuMedium,
      fontSize: normalized(11),
      color: colors.White,
    },
    heroTitle: {
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(24),
      color: colors.White,
    },

    /* Info card */
    infoCard: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(12),
      padding: normalized(16),
      backgroundColor: colors.Background,
      gap: normalized(6),
    },

    descriptionBase: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(14),
      color: colors.Desc_Txt,
      lineHeight: normalized(21),
    },
  });
