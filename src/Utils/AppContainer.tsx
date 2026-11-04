import {
  Alert,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AppStyles } from "./Utils/AppStyles";
import AuthStack from "./Navigation/AuthNavigation";
import { useDispatch, useSelector } from "react-redux";
import { AppRootStore } from "./Redux/store/AppStore";
import MainNavigation from "./Navigation/MainNavigation";
import ToastComp from "./Ui/Components/ToastComp";
import AppLoader from "./Ui/Components/AppLoader";
import AlertModal from "./Ui/Components/CustomModal/AlertModal";
import {
  setBanner,
  setCurrentLocation,
  setFlashBanner,
  setIsAlertShow,
  setIsShowNoti,
  setIsShowRegionRestModal,
  setNotificationsList,
  setPushNotifiObj,
  setShowAddressBottomSheet,
  setShowToast,
  setUserData,
} from "./Redux/Reducers/AppReducers";
import GetLocation from "react-native-get-location";
import {
  check,
  checkNotifications,
  openSettings,
  PERMISSIONS,
  request,
  requestNotifications,
  RESULTS,
} from "react-native-permissions";
import { ANNOUNCEMENT_PRIORITY, AppStrings } from "./Utils/AppStrings";
import CommonDataManager from "./Utils/CommonManager";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { extractAddressDetails } from "./Utils/Helper";
import {
  AppColors,
  AppFonts,
  lottieAnimation,
  normalized,
  ScreenProps,
} from "./Utils/AppConstants";
import LottieView from "lottie-react-native";
import RegionRestrictionModal from "./Ui/Components/CustomModal/RegionRestrictionModal";
import AnnouncementModal from "./Ui/Components/CustomModal/AnnouncementModal";
import {
  addAddressReq,
  getAnnouncementReq,
  saveFCMToken,
  setPrimaryAddressReq,
} from "./Network/GeneralServices";
import {
  getLastAnnouncementTime,
  getShownAnnouncementTypes,
  getUserToken,
  markAnnouncementTypeAsShown,
  resetAnnouncementProgress,
  setLastAnnouncementTime,
  setUserDataInAsync,
} from "./Utils/AsyncStorage";
import NotificationScreen from "./Ui/Sections/Notifications/Screens/NotificationScreen";
import { notifications } from "react-native-firebase-push-notifications";
import Geocoder from "react-native-geocoding";
import AdressBottomSheet from "./Ui/Sections/Home/Components/AdressBottomSheet";
import { getUserProfileReq } from "./Network/AuthServces";
import { Routes } from "./Utils/Routes";

