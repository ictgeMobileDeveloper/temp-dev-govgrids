import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {useDispatch, useSelector} from 'react-redux';
import {SECRET_KEYS} from '../../Network/Urls';
import {extractAddressDetails} from '../../Utils/Helper';
import {AppColors, hv, normalized} from '../../Utils/AppConstants';
import LocationIcon from '../Svg/LocationIcon';
import CloseIcon from '../Svg/CloseIcon';
import {AppRootStore} from '../../Redux/AppStore';

interface Props {
  specificReg?: any;
  containerStyle?: any;
  onGetAddress?: (val: any) => void;
  placeholder?: string;
  searchTxt?: string;
  setSearchTxt: (val: string) => void;
  onClear: () => void;
}

const GooglePlacesInput = (props: Props) => {
  const dispatch = useDispatch();
  const googlePlaceAutoCompleteRef = useRef<any>(null);
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  useEffect(() => {
    if (props?.searchTxt) {
      googlePlaceAutoCompleteRef.current?.setAddressText(props?.searchTxt);
    }
  }, [props?.searchTxt]);

  const query = useRef({
    key: SECRET_KEYS.GOOGLE_MAP_KEY,
    language: 'en',
    components: 'country:us',
  }).current;

  return (
    <View style={[styles.container, props.containerStyle]}>
      <GooglePlacesAutocomplete
        ref={googlePlaceAutoCompleteRef}
        placeholder={props.placeholder || 'Enter address'}
        keyboardShouldPersistTaps="always"
        enablePoweredByContainer={true}
        debounce={300}
        fetchDetails={true}
        minLength={2}
        timeout={20000}
        isRowScrollable={true}
        predefinedPlaces={[]}
        predefinedPlacesAlwaysVisible={false}
        keepResultsAfterBlur={false}
        query={query}
        onPress={(data, details = null) => {
          console.log('data ---- ', data, '   -  detail s-0----  ', details);

          const address = {
            ...extractAddressDetails(details),
            address: details?.formatted_address,
            lat: details?.geometry?.location?.lat,
            lng: details?.geometry?.location?.lng,
          };

          //   if (address?.country !== 'United States') {
          //     dispatch(
          //       setShowToast({
          //         type: AppStrings.ToastType.warning,
          //         message:
          //           'This Application is currently available in United States',
          //       }),
          //     );
          //     return;
          //   }

          props?.onGetAddress?.(address);
        }}
        onFail={error => {
          console.log('GoogleAutocomplete Error: ', error);
        }}
        textInputProps={{
          value: props?.searchTxt,
          onChangeText: props.setSearchTxt,
          placeholderTextColor: AppColors.Grey_2,
        }}
        styles={{
          container: {
            width: '100%',
            zIndex: 99,
          },
          textInputContainer: {
            backgroundColor: 'transparent',
            height: normalized(45),
          },
          textInput: {
            height: normalized(45),
            color: AppColors.Black,
            fontSize: normalized(14),
            paddingLeft: normalized(10),
            paddingTop: Platform.OS === 'ios' ? 0 : hv(8),
            backgroundColor: AppColors.White,
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: normalized(20),
          },
          description: {
            color: AppColors.Black,
          },
          loader: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: normalized(20),
          },
        }}
      />
      {props?.searchTxt ? (
        <TouchableOpacity activeOpacity={1} onPress={() => props?.onClear()}>
          <CloseIcon primary={colors.Desc_Txt} />
        </TouchableOpacity>
      ) : (
        <LocationIcon primary={colors.Desc_Txt} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // flex: 1,
    borderColor: AppColors.Grey_2,
    borderWidth: 1,
    borderRadius: normalized(10),
    height: normalized(45),
    alignItems: 'center',
    paddingRight: normalized(5),
  },
});

export default GooglePlacesInput;
