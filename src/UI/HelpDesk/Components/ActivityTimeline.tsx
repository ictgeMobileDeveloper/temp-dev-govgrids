import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppFonts, normalized} from '../../../Utils/AppConstants';
import {AppStyles} from '../../../Utils/AppStyles';

export interface ActivityTimelineItem {
  id: number;
  title: string;
  description: string;
  dateTime: string;
}

interface ActivityTimelineProps {
  events: ActivityTimelineItem[];
}

const ActivityTimeline = ({events}: ActivityTimelineProps) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  return (
    <View style={styles.itemCont}>
      <Text style={styles.heading}>Activity Timeline</Text>

      <View style={styles.timelineWrap}>
        <View style={styles.timelineLine} />
        {events.map((event, index) => {
          const isLast = index === events.length - 1;
          return (
            <View
              key={`${event.id}-${event.title}-${index}`}
              style={[styles.eventRow, isLast && styles.lastEventRow]}>
              <View style={styles.marker}>
                <Text style={styles.markerTxt}>{event.id}</Text>
              </View>

              <View style={styles.content}>
                <Text style={styles.titleTxt}>{event.title}</Text>
                <Text style={styles.descTxt}>{event.description}</Text>
                <Text style={styles.dateTxt}>{event.dateTime}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ActivityTimeline;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    heading: {
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(18),
      color: colors.Heading_Txt,
      marginBottom: normalized(12),
    },
    timelineWrap: {
      position: 'relative',
      paddingLeft: normalized(6),
    },
    timelineLine: {
      position: 'absolute',
      left: normalized(18),
      top: normalized(10),
      bottom: normalized(75),
      width: normalized(2),
      backgroundColor: colors.BorderColor,
    },
    eventRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: normalized(12),
      paddingBottom: normalized(20),
    },
    lastEventRow: {
      paddingBottom: 0,
    },
    marker: {
      width: normalized(28),
      height: normalized(28),
      borderRadius: normalized(999),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.Primary,
      zIndex: 1,
    },
    markerTxt: {
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(14),
      color: colors.White,
    },
    content: {
      flex: 1,
      gap: normalized(3),
      paddingTop: normalized(1),
    },
    titleTxt: {
      fontFamily: AppFonts.UbuntuMedium,
      fontSize: normalized(16),
      color: colors.Heading_Txt,
    },
    descTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(13),
      color: colors.Desc_Txt,
    },
    dateTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      marginTop: normalized(3),
    },
  });
