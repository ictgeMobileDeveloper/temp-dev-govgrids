import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized, ScreenSize} from '../../Utils/AppConstants';
import DropDownIcon from '../Svg/DropDownIcon';
import BackArrowIcon from '../Svg/BackArrowIcon';
import ForwardArrowIcon from '../Svg/ForwardArrowIcon';

type Props = {
  value?: number | string;
  onChange: (year: number) => void;
  placeholder?: string;
  startYear?: number;
  endYear?: number;
};

const YearPicker = ({
  value,
  onChange,
  placeholder = 'Birth Year',
  startYear = 1900,
  endYear = new Date().getFullYear(),
}: Props) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [open, setOpen] = useState(false);
  const [pageStart, setPageStart] = useState(Math.floor(endYear / 12) * 12);

  const years = Array.from({length: 12}, (_, i) => pageStart + i).filter(
    y => y >= startYear && y <= endYear,
  );

  const goPrev = () => {
    const next = pageStart - 12;
    if (next >= startYear) setPageStart(next);
  };

  const goNext = () => {
    const next = pageStart + 12;
    if (next <= endYear) setPageStart(next);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.input}
        onPress={() => setOpen(prev => !prev)}>
        <Text style={[styles.inputTxt, !value && {color: colors.Desc_Txt}]}>
          {value || placeholder}
        </Text>

        <DropDownIcon width={18} height={18} primary={colors.Heading_Txt} />
      </TouchableOpacity>

      {open && (
        <View style={styles.panel}>
          <View style={styles.header}>
            <TouchableOpacity onPress={goPrev} style={styles.arrowBtn}>
              <BackArrowIcon
                width={18}
                height={18}
                primary={colors.Heading_Txt}
              />
            </TouchableOpacity>

            <Text style={styles.rangeTxt}>
              {pageStart} – {pageStart + 11}
            </Text>

            <TouchableOpacity onPress={goNext} style={styles.arrowBtn}>
              <View style={{transform: [{scaleX: -1}]}}>
                <BackArrowIcon
                  width={18}
                  height={18}
                  primary={colors.Heading_Txt}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {years.map(year => {
              const selected = String(value) === String(year);

              return (
                <TouchableOpacity
                  key={year}
                  activeOpacity={0.8}
                  onPress={() => {
                    onChange(year);
                    setOpen(false);
                  }}
                  style={[
                    styles.yearItem,
                    selected && {backgroundColor: colors.Primary},
                  ]}>
                  <Text
                    style={[styles.yearTxt, selected && {color: colors.White}]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

export default YearPicker;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      zIndex: 999,
      elevation: 999,
    },
    input: {
      height: normalized(44),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(6),
      paddingHorizontal: normalized(12),
      backgroundColor: colors.Background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inputTxt: {
      flex: 1,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      textAlignVertical: 'center',
    },
    panel: {
      position: 'absolute',
      top: normalized(45),
      right: 0,
      width: ScreenSize.width - normalized(40),
      marginTop: normalized(3),
      borderRadius: normalized(6),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      backgroundColor: colors.Background,
      paddingVertical: normalized(10),
      shadowColor: colors.Black,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 1000,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: normalized(12),
      marginBottom: normalized(10),
    },
    arrowBtn: {
      width: normalized(28),
      height: normalized(28),
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowTxt: {
      fontSize: normalized(28),
      color: colors.Heading_Txt,
      lineHeight: normalized(30),
    },
    rangeTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: normalized(10),
    },
    yearItem: {
      width: '33.33%',
      height: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(6),
    },
    yearTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },
  });
