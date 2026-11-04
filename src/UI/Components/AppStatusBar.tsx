import React from 'react';
import {StyleSheet, StatusBar, View} from 'react-native';
interface Props {
  backgroundColor: string;
  barStyle?: any;
  statusBarHeight?: any;
}
const AppStatusBar = ({backgroundColor, barStyle, statusBarHeight}: Props) => {
  return (
    <View
      style={[
        styles.statusBar,
        {backgroundColor: backgroundColor},
        statusBarHeight,
      ]}>
      <StatusBar barStyle={barStyle} />
    </View>
  );
};
const BAR_HEIGHT = StatusBar.currentHeight;
const styles = StyleSheet.create({
  statusBar: {
    // height: BAR_HEIGHT,
  },
});
export default AppStatusBar;
