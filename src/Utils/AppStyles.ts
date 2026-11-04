import {Platform, StyleSheet} from 'react-native';
import {AppFonts, normalized, ScreenSize} from './AppConstants';
import {lightenHexColor} from './Helper';

export const AppStyles = (colors: any, insects?: any) =>
  StyleSheet.create({
    MainStyle: {
      flex: 1,
      backgroundColor: colors.Background,
      paddingHorizontal: normalized(20),
    },
    Main_Heading: {
      fontFamily: AppFonts.SonoBold,
      color: colors.Heading_Txt,
      fontSize: normalized(24),
    },
    Heading1: {
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      textAlign: 'center',
    },
    Heading2: {
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
      fontSize: normalized(12),
      textAlign: 'center',
    },
    Heading: {
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Heading_Txt,
      fontSize: normalized(20),
      textAlign: 'center',
    },
    Desc_Txt: {
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
      fontSize: normalized(16),
      textAlign: 'center',
    },
    Desc_Txt_N: {
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
      fontSize: normalized(14),
      textAlign: 'center',
    },
    Desc_Txt_N1: {
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
      fontSize: normalized(12),
      textAlign: 'center',
    },
    Desc_Txt_Main_Card: {
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
      fontSize: normalized(11),
      fontWeight: '400',
      textAlign: 'center',
    },
    Input_Heading: {
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      marginVertical: normalized(8),
      // textAlign: 'left',
    },

    CardheadingTxt: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
    CarddescTxt: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuMedium,
      lineHeight: normalized(18),
      marginVertical: normalized(6),
    },
    Text_Button: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Desc_Txt,
    },
    Modal_Heading_Txt: {
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
    },
    Input_Row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
    },
    addressBox: {
      flexDirection: 'row',
      alignSelf: 'center',
      borderWidth: 1,
      borderRadius: normalized(8),
      alignItems: 'center',
      width: '100%',
      // height: normalized(40),
      paddingHorizontal: normalized(12),
      marginBottom: normalized(3),
    },
    nameTxt: {
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuMedium,
      color: colors.Heading_Txt,
    },
    keyTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      lineHeight: normalized(18),
    },
    valueTxt: {
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      lineHeight: normalized(20),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      columnGap: normalized(24),
      rowGap: normalized(8),
    },
    addressrow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    itemCont: {
      width: '100%',
      borderWidth: 1,
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      padding: normalized(14),
      gap: normalized(10),
      backgroundColor: colors.ScreenBackground,
    },
    addressTxt: {
      flexShrink: 1,
      marginHorizontal: normalized(10),
      color: colors.Desc_Txt,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuRegular,
    },
    loaderCont: {
      flex: 1,
      minHeight: ScreenSize.height / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: normalized(28),
    },
    nextBtnCont: {
      width: normalized(90),
      alignSelf: 'flex-end',
      marginTop: normalized(14),
    },
    statusCont: {
      height: normalized(24),
      paddingVertical: normalized(4),
      paddingHorizontal: normalized(10),
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(24),
    },
    statusTxt: {
      fontSize: normalized(12),
      color: colors.White,
      fontFamily: AppFonts.UbuntuBold,
      textAlign: 'center',
    },
    btnTxt: {
      color: colors.Background,
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(14),
    },
    pillCont: {
      flexDirection: 'row',
      alignItems: 'center',
      columnGap: normalized(6),
    },
    pillWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: normalized(6),
      rowGap: normalized(6),
    },
    item: {
      flex: 1,
      minWidth: 0,
      gap: normalized(3),
      alignItems: 'flex-start',
    },
    item_Heading: {
      fontSize: normalized(16),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
    safeArea: {
      paddingTop: insects?.top - normalized(Platform.OS == 'ios' ? 15 : 0),
      paddingBottom: Platform.OS == 'android' ? insects?.bottom : 0,
    },
    sidePanelCont: {
      width: normalized(36),
      height: normalized(36),
      borderRadius: normalized(10000),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
