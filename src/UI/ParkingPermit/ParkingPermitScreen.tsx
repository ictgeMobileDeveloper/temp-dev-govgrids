import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated as RNAnimated,
  Easing,
} from "react-native";
import CustomDrawer from "../Components/CustomDrawer";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { AppRootStore } from "../../Redux/AppStore";
import { AppStyles } from "../../Utils/AppStyles";

import {
  normalized,
  ParkingPermitStatusList,
  ScreenProps,
  ScreenSize,
  sortingList,
} from "../../Utils/AppConstants";
import CustomHeader from "../Components/CustomHeader";
import CustomButton from "../Components/CustomButton";
import { Routes } from "../../Utils/Routes";
import ForwardArrowIcon from "../Svg/ForwardArrowIcon";
import CustomInput from "../Components/CustomInput";
import CustomDropDownList from "../Components/CustomDropDownList";
import { apiHandler } from "../../Network/Services/ApiHandler";
import { ENDPOINTS } from "../../Network/Urls";
import { setShowToast } from "../../Redux/AppReducers";
import { AppStrings, Empty_Screen_Type } from "../../Utils/AppStrings";
import OfflineIcon from "../Svg/OfflineIcon";
import LinearGradient from "react-native-linear-gradient";
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
} from "../../Utils/Helper";
import EmptyComp from "../Components/EmptyComp";
import moment from "moment";
import SideFilterIcon from "../Svg/SideFilterIcon";
import { useDrawer } from "../../Hooks/DrawerAnimation";
import { CompanyListComp } from "./Components/ParkingCompanyComp";
import { useFocusRefresh } from "../../Network/Services/FocusRefresh";

