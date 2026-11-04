import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {
  AppHorizontalMargin,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../Utils/AppStrings';
import {getErrorMessage, lightenHexColor} from '../../Utils/Helper';
import EmptyComp from '../Components/EmptyComp';
import DocumentIcon from '../Svg/DocumentIcon';
import {Routes} from '../../Utils/Routes';

const GenralFormScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();

  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors, insects)}),
    [colors, insects],
  );

  const [forms, setForms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getPublicForms = useCallback(() => {
    setIsLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.generalFormList,
      method: 'GET',
      useRecaptcha: true,
      onComplete: (resp: any) => {
        setIsLoading(false);

        if (resp?.status) {
          setForms(resp?.data?.data ?? resp?.data ?? []);
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
  }, [dispatch]);

  useEffect(() => {
    getPublicForms();
  }, [getPublicForms]);

  const renderFormItem = ({item}: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.itemCont, styles.card]}
        onPress={() => {
          props.navigation.navigate(Routes.GPF.GeneralFormSubmissionScreen, {
            form: item,
          });
        }}>
        <View style={styles.iconCont}>
          <DocumentIcon width={24} height={24} primary={colors.Primary} />
        </View>

        <Text numberOfLines={1} style={styles.item_Heading}>
          {item?.name ?? 'Untitled Form'}
        </Text>

        {!!item?.shortDescription && (
          <Text numberOfLines={2} style={[styles.keyTxt, styles.formDesc]}>
            {item.shortDescription}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, styles.safeArea]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props.navigation.goBack()}
        text="General Public Forms"
        desc="Access and review available general public forms."
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      ) : (
        <FlatList
          data={forms}
          keyExtractor={(item, index) => String(item?.id ?? index)}
          renderItem={renderFormItem}
          contentContainerStyle={styles.listCont}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyCont}>
              <EmptyComp
                type={Empty_Screen_Type.List}
                subText="No Forms Found"
              />
            </View>
          )}
        />
      )}
    </View>
  );
};

export default GenralFormScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },

    listCont: {
      marginTop: normalized(10),
      paddingHorizontal: AppHorizontalMargin,
      paddingBottom: normalized(30),
      gap: normalized(14),
    },
    card: {
      minHeight: normalized(96),
      backgroundColor: colors.Background,
      padding: normalized(14),
      justifyContent: 'flex-start',
    },
    iconCont: {
      width: normalized(56),
      height: normalized(56),
      borderRadius: normalized(8),
      backgroundColor: lightenHexColor(colors.Primary, 0.9),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: normalized(18),
    },
    formDesc: {
      lineHeight: normalized(17),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyCont: {
      height: ScreenSize.height * 0.55,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
