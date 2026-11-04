import React, { useMemo } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { AppStrings } from "../../Utils/AppStrings";
import { AppColors, hv, normalized } from "../../Utils/AppConstants";
import AppStatusBar from "./AppStatusBar";
import { useSelector } from "react-redux";
import { AppRootStore } from "../../Redux/AppStore";
import { AppStyles } from "../../Utils/AppStyles";
import CustomButton from "./CustomButton";

interface Props {
  message: any;
  onPress: any;
  visible: any;
  indigo?: any;
}
export default function AlertModal(props: Props) {
    const selector = useSelector((state: AppRootStore) => state.SliceReducer);
    const colors = selector?.themeColors;
    const styles = useMemo(
        () => ({ ...makeStyles(colors), ...AppStyles(colors) }),
        [colors],
      );

  return (
    <Modal animationType="fade" visible={props?.visible} transparent={true}>
      <AppStatusBar
        backgroundColor={
          props.indigo ? "rgba(13, 13, 46,0.92)" : "rgba(0,0,0,0.3)"
        }
        barStyle={"light-content"}
      />

      <View style={styles.container}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>Alert</Text>
          <Text style={styles.label}>
            {props.message || AppStrings.Network.someThingError}
          </Text>
          <CustomButton
            style={{
              width: normalized(150),
              height: normalized(50),
              marginVertical: 0,
            }}
            text="Ok"
            onPress={() => props?.onPress()}
          />
        </View>
      </View>
    </Modal>
  );
}
const makeStyles = (colors: any) =>
    StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertBox: {
    marginHorizontal: normalized(20),
    backgroundColor: AppColors.White,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    padding: normalized(15),
  },
  label: {
    fontSize: normalized(14),
    color: AppColors.Black,
    marginVertical: hv(15),
    textAlign: "center",
  },
  title: {
    fontSize: normalized(18),
    color: colors.Primary,
  },
});