const AppContainer = () => {
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer
  );
  const dispatch = useDispatch();
  const [isShowModal, setIsShowModal] = useState({
    value: false,
    type: "",
    orderId: "",
  });
  const [email, setEmail] = useState("");
  const [showAddBottomSheet, setShowAddBottomSheet] = useState(
    selector?.showAddBottomSheet
  );
  const [isVisible, setIsVisible] = useState(false);
  const Navigation: any = useNavigation();

  useEffect(() => {
    setShowAddBottomSheet(selector?.showAddBottomSheet);
    if (selector?.showAddBottomSheet) setIsVisible(true);
  }, [selector?.showAddBottomSheet]);

  // ------------------ location handelr
  const isFocused = useIsFocused();

  useEffect(() => {
    checkLocationFun();
  }, [isFocused]);

  useEffect(() => {
    if (selector?.userToken != null && selector?.userData) {
      fetchAnnouncements();
    }
  }, [selector?.userToken]);

  const fetchAnnouncements = async () => {
    getAnnouncementReq(selector?.userToken, async (resp: any) => {
      if (resp?.status) {
        const availableTypes = resp.data.map((item: any) => {
          if (item?.announcementType == "banner") {
            dispatch(
              setBanner({
                title: item?.title,
                description: item?.description,
                value: true,
              })
            );
          }
          if (item?.announcementType == "flashBanner") {
            dispatch(
              setFlashBanner({
                value: true,
                description: item?.description,
              })
            );
          }
        });

        if (availableTypes.includes("paymentPopup")) {
          setIsShowModal({
            value: true,
            type: "paymentPopup",
            orderId: resp?.pendingOrders[0],
          });
          return;
        }

        const shownTypes = await getShownAnnouncementTypes();
        const nextTypeToShow = ANNOUNCEMENT_PRIORITY?.find(
          (type: any) =>
            availableTypes.includes(type) && !shownTypes.includes(type)
        );

        if (!nextTypeToShow) {
          const lastShown = await getLastAnnouncementTime();
          const now = Date.now();
          const twoHoursInMs = 2 * 60 * 60 * 1000;
          if (lastShown && now - lastShown >= twoHoursInMs) {
            await resetAnnouncementProgress();
            fetchAnnouncements();
          }
          return;
        }

        setIsShowModal({
          value: true,
          type: nextTypeToShow,
          orderId: "",
        });

        await markAnnouncementTypeAsShown(nextTypeToShow);
        await setLastAnnouncementTime();
      }
    });
  };

  const checkLocationFun = async () => {
    if (Platform.OS == "android") {
      await androidLocationEnabler();
    } else {
      await checkLocation();
    }
  };

  const androidLocationEnabler = async () => {
    const result = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
    if (result == "granted") {
      getLocation();
    } else if (result == "denied") {
      const requestResult = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
      );
      if (requestResult == "granted") {
        getLocation();
      }
    } else if (result == "blocked") {
      CommonDataManager.getSharedInstance().showPopUpWithOptions(
        "",
        AppStrings.Network.locationPermission,
        "Go to settings",
        "Deny",
        (type) => {
          if (type == 0) {
            openSettings().catch(() => console.warn("cannot open settings"));
          }
        }
      );
    }
  };

  const checkLocation = async () => {
    check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            CommonDataManager.getSharedInstance().showPopUpWithOptions(
              "",
              AppStrings.Network.locationPermission,
              "Go to settings",
              "Deny",
              (type) => {
                if (type == 0) {
                  openSettings().catch(() =>
                    console.warn("cannot open settings")
                  );
                }
              }
            );
            break;
          case RESULTS.DENIED:
            getLocation();
            break;
          case RESULTS.LIMITED:
            break;
          case RESULTS.GRANTED:
            getLocation();
            break;
          case RESULTS.BLOCKED:
            CommonDataManager.getSharedInstance().showPopUpWithOptions(
              "",
              AppStrings.Network.locationPermission,
              "Go to settings",
              "Deny",
              (type) => {
                if (type == 0) {
                  openSettings().catch(() =>
                    console.warn("cannot open settings")
                  );
                }
              }
            );
            break;
        }
      })
      .catch((error: any) => {});
  };

  const getLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then((location) => {
        Geocoder.from({
          lat: location.latitude,
          lng: location.longitude,
        }).then(async (data) => {
          reverseGeocodingForAddress({
            coords: {
              latitude: location.latitude,
              longitude: location.longitude,
            },
          });
        });
      })
      .catch(async (error) => {
        console.log("Error location ---  ", error);
        const { message } = error;
        if (message == "Authorization denied") {
          CommonDataManager.getSharedInstance().showPopUpWithOptions(
            "",
            AppStrings.Network.locationPermission,
            "Go to settings",
            "Deny",
            (type) => {
              if (type == 0) {
                openSettings().catch(() =>
                  console.warn("cannot open settings")
                );
              }
            }
          );
        }
      });
  };

  const reverseGeocodingForAddress = (position: any) => {
    Geocoder.from([position?.coords?.latitude, position?.coords?.longitude])
      .then((json) => {
        const obj = extractAddressDetails(json.results[0]);
        const address = {
          address: json?.results[0]?.formatted_address,
          addressCoords: {
            lat: json.results[0]?.geometry?.location?.lat,
            lng: json.results[0]?.geometry?.location?.lng,
          },
          city: obj?.city,
          country: obj?.country,
          zipCode: obj?.zipcode,
          state: obj?.state,
          isPrimary: true,
        };
        dispatch(setCurrentLocation(address));
        // if (obj?.country != "United States") {
        //   dispatch(
        //     setIsShowRegionRestModal({
        //       value: true,
        //       isServiceAvaliable: false,
        //     })
        //   );
        //   return;
        // } else {
        //   dispatch(
        //     setIsShowRegionRestModal({
        //       value: true,
        //       isServiceAvaliable: true,
        //     })
        //   );
        // }
      })
      .catch((error) => console.warn("WARNING", error));
  };

  useEffect(() => {
    if (selector?.userData) {
      registerDevice();
    }
  }, [selector?.userData, selector?.userToken]);

  ////////Push notification-------->
  const registerDevice = async () => {
    if (Platform.OS == "ios") {
      await getPermissionsForNotification();
    } else {
      requestNotificationPermission();
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      const { status } = await checkNotifications();
      if (status !== "granted") {
        const { status: newStatus } = await requestNotifications([
          "alert",
          "sound",
        ]);
        if (newStatus === "granted") {
          getToken();
        } else {
          Alert.alert(
            "Notification Permission",
            "Notification permissions are required to receive notifications. Please enable them in settings."
          );
        }
      } else {
        getToken();
      }
    } else {
      getToken();
    }
  };

  const getToken = async () => {
    const token = await notifications.getToken();
    if (token && selector?.userData && selector?.userToken) {
      await saveFCMToken(selector?.userToken, token, (resp: any) => {
        dispatch(setNotificationsList(resp?.notifications));
      });
      // await updateFCMTokenReq(selector?.userData?.userId, token);
      onNotificationListener();
      onNotificationOpenedListener();
      getInitialNotification();
    }
  };

  const getPermissionsForNotification = async () => {
    const isPermission = await hasPermission();
    if (isPermission == false) {
      await requestPermission();
    }
    getToken();
  };

  const requestPermission = async () => {
    try {
      const permission = await notifications.requestPermission();
      return permission;
    } catch (error) {
      console.error("Error requesting permission:", error);
      return false; // or handle the error appropriately
    }
  };

  const hasPermission = async () => {
    return await notifications.hasPermission();
  };

  const setBadge = async (number: any) => {
    return await notifications.setBadge(number);
  };

  const getInitialNotification = async () => {
    const notification = await notifications
      .getInitialNotification()
      .then(async (remoteMessage: any) => {
        if (remoteMessage) {
          dispatch(setPushNotifiObj(remoteMessage.notification));
          setTimeout(() => {
            openDetail(remoteMessage.notification);
          }, 2000);
        }
      });
    return notification;
  };

  const onNotificationOpenedListener = (isAppOpen = false) => {
    notifications.onNotificationOpened((notification: any) => {
      dispatch(setPushNotifiObj(notification));
      if (isAppOpen) {
        openDetail(notification);
      } else {
        setTimeout(() => {
          openDetail(notification);
        }, 3000);
      }
    });
  };

  const onNotificationListener = async () => {
    notifications.onNotification(async (notification: any) => {
      dispatch(setPushNotifiObj(notification));
      dispatch(setIsShowNoti(true));
    });
  };

  const openDetail = (notification: any) => {
    if (Platform.OS == "android") {
      setBadge(0);
    }
    let item = selector?.pushObj?._data || notification?._data;
    // notifrication object item .
  };

  const NetworkAlertModal = () => (
    <Modal
      transparent={true}
      visible={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.modalContainer}>
        <View style={styles.alertBox}>
          <LottieView
            source={lottieAnimation.WifiLost}
            style={styles.lottieAnimation}
            autoPlay
            loop
          />
          <Text style={styles.oopsText}>Oops!</Text>
          <Text style={styles.alertTitle}>Connection Lost</Text>
          <Text style={styles.somethingWrongText}>Something went wrong</Text>
          <Text style={styles.alertMessage}>
            Please check your internet connection to continue using the app
            smoothly
          </Text>
        </View>
      </View>
    </Modal>
  );
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: AppColors.white.white,
      }}
    >
      {!selector?.isNetConnected && <NetworkAlertModal />}
      {selector?.userData ? <MainNavigation /> : <AuthStack />}
      {selector?.isLoaderStart && (
        <AppLoader visible={selector?.isLoaderStart} />
      )}
      {selector?.isAlertShow?.value && (
        <AlertModal
          visible={selector?.isAlertShow?.value}
          onPress={() => {
            dispatch(setIsAlertShow({ value: false, message: "" }));
          }}
          message={selector?.isAlertShow?.message}
        />
      )}
      {selector?.showToast?.message != "" ? <ToastComp /> : null}
      {/* {selector?.isShowRegionRestModal?.value && (
        <RegionRestrictionModal
          atConfirm={() => {
            dispatch(
              setIsSh-hazwRegionRestModal({
                value: false,
                isServiceAvaliable: false,
              })
            );
          }}
        />
      )} */}
      <AnnouncementModal
        visible={isShowModal?.value}
        onClose={() => setIsShowModal({ value: false, type: "", orderId: "" })}
        type={isShowModal?.type}
        orderId={isShowModal?.orderId}
        email={email}
        setEmail={setEmail}
      />

      {isVisible && (
        <AdressBottomSheet
          isVisible={showAddBottomSheet}
          onClose={() => {
            setShowAddBottomSheet(false);
            dispatch(setShowAddressBottomSheet(false));
          }}
          address={selector?.userData?.addresses}
          onCurrentLoc={() => {
            const currentLoc = selector?.currentLocation;
            const addressList = selector?.userData?.addresses || [];
            const existingAddress = addressList.find(
              (item: any) =>
                item?.address === currentLoc?.address &&
                item?.addressCoords?.lat === currentLoc?.addressCoords?.lat &&
                item?.addressCoords?.lng === currentLoc?.addressCoords?.lng
            );

            const closeSheetAndRefresh = () => {
              setShowAddBottomSheet(false);
              dispatch(setShowAddressBottomSheet(false));
            };

            const updateProfile = () => {
              getUserProfileReq(selector?.userToken, (resp: any) => {
                if (resp?.status) {
                  setUserDataInAsync(resp?.data);
                  dispatch(setUserData(resp?.data));
                }
              });
            };

            if (existingAddress) {
              setPrimaryAddressReq(
                existingAddress.id,
                selector?.userToken,
                (resp: any) => {
                  if (resp?.status) {
                    updateProfile();
                  }
                  closeSheetAndRefresh();
                }
              );
            } else {
              const updatedAddresses = [
                {
                  ...currentLoc,
                  isPrimary: true,
                  id: Date.now(),
                },
                ...addressList.map((addr: any) => ({
                  ...addr,
                  isPrimary: false,
                })),
              ];

              const newUserData = {
                ...selector?.userData,
                addresses: updatedAddresses,
              };

              setUserDataInAsync(newUserData);
              dispatch(setUserData(newUserData));
              closeSheetAndRefresh();
            }
          }}
          setPrimaryAddress={(item: any) => {
            setPrimaryAddressReq(item?.id, selector?.userToken, (resp: any) => {
              if (resp?.status) {
                getUserProfileReq(selector?.userToken, (resp: any) => {
                  if (resp?.status) {
                    setUserDataInAsync(resp?.data);
                    dispatch(setUserData(resp?.data));
                  }
                });
              }
            });
            setShowAddBottomSheet(false);
            dispatch(setShowAddressBottomSheet(false));
          }}
          onEditAddress={(item: any) => {
            setShowAddBottomSheet(false);
            dispatch(setShowAddressBottomSheet(false));
            setTimeout(() => {
              Navigation?.navigate(Routes.Home.AddAddressScreen, {
                item: item,
              });
            }, 500);
          }}
          onAddNewAddress={() => {
            setShowAddBottomSheet(false);
            dispatch(setShowAddressBottomSheet(false));
            setTimeout(() => {
              Navigation?.navigate(Routes.Home.AddAddressScreen, {
                isNewAddress: true,
              });
            }, 500);
          }}
        />
      )}
    </View>
  );
};

export default AppContainer;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.71)",
  },
  lottieAnimation: {
    width: normalized(60),
    height: normalized(60),
    alignSelf: "center",
    marginBottom: normalized(10),
  },
  oopsText: {
    fontSize: normalized(19),
    color: AppColors.red.dark,
    textAlign: "center",
    marginBottom: 5,
    fontFamily: AppFonts.InterSemiBold,
  },
  somethingWrongText: {
    fontSize: normalized(14),
    color: AppColors.black.black,
    textAlign: "center",
    marginBottom: normalized(10),
    fontFamily: AppFonts.InterMedium,
  },
  alertTitle: {
    fontSize: normalized(17),
    marginBottom: 8,
    color: AppColors.red.dark,
    textAlign: "center",
    fontFamily: AppFonts.InterSemiBold,
  },
  alertMessage: {
    fontSize: normalized(12),
    color: AppColors.black.black,
    textAlign: "center",
    lineHeight: normalized(15),
    fontFamily: AppFonts.InterMedium,
    width: "85%",
  },
  alertBox: {
    backgroundColor: AppColors.white.white,
    padding: normalized(20),
    borderRadius: normalized(15),
    width: "85%",
    alignItems: "center",
  },
});
