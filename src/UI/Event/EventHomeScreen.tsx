import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Calendar} from 'react-native-big-calendar';
import {useDispatch, useSelector} from 'react-redux';

import CustomHeader from '../Components/CustomHeader';
import CustomInput from '../Components/CustomInput';
import CustomSwitcher from '../Components/CustomSwitcher';

import {AppRootStore} from '../../Redux/AppStore';
import {
  AppFonts,
  AppHorizontalMargin,
  EventSwitcherList,
  ScreenProps,
  normalized,
} from '../../Utils/AppConstants';
import {AppStyles} from '../../Utils/AppStyles';
import {
  getSectionTitle,
  daysFromToday,
  getErrorMessage,
  formatAmountToUSD,
  ThemeHexLighten,
  getMonthRange,
} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {Routes} from '../../Utils/Routes';
import EmptyComp from '../Components/EmptyComp';
import AppImageViewer from '../Components/AppImageView';
import CalendarIcon from '../Svg/CalendarIcon';
import moment from 'moment';
import LocationIcon from '../Svg/LocationIcon';
import BackArrowIcon from '../Svg/BackArrowIcon';

type Event = {
  eventId: string;
  eventDate: string;
  eventTime: string;
  title: string;
  [key: string]: any;
};

const EventCard = ({
  item,
  styles,
  onPress,
  colors,
}: {
  item: Event;
  styles: any;
  colors: any;
  onPress: (item: Event) => void;
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => onPress(item)}
    style={styles.event}>
    <AppImageViewer
      source={{uri: item?.mainImageURL}}
      style={styles.image}
      resizeMode="cover"
    />

    {!!item?.type?.name && (
      <View style={styles.cardBadge}>
        <Text style={styles.cardBadgeText} numberOfLines={1}>
          {item.type.name}
        </Text>
      </View>
    )}

    <View style={styles.cardBody}>
      <Text style={styles.item_Heading} numberOfLines={2}>
        {item?.title}
      </Text>

      <View style={styles.pillCont}>
        <CalendarIcon
          width={14}
          height={14}
          primary={colors.Heading_Txt}
          stroke={3}
        />
        <Text style={styles.Desc_Txt_N1}>
          {moment(item?.eventDate).format('MMM D, YYYY [at] HH:mm')}
        </Text>
      </View>

      <View style={styles.pillCont}>
        <LocationIcon width={14} height={14} primary={colors.Heading_Txt} />
        <Text style={[styles.Desc_Txt_N1, {flexShrink: 1}]} numberOfLines={1}>
          {item?.address}
        </Text>
      </View>

      <View style={[styles.rowCont, {marginTop: normalized(6)}]}>
        <Text style={[styles.item_Heading, {color: colors.Primary}]}>
          {formatAmountToUSD(item?.cost)}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const EventHomeScreen = (props: ScreenProps) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [search, setSearch] = useState('');
  const [listIndex, setListIndex] = useState(0); // 0 = calendar, 1 = list
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  // calendar state
  const [mode, setMode] = useState<'month' | 'day'>('month');
  const [date, setDate] = useState(new Date());
  const [calHeight, setCalHeight] = useState(0);

  /* ---------------------------------- API ---------------------------------- */

  const getEvents = (query: string = '') => {
    // month range only for the calendar tab (listIndex 0), the list tab sends none
    const range = listIndex === 0 ? getMonthRange(date) : {};
    setLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.eventList,
      method: 'GET',
      queryParams: {page: 1, pageSize: 10, query, type: '', ...range},
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setLoading(true);
        if (resp?.status) {
          setEvents(resp?.data?.data ?? []);
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

  useEffect(() => {
    const timer = setTimeout(() => getEvents(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search, listIndex, moment(date).format('YYYY-MM')]);
  /* --------------------------------- DATA ---------------------------------- */

  // list view: events grouped by date
  const listSections = useMemo(() => {
    const byDate: {[date: string]: Event[]} = {};
    events.forEach(e => {
      if (!byDate[e.eventDate]) byDate[e.eventDate] = [];
      byDate[e.eventDate].push(e);
    });
    return Object.keys(byDate)
      .sort((a, b) => Math.abs(daysFromToday(a)) - Math.abs(daysFromToday(b)))
      .map(d => ({title: d, data: byDate[d]}));
  }, [events]);

  // calendar view: the library needs title + start + end (Date objects)
  const calendarEvents = useMemo(
    () =>
      events.map(e => {
        const start = moment(e.eventDate).toDate();
        return {
          title: e.title,
          start,
          end: moment(start).add(1, 'hour').toDate(),
          event: e, // original event, used on press
        };
      }),
    [events],
  );

  /* ------------------------------- HANDLERS -------------------------------- */

  const onEventPress = useCallback(
    (item: Event) =>
      props?.navigation?.navigate(Routes.Event.EventDetailScreen, {item}),
    [props?.navigation],
  );

  const shift = (dir: number) =>
    setDate(
      moment(date)
        .add(dir, mode === 'month' ? 'month' : 'day')
        .toDate(),
    );

  /* --------------------------------- VIEWS --------------------------------- */

  const renderCalendarHeader = () => (
    <View style={styles.calHeader}>
      <View style={styles.rowCont}>
        <TouchableOpacity onPress={() => shift(-1)} hitSlop={10}>
          <BackArrowIcon primary={colors.Heading_Txt} width={20} height={20} />
        </TouchableOpacity>
        <Text style={styles.nameTxt}>
          {moment(date).format(
            mode === 'month' ? 'MMMM YYYY' : 'ddd, MMM D, YYYY',
          )}
        </Text>
        <TouchableOpacity onPress={() => shift(1)} hitSlop={10}>
          <BackArrowIcon
            width={20}
            height={20}
            primary={colors.Heading_Txt}
            inverted
          />
        </TouchableOpacity>
      </View>

      <View style={styles.pillCont}>
        {(['month', 'day'] as const).map(m => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[
              styles.statusCont,
              {
                backgroundColor:
                  mode === m
                    ? colors.Primary
                    : ThemeHexLighten(colors.Primary, selector?.isDarkTheme),
              },
            ]}>
            <Text
              style={[styles.statusTxt, mode !== m && {color: colors.Primary}]}>
              {m === 'month' ? 'Month' : 'Day'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCalendar = () =>
    calHeight > 0 && (
      <Calendar
        events={calendarEvents}
        height={calHeight}
        mode={mode}
        date={date}
        swipeEnabled={false}
        eventCellStyle={{backgroundColor: colors.Primary}}
        eventCellTextColor={colors.White}
        onPressEvent={e => onEventPress(e.event)}
        onPressCell={d => {
          if (mode === 'month') {
            setDate(d);
            setMode('day'); // tap a date -> open its day view
          }
        }}
      />
    );

  const renderListView = () => (
    <SectionList
      sections={listSections}
      keyExtractor={item => item.eventId}
      renderSectionHeader={({section}) => (
        <Text style={styles.sectionHeader}>
          {getSectionTitle(section.title)}
        </Text>
      )}
      renderItem={({item}) => (
        <EventCard
          item={item}
          styles={styles}
          onPress={onEventPress}
          colors={colors}
        />
      )}
      contentContainerStyle={styles.eventListContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={
        <View style={styles.loaderCont}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.Primary} />
          ) : (
            <EmptyComp type={Empty_Screen_Type.List} subText="No Event Found" />
          )}
        </View>
      }
    />
  );

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS === 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text="Event Management"
        desc="View Public City Related Events"
      />

      <View style={styles.bodyCont}>
        <View style={{height: normalized(12)}} />
        <CustomInput
          value={search}
          setValue={setSearch}
          placeholder="Search"
          placeholderColor={colors.Heading_Txt}
          style={{height: normalized(45)}}
        />

        <CustomSwitcher
          list={EventSwitcherList}
          selectedIndex={listIndex}
          onChange={setListIndex}
        />

        {listIndex === 0 && renderCalendarHeader()}

        <View
          style={styles.listCont}
          onLayout={e => setCalHeight(e.nativeEvent.layout.height)}>
          {listIndex === 0 ? renderCalendar() : renderListView()}
        </View>
      </View>
    </View>
  );
};

export default EventHomeScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.ScreenBackground},
    bodyCont: {flex: 1, paddingHorizontal: AppHorizontalMargin},
    listCont: {flex: 1, marginTop: normalized(12)},
    calHeader: {gap: normalized(10), marginTop: normalized(12)},

    sectionHeader: {
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(14),
      color: colors.Primary,
      backgroundColor: colors.ScreenBackground,
      paddingVertical: normalized(8),
    },
    eventListContent: {
      paddingVertical: normalized(10),
      paddingBottom: normalized(30),
    },

    event: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(12),
      overflow: 'hidden',
      backgroundColor: colors.Background,
      marginBottom: normalized(14),
    },
    image: {width: '100%', height: normalized(180)},
    cardBadge: {
      position: 'absolute',
      top: normalized(10),
      left: normalized(10),
      maxWidth: '80%',
      backgroundColor: 'rgba(0,0,0,0.6)',
      borderRadius: normalized(8),
      paddingHorizontal: normalized(10),
      paddingVertical: normalized(5),
    },
    cardBadgeText: {
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(12),
      color: colors.White,
    },
    cardBody: {padding: normalized(14), gap: normalized(8)},
  });
