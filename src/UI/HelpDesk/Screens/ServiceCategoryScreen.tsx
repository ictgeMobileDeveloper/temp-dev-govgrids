import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import Stepper from '../../Components/Stepper';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import ServiceIcon from '../../Svg/ServiceIcon';
import {
  AppHorizontalMargin,
  normalized,
  ScreenProps,
  Service_Stepper_List,
} from '../../../Utils/AppConstants';
import {Routes} from '../../../Utils/Routes';
import {useIsFocused} from '@react-navigation/native';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings} from '../../../Utils/AppStrings';
import {getErrorMessage} from '../../../Utils/Helper';
import AppImageViewer from '../../Components/AppImageView';

const ServiceCategoryScreen = (props: ScreenProps) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [list, setList] = useState<any>([]);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchTickets();
  }, [isFocused]);

  const fetchTickets = () => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.helpDeskServiceCategoryList,
      method: 'GET',
      queryParams: {
        page: 1,
        pageSize: 'all',
      },
      authContext: 'HELPDESK',
      onComplete: (resp: any) => {
        if (resp?.status) {
          console.log('HelpDesk response', resp);
          setList(resp?.data?.data || []);
          setIsLoading(false);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
          setIsLoading(false);
        }
      },
    });
  };

  return (
    <View style={{backgroundColor: colors.ScreenBackground, flex: 1}}>
      <Stepper
        list={Service_Stepper_List}
        completedSteps={[]}
        activeStep={Service_Stepper_List[0]}
      />

      {isLoading ? (
        <View style={styles.looaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
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
                    Routes.HelpDesk.ServiceCatalogScreen,
                    {
                      data: item?.catalogs,
                      taskCategory: item?.id,
                    },
                  )
                }>
                <AppImageViewer
                  source={{uri: item?.icon}}
                  style={{
                    borderRadius: normalized(100),
                    width: normalized(60),
                    height: normalized(60),
                  }}
                  resizeMode="cover"
                />
                <Text style={styles.Heading}>{item?.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

export default ServiceCategoryScreen;

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
    looaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
