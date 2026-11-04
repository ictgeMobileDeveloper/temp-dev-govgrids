import React, {useEffect, useMemo, useState} from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import CustomInput from '../Components/CustomInput';
import CustomButton from '../Components/CustomButton';
import CustomDropDownList from '../Components/CustomDropDownList';
import CustomDocumentPicker from '../Components/CustomDocumentPicker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {getErrorMessage} from '../../Utils/Helper';
import PlusIcon from '../Svg/PlusIcon';
import MinusIcon from '../Svg/MinusIcon';

const CLAIM_TYPE_LIST = [
  {name: 'Complete Cart', value: 'completeCart'},
  {name: 'Cart Lid', value: 'cartLid'},
  {name: 'Cart Tyres', value: 'cartTyres'},
];

type ClaimRow = {
  serialIndex: number | null;
  claimTypeIndex: number | null;
  errors: {serialIndex: string; claimTypeIndex: string};
};

const initialClaimRow: ClaimRow = {
  serialIndex: null,
  claimTypeIndex: null,
  errors: {serialIndex: '', claimTypeIndex: ''},
};

const CartRentalReportSubmission = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const dispatch = useDispatch();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [cartReqLoading, setCartReqLoading] = useState(false);
  const [cartReqList, setCartReqList] = useState<any[]>([]);
  const [cartReqIndex, setCartReqIndex] = useState<number | null>(null);
  const [cartReqError, setCartReqError] = useState('');
  const [isCartReqOpen, setIsCartReqOpen] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // ---- multi-row serial number + claim type state ----
  const [claimRows, setClaimRows] = useState<ClaimRow[]>([
    {...initialClaimRow},
  ]);

  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const selectedCartReq =
    cartReqIndex !== null ? cartReqList[cartReqIndex] : null;
  const cartList = selectedCartReq?.carts ?? [];
  const requestId = props?.route?.params?.requestId;
  const reference = props?.route?.params?.navigation;
  console.log('reference:', reference, requestId);

  const isCartDamage = reference === 'CartDamage';
  console.log(reference, isCartDamage, requestId);
  const getEndpoints = () => {
    if (isCartDamage) return ENDPOINTS.cartDamageRequestSubmission;
    else return ENDPOINTS.cartReturnRequestSubmission;
  };

  useEffect(() => {
    fetchCartRequests();
  }, []);

  const fetchCartRequests = () => {
    setCartReqLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.cartsDeliveredReq,
      method: 'GET',
      queryParams: {
        page: 1,
        pageSize: 100,
        query: '',
      },
      authContext: 'RESIDENT',
      onComplete: (resp: any) => {
        setCartReqLoading(false);
        if (resp?.status) {
          const list = resp?.data?.data ?? [];
          setCartReqList(list);
          console.log(list);
          const idx = list.findIndex(
            (r: any) =>
              String(r?.id) === String(requestId) ||
              String(r?.requestId) === String(requestId),
          );
          if (requestId && idx !== -1) setCartReqIndex(idx);
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
  };

  // reset rows whenever the cart request changes, since serials belong to that request
  const onCartReqChange = (i: number) => {
    setCartReqIndex(i);
    setCartReqError('');
    setClaimRows([{...initialClaimRow}]);
  };

  const addClaimRow = () => {
    if (claimRows.length >= cartList.length) return; // capped at total serials
    setClaimRows(prev => [...prev, {...initialClaimRow}]);
  };

  const removeClaimRow = (index: number) => {
    setClaimRows(prev => prev.filter((_, i) => i !== index));
  };

  const updateClaimRow = (
    index: number,
    field: 'serialIndex' | 'claimTypeIndex',
    value: number,
  ) => {
    setClaimRows(prev =>
      prev.map((row, i) =>
        i !== index
          ? row
          : {
              ...row,
              [field]: value,
              errors: {...row.errors, [field]: ''},
            },
      ),
    );
  };

  // used serial indexes so the same cart can't be picked twice across rows
  const usedSerialIndexes = (excludeRowIndex: number) =>
    claimRows
      .filter((_, i) => i !== excludeRowIndex)
      .map(r => r.serialIndex)
      .filter((v): v is number => v !== null);

  const handleSubmitResponse = (resp: any) => {
    if (resp?.status) {
      setIsLoading(false);
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message:
            resp?.message ??
            (isCartDamage
              ? 'Damage Claim Submitted Successfully.'
              : 'Cart Return Request Submitted Successfully.'),
        }),
      );
      props?.navigation?.goBack();
    } else {
      setIsLoading(false);
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: getErrorMessage(resp),
        }),
      );
    }
  };

  const onSubmit = () => {
    let isFormValid = true;

    if (cartReqIndex === null) {
      setCartReqError('Please select a cart request');
      isFormValid = false;
    }

    const updatedRows = claimRows.map(row => {
      const errors = {serialIndex: '', claimTypeIndex: ''};
      if (row.serialIndex === null) {
        errors.serialIndex = 'Please select a serial number';
        isFormValid = false;
      }
      if (isCartDamage && row.claimTypeIndex === null) {
        errors.claimTypeIndex = 'Please select a claim type';
        isFormValid = false;
      }
      return {...row, errors};
    });
    setClaimRows(updatedRows);

    if (!reason?.trim()) {
      setReasonError('Please describe the issue');
      isFormValid = false;
    }
    if (!isFormValid) return;

    setIsLoading(true);

    if (isCartDamage) {
      const items = claimRows.map(row => ({
        serialNumber: cartList?.[row.serialIndex as number]?.serialNumber,
        claimType: CLAIM_TYPE_LIST?.[row.claimTypeIndex as number]?.value,
      }));

      const formData = new FormData();
      formData.append('cartRequest', selectedCartReq?.id);
      formData.append('items', JSON.stringify(items));
      formData.append('reason', reason);
      formData.append('source', 'mobile');
      formData.append('platform', Platform.OS);

      files.forEach((item, index) => {
        formData.append(`files[${index}]`, {
          uri: item.uri,
          type: item.type || 'image/jpeg',
          name: item.name || `photo_${Date.now()}_${index}.jpg`,
        } as any);
      });
      console.log('file state at submit:', JSON.stringify(files));
      apiHandler({
        endpoint: getEndpoints(),
        method: 'POST',
        isFormData: true,
        payload: formData,
        authContext: 'RESIDENT',
        onComplete: handleSubmitResponse,
      });
    } else {
      const serialNumbers = claimRows.map(
        row => cartList?.[row.serialIndex as number]?.serialNumber,
      );

      const payload = {
        cartRequest: selectedCartReq?.id,
        serialNumbers,
        reason,
        source: 'mobile',
        platform: Platform.OS,
      };

      apiHandler({
        endpoint: getEndpoints(),
        method: 'POST',
        isFormData: false,
        payload,
        authContext: 'RESIDENT',
        onComplete: handleSubmitResponse,
      });
    }
  };
  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS == 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Submit Damage Claim'}
      />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingBottom: normalized(20),
        }}>
        <View style={{height: normalized(15)}} />

        <Text style={styles.Input_Heading}>Cart Request*</Text>
        <CustomDropDownList
          list={cartReqList?.map((r: any) => ({name: r?.requestId}))}
          selectedIndex={cartReqIndex as number}
          onChange={(i: number) => onCartReqChange(i)}
          placeholder={
            cartReqLoading
              ? 'Loading...'
              : cartReqList.length === 0
              ? 'No Delivered Carts Found'
              : 'Select Cart Request'
          }
          isOpen={isCartReqOpen}
          setIsOpen={setIsCartReqOpen}
          error={!!cartReqError}
        />

        <View style={{height: normalized(10)}} />

        {/* ---- Serial Number rows heading + add button ---- */}

        {claimRows.map((row, index) => {
          const filteredSerials = cartList
            ?.map((c: any, i: number) => ({
              name: `${c?.serialNumber} (${c?.size})`,
              i,
            }))
            .filter((c: any) => !usedSerialIndexes(index).includes(c.i));

          const selectedSerialPosition =
            row.serialIndex !== null
              ? filteredSerials.findIndex((c: any) => c.i === row.serialIndex)
              : (null as any);

          return (
            <View key={index}>
              <View
                style={[
                  styles.rowCont,
                  {marginTop: index > 0 ? normalized(12) : normalized(6)},
                ]}>
                <Text>{`Serial Number ${index + 1}`}</Text>
                {claimRows.length < cartList.length && (
                  <TouchableOpacity activeOpacity={1} onPress={addClaimRow}>
                    <PlusIcon />
                  </TouchableOpacity>
                )}
                {index > 0 && (
                  <TouchableOpacity onPress={() => removeClaimRow(index)}>
                    <MinusIcon />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.Input_Heading}>Serial Number*</Text>
              <CustomDropDownList
                list={filteredSerials}
                selectedIndex={selectedSerialPosition}
                onChange={(pos: number) => {
                  const actualIndex = filteredSerials?.[pos]?.i;
                  updateClaimRow(index, 'serialIndex', actualIndex);
                }}
                placeholder={
                  cartReqIndex === null
                    ? 'Select Serial Number'
                    : cartList.length === 0
                    ? 'No delivered carts found'
                    : 'Select Serial Number'
                }
                error={!!row.errors.serialIndex}
              />

              <View style={{height: normalized(10)}} />
              {isCartDamage && (
                <>
                  <Text style={styles.Input_Heading}>Claim Type*</Text>
                  <CustomDropDownList
                    list={CLAIM_TYPE_LIST}
                    selectedIndex={row.claimTypeIndex as number}
                    onChange={(i: number) =>
                      updateClaimRow(index, 'claimTypeIndex', i)
                    }
                    placeholder="Select Claim Type"
                    error={!!row.errors.claimTypeIndex}
                  />

                  <View style={{height: normalized(10)}} />
                </>
              )}
            </View>
          );
        })}

        <Text style={styles.Input_Heading}>Reason*</Text>
        <CustomInput
          placeholder="Describe the issue"
          value={reason}
          setValue={(v: string) => {
            setReason(v);
            setReasonError('');
          }}
          errorMsg={reasonError}
          isMultiLine
          isScrollable
        />

        <View style={{height: normalized(10)}} />
        {isCartDamage && (
          <>
            <Text style={styles.Input_Heading}>Photo</Text>
            <CustomDocumentPicker
              uploading={uploading}
              progress={progress}
              maxSize={20 * 1024 * 1024}
              text1={'Choose Image to Upload'}
              type={'image'}
              limit={5}
              onSelect={(obj: any) => {
                if (!Array.isArray(obj) || obj.length === 0) {
                  setFiles([]);
                  return;
                }

                setFiles(
                  obj
                    .filter((data: any) => data?.uri)
                    .map((data: any, index: number) => ({
                      uri: data.uri,
                      type: data.type || 'image/jpeg',
                      name:
                        data.name ||
                        data.filename ||
                        `photo_${Date.now()}_${index}.jpg`,
                    })),
                );
              }}
            />
          </>
        )}
        <View style={styles.submitBtnCont}>
          <CustomButton
            text={'Submit Request'}
            onPress={onSubmit}
            loading={isLoading}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default CartRentalReportSubmission;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    submitBtnCont: {
      marginTop: normalized(20),
    },

    rowCont: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