const Comp = ({ item, onPress, type }: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({ ...makeStyles(colors), ...AppStyles(colors) }),
    [colors],
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.itemCont}
    >
      <View style={styles.rowCont}>
        <Text style={styles.nameTxt}>{item?.formId ?? item?.sessionId}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Resident Name</Text>
          <Text style={styles.valueTxt}>
            {`${item?.firstName} ${item?.lastName}`}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Form Status</Text>
          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: getStatusColor(
                  item?.formStatus ?? item?.status,
                  colors,
                ),
                alignSelf: "flex-start",
              },
            ]}
          >
            <Text style={styles.statusTxt}>
              {capitalizeEachWord(item?.formStatus ?? item?.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Payment Status</Text>
          <View
            style={[
              styles.statusCont,
              {
                backgroundColor: getStatusColor(item?.paymentStatus, colors),
                alignSelf: "flex-start",
              },
            ]}
          >
            <Text style={styles.statusTxt}>
              {capitalizeEachWord(item?.paymentStatus)}
            </Text>
          </View>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>
            {type === "Permits" ? "Permit Type" : "Booking Type"}
          </Text>
          <Text style={styles.valueTxt}>
            {capitalizeEachWord(item?.permitType?.type ?? item?.bookingType)}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>No. of Vehicles</Text>
          <Text style={styles.valueTxt}>{item?.vehicles?.length}</Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Building Name</Text>
          <Text style={styles.valueTxt}>
            {item?.parkingSite?.buildingName ?? item?.siteName ?? "N/A"}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.keyTxt}>Created At</Text>
          <Text style={styles.valueTxt}>
            {item?.createdAt
              ? moment(item.createdAt).format("MMM DD, YYYY")
              : "N/A"}
          </Text>
        </View>
        {type === "Permits" ? (
          <View style={styles.item}>
            <Text style={styles.keyTxt}>Permit ID</Text>
            <Text style={styles.valueTxt}>{item?.permitId ?? "N/A"}</Text>
          </View>
        ) : (
          <View style={styles.item}>
            <Text style={styles.keyTxt}>Start Time</Text>
            <Text style={styles.valueTxt}>
              {item?.startTime
                ? moment(item.startTime).format("MMM DD, YYYY, h:mm A")
                : "N/A"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ParkingPermitScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({ ...makeStyles(colors), ...AppStyles(colors) }),
    [colors],
  );
  const dispatch = useDispatch();
  const isOnline = selector?.isNetConnected;
  const [search, setSearch] = useState("");
  const [sortIndex, setSortIndex] = useState<any>(null);
  const [list, setList] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const type = props?.route?.params?.type;
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [refreshing, setRefreshing] = useState(false);
  const isCompany = props?.route?.params?.isCompany ?? false;

  // console.log(type, "parking permit type");

  const [queryParams, setQueryparams] = useState({});

  const { isDrawerOpen, drawerAnim, overlayAnim, openDrawer, closeDrawer } =
    useDrawer();

  // useEffect(() => {
  //   getRequests();
  // }, [page, search, queryParams]);

  const getRequests = (opts?: { silent?: boolean }) => {
    page === 1 && !opts?.silent && setIsLoading(true);
    apiHandler({
      endpoint: isCompany
        ? ENDPOINTS.allParkingCompany
        : type === "Permits"
        ? ENDPOINTS.allParkingPermit
        : ENDPOINTS.allParkingSession,
      method: "GET",
      queryParams: {
        page,
        pageSize: 10,
        query: search,
        sort: sortingList[sortIndex]?.key ?? "",
        ...queryParams,
      },
      authContext: "RESIDENT",
      onComplete: (resp: any) => {
        setRefreshing(false);
        if (resp?.status) {
          setIsLoading(false);
          setTotalItems(resp?.pagination?.totalItems ?? 0);
          if (page === 1) {
            if (isCompany) {
              setList(resp?.data?.data || []);
            } else {
              setList(resp?.data?.data?.data || []);
            }
          } else {
            setList((prevList: any) => [
              ...prevList,
              ...resp?.data?.data?.filter(
                (item: any) =>
                  !prevList.some((prevItem: any) => prevItem?.id === item?.id),
              ),
            ]);
          }
        } else {
          setIsLoading(false);
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
  useFocusRefresh(getRequests, [page, search, queryParams]);
  const onRefresh = () => {
    setRefreshing(true);
    if (page !== 1) {
      setPage(1);
      return;
    }
    getRequests();
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == "ios" ? 15 : 0),
          paddingBottom: Platform.OS == "android" ? insects.bottom : 0,
        },
      ]}
    >
      <StatusBar
        barStyle={selector?.isDarkTheme ? "light-content" : "dark-content"}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={
          isCompany
            ? "Parking Company"
            : type === "Permits"
            ? "Parking Permit Requests"
            : "Parking Session Requests"
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.Primary}
            colors={[colors.Primary]}
          />
        }
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(30),
        }}
      >
        {/* <View style={[styles.row, {marginTop: normalized(12)}]}>
          <Text style={styles.headTxt}>Requests</Text>
          <LinearGradient
            colors={[colors.Primary, colors.Secondary]}
            style={styles.sidePanelCont}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() =>
                props?.navigation?.navigate(
                  Routes.ParkingPermit.OfflineReqScreen,
                )
              }>
              <OfflineIcon />
            </TouchableOpacity>
          </LinearGradient>
        </View> */}

        <View
          style={[
            styles.row,
            { marginTop: normalized(12), gap: normalized(10) },
          ]}
        >
          <View style={{ flex: 1 }}>
            <CustomInput
              value={search}
              setValue={setSearch}
              placeholder={"Search"}
              placeholderColor={colors.Heading_Txt}
            />
          </View>

          <LinearGradient
            colors={[colors.Primary, colors.Secondary]}
            style={styles.sidePanelCont}
          >
            <TouchableOpacity activeOpacity={1} onPress={openDrawer}>
              <SideFilterIcon />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {list.length === 0 && isLoading ? (
          <View style={styles.loaderCont}>
            <ActivityIndicator color={colors.Primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item, idx) => String(item?.id ?? idx)}
            contentContainerStyle={{
              marginTop: normalized(10),
              gap: normalized(12),
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              isCompany ? (
                <CompanyListComp
                  item={item}
                  OnPress={() => {
                    props?.navigation?.navigate(
                      Routes.ParkingPermit.ParkingCompany,
                      {
                        companyId: item?.id,
                      },
                    );
                  }}
                  OnSubmitPress={() => {
                    props?.navigation?.navigate(
                      Routes.ParkingPermit.RequestSubmit,
                      {
                        isCompany: true,
                        companyId: item?.id,
                      },
                    );
                  }}
                />
              ) : (
                <Comp
                  item={item}
                  type={type}
                  onPress={() => {
                    if (type === "Permits") {
                      props?.navigation?.navigate(
                        Routes.ParkingPermit.ReqDetail,
                        {
                          id: item?.id,
                          formId: item?.formId,
                        },
                      );
                    } else {
                      props?.navigation?.navigate(
                        Routes.ParkingPermit.SessionDetail,
                        {
                          SessionId: item?.sessionId,
                        },
                      );
                    }
                  }}
                />
              )
            }
            ListEmptyComponent={() =>
              !isLoading ? (
                <View style={styles.emptyCont}>
                  <EmptyComp
                    type={Empty_Screen_Type.List}
                    subText="No Data Found"
                  />
                </View>
              ) : null
            }
            ListFooterComponent={() =>
              list.length < totalItems ? (
                <View
                  style={{
                    height: normalized(20),
                    marginTop: normalized(12),
                  }}
                >
                  <ActivityIndicator size="large" color={colors.Primary} />
                </View>
              ) : (
                <View style={{ height: normalized(10) }} />
              )
            }
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              if (!isLoading && list.length < totalItems) {
                setPage((prev) => prev + 1);
              }
            }}
          />
        )}
      </ScrollView>
      <CustomDrawer
        isVisible={isDrawerOpen}
        drawerAnim={drawerAnim}
        statusList={ParkingPermitStatusList}
        overlayAnim={overlayAnim}
        hideSearchBar={true}
        hidePaymentStatus={true}
        onClose={closeDrawer}
        topOffset={insects.top + normalized(Platform.OS == "ios" ? 36 : 52)}
        closeDrawer={closeDrawer}
        onApply={(queryString: any, params: any) => {
          setQueryparams(params);
          setPage(1);
        }}
      />
    </View>
  );
};

export default ParkingPermitScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    dropdownList: {
      position: "absolute",
      zIndex: 99,
      top: normalized(45),
      width: "100%",
    },
    loaderCont: {
      minHeight: ScreenSize.height / 1.4,
      alignItems: "center",
      justifyContent: "center",
    },
    headTxt: {
      fontSize: normalized(20),
      color: colors.Heading_Txt,
      flex: 1,
    },
    sidePanelCont: {
      width: normalized(30),
      height: normalized(30),
      borderRadius: normalized(30),
      alignItems: "center",
      justifyContent: "center",
    },
    emptyCont: {
      minHeight: ScreenSize.height / 2,
      alignItems: "center",
      justifyContent: "center",
    },
  });
