import React, {useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized} from '../../Utils/AppConstants';
import EmptyComp from './EmptyComp';
import {Empty_Screen_Type} from '../../Utils/AppStrings';
import PermissionDeniedSVG from '../Svg/PermissionDeniedSVG';

interface Props {
  message?: string;
  onGoBack?: () => void;
}

const PermissionDeniedScreen = ({
  message = "You don't have permission to access this screen.",
  onGoBack,
}: Props) => {
  const navigation = useNavigation();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  const styles = useMemo(() => AppStyles(colors), [colors]);

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.MainStyle,
        {alignItems: 'center', justifyContent: 'center'},
      ]}>
      <PermissionDeniedSVG size={200} primary={colors.Primary} />
      <Text
        style={[
          styles.Desc_Txt_N,
          {marginTop: normalized(8), paddingHorizontal: normalized(10)},
        ]}>
        {message}
      </Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleGoBack}
        style={{
          marginTop: normalized(24),
          backgroundColor: colors.Primary,
          paddingHorizontal: normalized(28),
          paddingVertical: normalized(12),
          borderRadius: normalized(8),
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={styles.btnTxt}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PermissionDeniedScreen;
