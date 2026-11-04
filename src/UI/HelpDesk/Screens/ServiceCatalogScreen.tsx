import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useMemo, useState} from 'react';
import Stepper from '../../Components/Stepper';
import {
  AppHorizontalMargin,
  normalized,
  ScreenProps,
  Service_Stepper_List,
} from '../../../Utils/AppConstants';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import {Routes} from '../../../Utils/Routes';
import ServiceIcon from '../../Svg/ServiceIcon';
import SimpleButton from '../../Components/SimpleButton';

const ServiceCatalogScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const list = props?.route?.params?.data;
  console.log(' service Catalog ', list);

  return (
    <View style={{backgroundColor: colors.ScreenBackground, flex: 1}}>
      <Stepper
        list={Service_Stepper_List}
        completedSteps={[Service_Stepper_List[0]]}
        activeStep={Service_Stepper_List[1]}
      />
      <FlatList
        data={list}
        contentContainerStyle={styles.listCont}
        renderItem={({item}: any) => {
          return (
            <TouchableOpacity
              activeOpacity={1}
              style={[styles.itemCont, styles.item]}
              onPress={() =>
                props?.navigation?.navigate(
                  Routes.HelpDesk.FormSubmissionScreen,
                  {
                    customFields: item?.customFields,
                    catalogId: item?.id,
                    catalogName: item?.name,
                    taskCategory: props?.route?.params?.taskCategory,
                  },
                )
              }>
              <ServiceIcon color={colors.primary} />
              <Text style={styles.Heading}>{item?.name}</Text>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={() => (
          <View style={styles.nextBtnCont}>
            <SimpleButton
              text={'Back'}
              onPress={() => props?.navigation?.goBack()}
              loading={false}
            />
          </View>
        )}
      />
    </View>
  );
};

export default ServiceCatalogScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    item: {
      alignItems: 'flex-start',
      gap: normalized(40),
    },
    listCont: {
      marginVertical: normalized(10),
      paddingHorizontal: AppHorizontalMargin,
      gap: normalized(12),
    },
    nextBtnCont: {
      width: normalized(120),
    },
  });
