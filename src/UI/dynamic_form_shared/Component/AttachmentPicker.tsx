import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {
  AppColors,
  AppFonts,
  hv,
  isSmallDevice,
  normalized,
  ScreenSize,
} from '../../../Utils/AppConstants';
import {AppStyles} from '../../../Utils/AppStyles';
import {pickDocuments} from '../../../Handler/Documentandler';
import {formatFileSize} from '../../../Utils/Helper';
import DocumentIcon from '../../Svg/DocumentIcon';
import GalleryIcon from '../../Svg/GalleryIcon';
import PdfIcon from '../../Svg/PdfIcon';
import ExcelIcon from '../../Svg/ExcelIcon';
import WordIcon from '../../Svg/WordIcon';
import EditIcon from '../../Svg/EditIcon';
import CloseCircularIcon from '../../Svg/CloseCircularIcon';
import AppImageViewer from '../../Components/AppImageView';

export type NormalizedFile = {
  filename: string;
  name?: string;
  type: string;
  uri: string;
  size: number;
};

type Props = {
  text1?: string;
  text2?: string;
  isError?: boolean;
  limit?: number;
  maxSize?: number;
  defaultValue?: NormalizedFile[];
  onSelect: (files: NormalizedFile[]) => void;
};

const AppAttachmentPicker: React.FC<Props> = ({
  text1,
  text2,
  isError = false,
  limit = 1,
  maxSize,
  defaultValue,
  onSelect = () => {},
}) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );

  const [file, setFile] = useState<NormalizedFile[]>(defaultValue ?? []);
  const [showChooser, setShowChooser] = useState(false);
  const [editIndex, setEditIndex] = useState<number | undefined>(undefined);
  const pickerBusyRef = useRef(false);

  const isSelected = file.length > 0;

  useEffect(() => {
    onSelect(file);
  }, [file]);

  const checkOversized = (files: NormalizedFile[]) => {
    const maxFileSize = maxSize || 20 * 1024 * 1024;
    const oversized = files.find(f => f.size > maxFileSize);
    if (oversized) {
      Alert.alert(
        'File Too Large',
        'One or more files exceed the allowed size limit.',
        [{text: 'OK', style: 'cancel'}],
      );
      return true;
    }
    return false;
  };

  const applySelection = (files: NormalizedFile[], index?: number) => {
    if (!files.length || checkOversized(files)) return;
    if (index !== undefined) {
      setFile(prev => prev.map((item, i) => (i === index ? files[0] : item)));
    } else {
      setFile(prev => {
        if (limit === 1) return files.slice(0, 1);
        return [...prev, ...files].slice(0, limit);
      });
    }
  };

  const runAfterChooserClose = (action: () => void) => {
    setShowChooser(false);
    setTimeout(action, Platform.OS === 'ios' ? 450 : 250);
  };

  const normalizeAsset = (asset: any, index: number): NormalizedFile | null => {
    const uri = asset?.uri;
    if (!uri) return null;

    const cleanPath = String(uri).split('?')[0];
    const filename =
      asset?.fileName ??
      asset?.filename ??
      cleanPath?.split('/').pop() ??
      `image_${Date.now()}_${index}.jpg`;

    return {
      filename,
      name: filename,
      type: asset?.type || 'image/jpeg',
      uri:
        Platform.OS === 'ios' && uri.startsWith('file://')
          ? uri.replace('file://', '')
          : uri,
      size: asset?.fileSize ?? asset?.size ?? 0,
    };
  };

  const handleImage = () => {
    if (pickerBusyRef.current) return;

    const activeEditIndex = editIndex;
    const selectionLimit = activeEditIndex !== undefined ? 1 : limit || 1;

    runAfterChooserClose(() => {
      pickerBusyRef.current = true;
      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit,
          quality: 1,
        },
        response => {
          pickerBusyRef.current = false;

          if (response.didCancel) {
            setEditIndex(undefined);
            return;
          }

          if (response.errorCode) {
            setEditIndex(undefined);
            Alert.alert(
              'Could not open gallery',
              response.errorMessage ?? 'Please try again.',
            );
            return;
          }

          const files = (response.assets ?? [])
            .map(normalizeAsset)
            .filter(Boolean) as NormalizedFile[];

          applySelection(files, activeEditIndex);
          setEditIndex(undefined);
        },
      );
    });
  };

  const handleDocument = () => {
    if (pickerBusyRef.current) return;

    const activeEditIndex = editIndex;
    const mode =
      activeEditIndex !== undefined || limit === 1 ? 'single' : 'multiple';

    runAfterChooserClose(() => {
      pickerBusyRef.current = true;
      Promise.resolve(
        (pickDocuments as any)(mode, (docs: any) => {
          pickerBusyRef.current = false;

          if (!docs?.length) {
            setEditIndex(undefined);
            return;
          }

          const files: NormalizedFile[] = docs.map((doc: any) => ({
            filename: doc.filename ?? doc.name ?? 'attachment',
            name: doc.filename ?? doc.name ?? 'attachment',
            type: doc.type || 'application/octet-stream',
            uri: doc.fileCopyUri || doc.uri,
            size: doc.size ?? 0,
          }));

          applySelection(files, activeEditIndex);
          setEditIndex(undefined);
        }),
      )
        .catch(() => {
          setEditIndex(undefined);
        })
        .finally(() => {
          pickerBusyRef.current = false;
        });
    });
  };

  const openChooser = (index?: number) => {
    setEditIndex(index);
    setShowChooser(true);
  };

  const closeChooser = () => {
    setShowChooser(false);
    setEditIndex(undefined);
  };

  const handleRemove = (index: number) => {
    setFile(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <View
      style={[
        styles.cont,
        {
          backgroundColor: isError ? colors.redLight : colors.Background,
          borderColor: isError ? colors.ToastColors.Error : colors.Grey_2,
        },
      ]}>
      {!isSelected ? (
        <TouchableOpacity onPress={() => openChooser()} activeOpacity={0.85}>
          <View style={styles.placeholder}>
            <DocumentIcon
              width={normalized(48)}
              height={normalized(48)}
              primary={colors.Primary}
            />
            <Text
              style={[
                styles.txt,
                {
                  color: isError
                    ? colors.ToastColors.Error
                    : colors.Heading_Txt,
                },
              ]}>
              {text1 ?? 'Choose Files to Upload'}
            </Text>
            <Text
              style={[
                styles.txt2,
                {
                  color: text2
                    ? isError
                      ? colors.ToastColors.Error
                      : colors.Desc_Txt
                    : colors.ToastColors.Alarm,
                },
              ]}>
              {text2 ?? 'No file chosen'}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.fileList}>
          {file.map((item, index) => {
            const name = item.filename ?? 'Unnamed';
            const parts = name.split('.');
            const base = parts.length > 1 ? parts.slice(0, -1).join('.') : name;
            const ext = parts.length > 1 ? parts[parts.length - 1] : '';
            const totalText = formatFileSize(item.size || 0);

            return (
              <View
                key={index}
                style={[
                  styles.fileRow,
                  index < file.length - 1 && {marginBottom: normalized(15)},
                ]}>
                <View style={styles.fileLeft}>
                  {item.type?.startsWith('image') ? (
                    <View style={styles.imgCont}>
                      <AppImageViewer
                        source={{uri: item.uri}}
                        style={styles.img}
                      />
                    </View>
                  ) : ext === 'pdf' ? (
                    <PdfIcon />
                  ) : ext === 'xls' || ext === 'xlsx' ? (
                    <ExcelIcon />
                  ) : ext === 'doc' || ext === 'docx' ? (
                    <WordIcon />
                  ) : (
                    <DocumentIcon
                      width={30}
                      height={30}
                      primary={colors.Primary}
                    />
                  )}
                  <View style={{gap: normalized(4), flex: 1}}>
                    <Text style={styles.txt} numberOfLines={1}>
                      {base}
                    </Text>
                    <Text style={styles.txt3} numberOfLines={1}>
                      {ext ? totalText : `${base} • ${totalText}`}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => openChooser(index)}>
                      <EditIcon />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleRemove(index)}>
                      <CloseCircularIcon />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
          {file.length < limit ? (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addMoreBtn}
              onPress={() => openChooser()}>
              <DocumentIcon
                width={normalized(22)}
                height={normalized(22)}
                primary={colors.Primary}
              />
              <Text style={styles.addMoreTxt}>Add Attachment</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {/* Image vs Document chooser */}
      {showChooser ? (
        <Modal transparent animationType="slide" onRequestClose={closeChooser}>
          <View style={styles.outerContainer}>
            <StatusBar
              barStyle={
                selector?.isDarkTheme ? 'light-content' : 'dark-content'
              }
            />
            <TouchableWithoutFeedback onPress={closeChooser}>
              <View style={styles.transparentBg} />
            </TouchableWithoutFeedback>
            <View style={styles.mainContainer}>
              <View style={styles.headerRow}>
                <Text style={styles.headingText}>Add Attachment</Text>
              </View>
              <View style={styles.pickersContainer}>
                <TouchableOpacity
                  onPress={handleImage}
                  activeOpacity={0.8}
                  style={styles.singlePicker}>
                  <GalleryIcon
                    width={30}
                    height={30}
                    primary={colors.Primary}
                  />
                  <Text style={styles.pickerText}>Image</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDocument}
                  activeOpacity={0.8}
                  style={styles.singlePicker}>
                  <DocumentIcon
                    width={30}
                    height={30}
                    primary={colors.Primary}
                  />
                  <Text style={styles.pickerText}>Document</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

export default AppAttachmentPicker;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      width: '100%',
      borderRadius: normalized(8),
      borderWidth: 1,
      justifyContent: 'center',
      paddingHorizontal: normalized(16),
      paddingVertical: normalized(14),
    },
    placeholder: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    fileList: {
      width: '100%',
    },
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    fileLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(15),
    },
    addMoreBtn: {
      minHeight: normalized(46),
      borderRadius: normalized(8),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderStyle: 'dashed',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: normalized(8),
      marginTop: normalized(12),
    },
    addMoreTxt: {
      color: colors.Primary,
      fontSize: normalized(13),
      fontFamily: AppFonts.InterRegular,
    },
    txt: {
      fontSize: normalized(15),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.InterRegular,
      marginTop: normalized(3),
    },
    txt2: {
      color: AppColors.ToastColors.Alarm,
      fontSize: normalized(11),
      fontFamily: AppFonts.InterRegular,
      marginTop: normalized(6),
    },
    txt3: {
      color: colors.Desc_Txt,
      fontSize: normalized(12),
      fontFamily: AppFonts.InterRegular,
      flexShrink: 1,
    },
    img: {
      width: normalized(55),
      height: normalized(55),
      borderRadius: normalized(8),
    },
    imgCont: {},

    /* chooser modal */
    outerContainer: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    transparentBg: {
      backgroundColor: 'rgba(0,0,0,0.4)',
      ...StyleSheet.absoluteFill,
    },
    mainContainer: {
      height: isSmallDevice ? '35%' : '30%',
      backgroundColor: colors.Background,
      width: '100%',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingVertical: hv(5),
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: normalized(40),
    },
    headingText: {
      fontSize: normalized(16),
      color: colors.Heading_Txt,
    },
    pickersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
      height: ScreenSize.height < 680 ? hv(200) : hv(170),
      marginTop: isSmallDevice ? hv(50) : hv(30),
      alignSelf: 'center',
    },
    singlePicker: {
      borderRadius: 15,
      width: '45%',
      height: '65%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: normalized(20),
      borderWidth: 3,
      borderColor: AppColors.Grey_2,
      borderStyle: 'dashed',
    },
    pickerText: {
      color: colors.Heading_Txt,
      fontSize: normalized(12),
      marginTop: hv(10),
      textAlign: 'center',
    },
  });
