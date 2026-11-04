import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import React, {useEffect, useMemo, useState} from 'react';
import {normalized, ScreenSize} from '../../Utils/AppConstants';
import Modal from 'react-native-modal';
import {useDispatch, useSelector} from 'react-redux';
import {AppStyles} from '../../Utils/AppStyles';
import {AppRootStore} from '../../Redux/AppStore';
import Pdf from 'react-native-pdf';
import WebView from 'react-native-webview';
import ReactNativeBlobUtil from 'react-native-blob-util';
import CloseIcon from '../Svg/CloseIcon';
import DownloadIcon from '../Svg/DownloadIcon';
import {
  handleFileDownload,
  handleLocalFileDownload,
} from '../../Utils/DownloadHelper';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';

const PdfModal = ({
  isVisible,
  url,
  localPath,
  onClose,
  isCartRental = false,
  isBilling = false,
}: any) => {
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [localFile, setLocalFile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileName =
    isCartRental || isBilling ? 'invoice.pdf' : 'payment_receipt.pdf';
  const dispatch = useDispatch();
  const onDownloadPdf = async () => {
    if (!localFile && !url) {
      return;
    }

    const useLocal = Boolean(localFile);

    setIsDownloading(true);
    // try {
    //   await handleFileDownload(
    //     {
    //       url: localFile ?? url,
    //       name: fileName,
    //       isCompleteUrl: !useLocal,
    //       isLocalFile: useLocal,
    //     },
    //     null,
    //     () => {},
    //   );
    // }
    try {
      if (useLocal) {
        // File is already on disk locally — just copy it, no network fetch
        await handleLocalFileDownload(
          {
            url: localFile,
            name: fileName,
          },
          dispatch,
        );
      } else {
        // `url` here is a genuine remote signed URL (https://...)
        await handleFileDownload(
          {
            url: url,
            name: fileName,
            isCompleteUrl: true,
          },
          null,
          dispatch,
        );
      }
    } catch (err) {
      console.log('Download failed:', err);
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Download failed.',
        }),
      );
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    setIsLoading(true);
    setLocalFile(null);

    if (localPath) {
      setLocalFile(localPath);
      setIsLoading(false);
      return;
    }

    if (!url) {
      setIsLoading(false);
      return;
    }

    // Non-cart-rental modules pass an already-local file path via `url`
    if (!isCartRental) {
      setLocalFile(url);
      setIsLoading(false);
      return;
    }

    // Cart rental invoices pass a remote signed URL that needs downloading
    const path = ReactNativeBlobUtil.fs.dirs.DocumentDir + `/${fileName}`;

    ReactNativeBlobUtil.config({
      fileCache: true,
      path: path,
    })
      .fetch('GET', url)
      .then((res: any) => {
        setLocalFile(res.path());
        setIsLoading(false);
      })
      .catch(err => {
        console.log('PDF download failed:', err);
        setIsLoading(false);
      });
  }, [isVisible, localPath, url, isCartRental, fileName]);

  const pdfContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      );
    }

    if (!localFile) return null;
    // ios -> WebView
    if (Platform.OS === 'ios') {
      const fileUri = localFile.startsWith('file://')
        ? localFile
        : `file://${localFile}`;
      return (
        <WebView
          source={{uri: fileUri}}
          style={styles.pdfStyle}
          originWhitelist={['*']}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // Android → Keep original react-native-pdf
    return (
      <Pdf
        source={{uri: localFile, cache: false}}
        style={styles.pdfStyle}
        onError={err => console.log('PDF render error:', err)}
      />
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      animationIn={'zoomIn'}
      animationOut={'zoomOut'}
      animationInTiming={400}
      animationOutTiming={400}
      supportedOrientations={['portrait', 'landscape']}
      style={{
        height: ScreenSize.height,
        width: '90%',
      }}>
      <StatusBar barStyle={'light-content'} />
      {/* {Platform?.OS == 'ios' ? (
        <View
          style={{
            // alignItems: 'center',
            // justifyContent: 'center',
            height: '60%',
            width: ScreenSize.width,
            marginLeft: normalized(-20),
          }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeCont}>
            <CloseIcon primary={colors.Desc_Txt} width={40} height={40} />
          </TouchableOpacity>

          {pdfContent()}
        </View>
      ) : ( */}
      {/* </View> */}
      <View style={styles.box}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDownloadPdf}
            disabled={!localFile || isDownloading}
            style={styles.closeCont}>
            {isDownloading ? (
              <ActivityIndicator color={colors.Desc_Txt} size={'small'} />
            ) : (
              <DownloadIcon primary={'#333333'} width={26} height={26} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.closeCont}>
            <CloseIcon primary={'#333333'} width={40} height={40} />
          </TouchableOpacity>
        </View>

        {pdfContent()}
      </View>
      {/* // )} */}
    </Modal>
  );
};

export default PdfModal;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    box: {
      // width: '90%',
      borderRadius: normalized(12),
      backgroundColor: colors.Heading_Txt,
      height: '75%',
      overflow: 'hidden',
    },
    pdfStyle: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.White,
    },
    headerRow: {
      position: 'absolute',
      top: normalized(12),
      right: normalized(12),
      flexDirection: 'row',
      gap: normalized(8),
      zIndex: 100,
      elevation: 100,
    },
    closeCont: {
      width: normalized(40),
      height: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    loaderCont: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.White,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
