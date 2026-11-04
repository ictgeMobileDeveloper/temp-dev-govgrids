import {
  StyleSheet,
  Text,
  TextInputInstance,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppFonts, normalized} from '../../Utils/AppConstants';

const CustomInput = (props: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [secureEntry, setSecureEntry] = useState(props?.secureEntry ?? false);

  const inputRef = useRef<TextInputInstance>(null);
  const setInputRef = (r: TextInputInstance | null) => {
    inputRef.current = r;
    if (props?.ref) {
      if (typeof props.ref === 'function') props.ref(r);
      else props.ref.current = r;
    }
  };

  const focusInput = () => {
    if (props?.isMultiLine) {
      inputRef.current?.focus();
    }
  };

  return (
    // <View>
    <TouchableWithoutFeedback onPress={focusInput} accessible={false}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: props?.errorMsg
              ? colors.redLight
              : colors.Background,
            borderColor: props?.errorMsg ? colors.Error : colors.BorderColor,
            height: props?.isMultiLine ? normalized(116) : normalized(45),
            alignItems: props?.isMultiLine ? 'flex-start' : 'center',
          },
          {...props?.style},
        ]}>
        {props.LeftIcon ? <props.LeftIcon /> : null}

        <TextInput
          ref={setInputRef}
          editable={
            typeof props?.isEditable == 'boolean' ? props?.isEditable : true
          }
          placeholderTextColor={
            props?.errorMsg
              ? colors.Error
              : props?.placeholderColor ?? colors.Desc_Txt
          }
          placeholder={props?.placeholder}
          style={{
            ...styles.txtInput,
            ...props.textInputStyle,
            color:
              typeof props?.isEditable == 'boolean' && !props?.isEditable
                ? colors.Desc_Txt
                : props?.errorMsg
                ? colors?.black
                : colors.Heading_Txt,
            marginTop: props?.isMultiLine ? normalized(4) : 0,
            fontSize: normalized(props?.fontSize ?? 14),
            // ensure multi-line text starts at top
            textAlignVertical: props?.isMultiLine ? 'top' : 'center',
            textAlign: props?.isRight ? 'right' : 'left',
          }}
          secureTextEntry={secureEntry}
          onChangeText={(txt: any) => {
            if (props?.setValue && !props?.isDisable) props?.setValue(txt);
            props?.onChangeText?.(txt);
          }}
          keyboardType={props?.keyboardType ? props?.keyboardType : 'default'}
          multiline={props?.isMultiLine ? props?.isMultiLine : false}
          value={props?.value}
          blurOnSubmit={props?.blurOnSubmit}
          returnKeyType={props?.returnKeyType}
          onSubmitEditing={props?.onSubmitEditing}
          scrollEnabled={props?.isScrollable}
          maxLength={
            props?.maxLength
              ? props?.maxLength
              : props?.isMultiline
              ? 10000
              : 250
          }
        />

        {/* RIGHT ICON from props */}
        {!props?.showLastIcon && props.RightIcon ? (
          <TouchableOpacity
            style={{paddingLeft: normalized(10)}}
            onPress={() => {
              props?.onRightIconPress?.();
              setSecureEntry((prev: any) => !prev);
            }}
            activeOpacity={0.8}>
            <props.RightIcon primary={colors.Desc_Txt} />
          </TouchableOpacity>
        ) : null}

        {props?.rightComp && props?.rightComp}
      </View>
    </TouchableWithoutFeedback>
    //   {!!props?.errorMsg && (
    //   <Text style={styles.errorMsg}>
    //     {props.errorMsg}
    //   </Text>
    // )}
  );
};

export default CustomInput;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    inputContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      borderWidth: 1,
      borderRadius: normalized(8),
      width: '100%',
      paddingHorizontal: normalized(5),
      marginBottom: normalized(3),
    },
    txtInput: {
      includeFontPadding: false,
      flex: 1,
      paddingLeft: normalized(8),
      fontFamily: AppFonts.InterRegular,
      justifyContent: 'center',
    },
    errorMsg: {
      marginTop: normalized(3),
      color: 'red',
      fontSize: normalized(12),
      marginLeft: normalized(2),
    },
  });
