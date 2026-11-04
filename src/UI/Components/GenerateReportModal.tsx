import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import Modal from 'react-native-modal';
import {AppFonts, normalized, ScreenSize} from '../../Utils/AppConstants';
import CloseIcon from '../Svg/CloseIcon';
import moment from 'moment';
import CustomButton from './CustomButton';
import {formatAmountToUSD, getErrorMessage} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {Base_Url} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import ReactNativeBlobUtil from 'react-native-blob-util';
import PdfModal from './PdfModal';

const GenerateReportModal = ({isVisible, onClose, item}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState({
    isVisible: false,
    localPath: '',
  });

  const onGenerateReportLog = () => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.fioaGeneratePaymentLog,
      method: 'POST',
      authContext: 'RESIDENT',
      token: selector?.residentUserData?.token,
      payload: {requestId: item?.requestId},
      onComplete: (resp: any) => {
        console.log('log resp 0----  ', resp);

        if (resp?.status) {
          console.log('oin generate logs --->>>  ', resp?.data);
          setIsLoading(false);
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

  const GeneratePaymentReciept = () => {
    console.log('Generate Recipet ', item?.id);
    const url = `${Base_Url}${
      ENDPOINTS.fioaGenerateReciept
    }?${new URLSearchParams({
      id: item?.id,
      export: 'pdf',
    }).toString()}`;
    const path = `${
      ReactNativeBlobUtil.fs.dirs.DocumentDir
    }/foia_payment_receipt_${item?.id ?? Date.now()}.pdf`;

    ReactNativeBlobUtil.config({
      fileCache: true,
      path,
    })
      .fetch('GET', url, {
        Authorization: `Bearer ${selector?.residentUserData?.token}`,
      })
      .then((resp: any) => {
        setIsLoading(false);
        setShowPdfModal({
          isVisible: true,
          localPath: resp.path(),
        });
      })
      .catch((err: any) => {
        console.log('Generate Receipt PDF failed:', err);
        setIsLoading(false);
        dispatch(
          setShowToast({
            type: AppStrings.ToastType.error,
            message: 'Failed to generate receipt.',
          }),
        );
      });
  };

  const GenerateReport = async () => {
    await onGenerateReportLog();
    GeneratePaymentReciept();
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'zoomIn'}
      animationOut={'zoomOut'}
      animationInTiming={400}
      animationOutTiming={400}
      style={{
        height: ScreenSize.height,
        width: ScreenSize.width,
      }}>
      <StatusBar barStyle={'light-content'} />
      <View style={styles.box}>
        <View style={styles.headingCont}>
          <Text style={styles.Modal_Heading_Txt}>{'Bill Receipt'}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeCont}>
            <CloseIcon
              primary={selector?.isDarkTheme ? colors.White : colors.Black}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <Text style={styles.lightTxt}>{`Date : ${moment().format('LL')}`}</Text>
        <Text style={styles.lightTxt}>{`Receipt # ${item?.receiptId}`}</Text>

        <View style={styles.dividerCont}>
          <View style={styles.divider} />
        </View>

        <View style={{marginHorizontal: normalized(20)}}>
          <Text style={styles.Modal_Heading_Txt}>User Details</Text>
          <View style={styles.detailItem}>
            <Text style={styles.txt}>Name:</Text>
            <Text style={styles.valueTxt}>{item?.name}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.txt}>Address:</Text>
            <Text style={styles.valueTxt}>{item?.address}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.txt}>Phone Number:</Text>
            <Text style={styles.valueTxt}>{item?.phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.dividerCont}>
          <View style={styles.divider} />
        </View>

        <View style={{marginHorizontal: normalized(20)}}>
          <Text style={styles.Modal_Heading_Txt}>Payment Information</Text>
          <View style={styles.detailItem}>
            <Text style={styles.txt}>Release ID:</Text>
            <Text style={styles.valueTxt}>{item?.releaseId}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.txt}>Payment Method:</Text>
            <Text style={styles.valueTxt}>{item?.payment?.paymentMethod}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.txt}>Paid Amount:</Text>
            <Text style={styles.valueTxt}>
              {formatAmountToUSD(item?.payment?.amount)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.txt}>Paid At:</Text>
            <Text style={styles.valueTxt}>
              {moment(item?.payment?.paidAt)?.format('LL')}
            </Text>
          </View>
        </View>

        <View style={styles.dividerCont}>
          <View style={styles.divider} />
        </View>

        <Text
          style={[
            styles.valueTxt,
            {textAlign: 'center', marginHorizontal: normalized(30)},
          ]}>
          This is an official receipt for your payment towards FOIA Service.
        </Text>
        <Text
          style={[
            styles.valueTxt,
            {textAlign: 'center', marginHorizontal: normalized(30)},
          ]}>
          Thank you for your payment.
        </Text>

        <View style={styles.btnCont}>
          <CustomButton
            loading={isLoading}
            text={'Generate Receipt'}
            onPress={GenerateReport}
          />
        </View>
      </View>
      <PdfModal
        isVisible={showPdfModal?.isVisible}
        localPath={showPdfModal?.localPath}
        onClose={() => setShowPdfModal({isVisible: false, localPath: ''})}
      />
    </Modal>
  );
};

export default GenerateReportModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    box: {
      width: '90%',
      paddingVertical: normalized(20),
      borderRadius: normalized(12),
      backgroundColor: colors.Background,
    },
    headingCont: {
      alignItems: 'center',
      marginHorizontal: normalized(20),
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    closeCont: {
      width: normalized(30),
      height: normalized(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    divider: {
      backgroundColor: colors.Grey_2,
      width: '100%',
      height: normalized(1),
      marginTop: normalized(12),
      alignSelf: 'center',
    },
    lightTxt: {
      fontSize: normalized(14),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
      marginTop: normalized(10),
      alignSelf: 'center',
    },
    dividerCont: {
      marginHorizontal: normalized(60),
      marginTop: normalized(8),
      marginBottom: normalized(16),
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      marginTop: normalized(6),
      width: '78%',
    },
    txt: {
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
    },
    btnCont: {
      width: normalized(160),
      alignSelf: 'flex-end',
      marginRight: normalized(20),
    },
  });
