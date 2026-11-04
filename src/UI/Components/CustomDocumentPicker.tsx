import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  UIManager,
  LayoutAnimation,
  Animated,
  Easing,
  Alert,
  Linking,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {AppColors, AppFonts, normalized} from '../../Utils/AppConstants';
import DocumentIcon from '../Svg/DocumentIcon';
import {pickDocuments, PickedFile} from '../../Handler/Documentandler';
import WordIcon from '../Svg/WordIcon';
import {formatFileSize, makeId} from '../../Utils/Helper';
import EditIcon from '../Svg/EditIcon';
import CloseCircularIcon from '../Svg/CloseCircularIcon';
import TickIcon from '../Svg/TickIcon';
import I18n from 'i18n-js';
import en from '../../assets/translation/en.json';
import es from '../../assets/translation/es.json';
import ar from '../../assets/translation/ar.json';
import it from '../../assets/translation/it.json';
import pl from '../../assets/translation/pl.json';
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
} from 'react-native-permissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import AppImageViewer from './AppImageView';
import PdfIcon from '../Svg/PdfIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import AppImagePicker from './AppImagePicker';
import {validateSelectedFiles} from '../../Utils/CorruptionGuard';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  uploading?: boolean;
  progress?: number;
  language?: string;
  isError?: boolean;
  text1?: string;
  text2?: string;
  type: string;
  limit?: number;
  maxSize?: number;
  useImagePickerModal?: boolean;
  defaultValue?: any[];
  onSelect: (files: any[]) => void;
};
type PickedFileItem = {
  filename: string;
  type: string;
  uri: string;
  size: number;
};

const CustomDocumentPicker: React.FC<Props> = ({
  uploading = false,
  progress = 0,
  language = 'en',
  isError = false,
  text1,
  text2,
  type,
  limit = 1,
  maxSize,
  defaultValue,
  useImagePickerModal = false,
  onSelect = () => {},
}) => {
  const colors = useSelector((s: AppRootStore) => s.SliceReducer.themeColors);
  const [file, setFile] = useState(defaultValue ?? []);
  const [showImagePicker, setShowImagePicker] = useState(false);

  // animations
  const boxAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const editPulse = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  I18n.fallbacks = true;

  I18n.translations = {
    en: en,
    es: es,
    ar: ar,
    it: it,
    pl: pl,
  };

  I18n.locale = language;

  // if `file` is an array of selected items:
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    setIsSelected(Array.isArray(file) && file.length > 0);
    onSelect(file);
  }, [file]);
  const clamped = Math.min(Math.max(progress, 0), 1);
  const isComplete = isSelected && clamped >= 1;
  const maxFileSize = maxSize ?? 20 * 1024 * 1024;

  useEffect(() => {
    Animated.timing(boxAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isSelected]);

  useEffect(() => {
    Animated.timing(flipAnim, {
      toValue: uploading ? 1 : 0,
      duration: 520,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [uploading]);

  // Progress animation + completion behavior
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: clamped,
      duration: 150,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();

    if (isComplete) {
      // Flip back to front when completed
      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 520,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }).start();

      // Tick pop
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      successAnim.setValue(0);
    }
  }, [clamped, isComplete]);

  const animateLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handlePermissionCheck = async (
    permission: any,
    onSuccess: () => void,
  ) => {
    const status = await check(permission);
    if (status === 'granted') {
      onSuccess();
    } else if (status === 'blocked') {
      Alert.alert('', 'Press to Go in device settings to enable permissions.', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'SETTINGS',
          onPress: () =>
            openSettings().catch(() => console.warn('cannot open settings')),
        },
      ]);
    } else {
      const result = await request(permission);
      if (result === 'granted') {
        onSuccess();
      } else {
        Alert.alert(
          'Permission Required',
          'Permission is required to access the camera or gallery.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Go to Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
          {cancelable: false},
        );
      }
    }
  };

  const handleSelectPhotoFromGallery = async (onComplete: any) => {
    if (Platform.OS === 'android') {
      // const permission =
      //   Platform.Version >= 33
      //     ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      //     : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      // const status = await check(permission);

      // if (status !== 'granted') {
      //   const result = await request(permission);
      //   if (result !== 'granted') {
      //     Alert.alert(
      //       'Permission Required',
      //       'Permission is required to access the gallery.',
      //       [
      //         {text: 'Cancel', style: 'cancel'},
      //         {text: 'Go to Settings', onPress: () => Linking.openSettings()},
      //       ],
      //       {cancelable: false},
      //     );
      //     return;
      //   }
      // }

      launchImageLibrary(
        {
          mediaType: 'photo',
          selectionLimit: limit || 1,
          quality: 1,
        },
        (response: any) => {
          if (response.didCancel || response.errorCode) return;

          if (
            limit === 1 &&
            response.assets?.length > 0 &&
            response.assets[0].fileSize > maxFileSize
          ) {
            {
              Alert.alert(
                'File Too Large',
                'Image Size is larger than 20 MB. Please select an image under 20 MB.',
                [{text: 'OK', style: 'cancel'}],
              );
              return;
            }
          }

          if (response.assets?.length > 0) {
            const images = response.assets.map((image: any) => ({
              filename: image.fileName ?? image.originalPath,
              type: image.type,
              uri: image.uri,
              size: image.fileSize,
            }));
            onComplete(images);
          }
        },
      );
    } else {
      await handlePermissionCheck(PERMISSIONS.IOS.PHOTO_LIBRARY, () => {
        launchImageLibrary(
          {
            mediaType: 'photo',
            selectionLimit: limit || 1,
            quality: 1,
          },
          (response: any) => {
            if (response.didCancel) {
              console.log('User cancelled image picker');
            } else if (response.errorCode) {
              console.log('ImagePicker Error: ', response.errorMessage);
            } else {
              if (
                limit == 1 &&
                response.assets?.length > 0 &&
                response.assets[0].fileSize > maxFileSize
              ) {
                Alert.alert(
                  'File Too Large',
                  'Image size exceeds 20 MB. Please select an image under 20 MB.',
                  [{text: 'OK', style: 'cancel'}],
                );
                return;
              }
              const selectedImages = response.assets.map(
                (asset: any) => asset.uri,
              );
              if (selectedImages.length > 0) {
                const images = response?.assets?.map((image: any) => {
                  return {
                    filename: image.fileName,
                    type: image.type,
                    uri: image?.uri?.startsWith('file://')
                      ? image.uri.replace('file://', '')
                      : image?.uri,
                    size: image.fileSize,
                  };
                });
                onComplete(images);
              }
            }
          },
        );
      });
    }
  };

  const handlePick = async () => {
    animateLayout();
    if (type == 'image') {
      if (useImagePickerModal) {
        setShowImagePicker(true);
        return;
      }
      await handleSelectPhotoFromGallery(async (images: any) => {
        const validation = await validateSelectedFiles(images);

        if (!validation.isValid) {
          Alert.alert(
            'Invalid File',
            validation.message ?? 'The selected image is corrupted.',
            [{text: 'OK'}],
          );
          return;
        }

        setFile(images);
      });
    } else {
      await pickDocuments(limit == 1 ? 'single' : 'multiple', async doc => {
        if (doc.length > 0) {
          const Documents = doc?.map((doc: any) => {
            const uri = doc.fileCopyUri || doc.uri;

            return {
              filename: doc.filename ?? doc.name ?? 'attachment',
              name: doc.filename ?? doc.name ?? 'attachment',
              type: doc.type || 'application/octet-stream',
              uri,
              size: doc.size,
            };
          });
          const maxFileSize = maxSize || 20 * 1024 * 1024;

          const oversizedFile = Documents.find(
            (item: any) => item.size > maxFileSize,
          );

          if (oversizedFile) {
            Alert.alert(
              'File Too Large',
              'File size exceeds 20 MB. Please select a file under 20 MB.',
              [{text: 'OK', style: 'cancel'}],
            );
            return;
          }

          const validation = await validateSelectedFiles(Documents);

          if (!validation.isValid) {
            Alert.alert(
              'Invalid File',
              validation.message ?? 'The selected document is corrupted.',
              [{text: 'OK'}],
            );
            return;
          }

          setFile(Documents);
        }
      });
    }
  };

  const handleClear = (index?: number) => {
    animateLayout();
    if (index !== undefined) {
      setFile((prev: any) => prev.filter((_: any, i: number) => i !== index));
    } else {
      setFile([]);
    }
  };
  const handleEdit = async (index?: number) => {
    Animated.sequence([
      Animated.timing(editPulse, {
        toValue: 1,
        duration: 90,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(editPulse, {
        toValue: 0,
        duration: 120,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => handlePickForIndex(index));
  };
  const handlePickForIndex = async (index?: number) => {
    animateLayout();
    if (type === 'image') {
      await handleSelectPhotoFromGallery((images: any) => {
        if (index !== undefined) {
          setFile((prev: any) =>
            prev.map((item: any, i: number) =>
              i === index ? images[0] : item,
            ),
          );
        } else {
          setFile(images);
        }
      });
    } else {
      await pickDocuments(limit === 1 ? 'single' : 'multiple', doc => {
        if (doc.length > 0) {
          const Documents = doc.map((d: any) => ({
            filename: d.filename ?? d.name ?? 'attachment',
            name: d.filename ?? d.name ?? 'attachment',
            type: d.type || 'application/octet-stream',
            uri: d.fileCopyUri || d.uri,
            size: d.size,
          }));

          if (index !== undefined) {
            setFile((prev: any) =>
              prev.map((item: any, i: number) =>
                i === index ? Documents[0] : item,
              ),
            );
          } else {
            setFile(Documents);
          }
        }
      });
    }
  };
  // Interpolations
  const selectedFileCount = Array.isArray(file) ? file.length : 0;

  const selectedBoxHeight =
    selectedFileCount > 1
      ? normalized(80 + (selectedFileCount - 1) * 72)
      : normalized(80);

  const boxHeight = boxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      language == 'ar' ? normalized(136) : normalized(106),
      selectedBoxHeight,
    ],
  });
  const placeholderOpacity = boxAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const green = colors?.Primary;

  const editScale = editPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  // File meta
  // const name = file?.filename ?? 'Unnamed';
  // const parts = name.split('.');
  // const base = parts.length > 1 ? parts.slice(0, -1).join('.') : name;
  // const ext = parts.length > 1 ? parts[parts.length - 1] : '';
  // const totalBytes = file?.size || 0;
  // const totalText = formatFileSize(totalBytes);
  // const pct = Math.round(clamped * 100);
  // const uploadedBytes = Math.round(totalBytes * clamped);
  // const uploadedText = `${formatFileSize(uploadedBytes)} / ${totalText}`;

  // tick animation
  const tickOpacity = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const tickScale = successAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  /* ===== RENDER ===== */

  const FrontContent = () => (
    <View>
      {file?.map((item: any, index: any) => {
        const name = item?.filename ?? 'Unnamed';
        const parts = name.split('.');
        const base = parts.length > 1 ? parts.slice(0, -1).join('.') : name;
        const ext = parts.length > 1 ? parts[parts.length - 1] : '';
        const totalBytes = item?.size || 0;
        const totalText = formatFileSize(totalBytes);
        const pct = Math.round(clamped * 100);
        const uploadedBytes = Math.round(totalBytes * clamped);
        const uploadedText = `${formatFileSize(uploadedBytes)} / ${totalText}`;
        const type = item?.filename?.split('.').pop();

        return (
          <View
            style={[
              styles.fileRow,
              index < file.length - 1 && {marginBottom: normalized(15)},
            ]}
            key={index}>
            <View style={styles.fileLeft}>
              {item?.type?.startsWith('image') ? (
                <View style={styles.imgCont}>
                  <AppImageViewer
                    source={{uri: item?.uri}}
                    style={styles.img}
                  />
                </View>
              ) : type == 'pdf' ? (
                <PdfIcon />
              ) : type == 'xls' ? (
                <ExcelIcon />
              ) : type == 'doc' || type == 'docx' ? (
                <WordIcon />
              ) : (
                <DocumentIcon width={30} height={30} primary={colors.Primary} />
              )}
              <View style={{gap: normalized(4), flex: 1}}>
                <Text style={styles.txt} numberOfLines={1}>
                  {base}
                </Text>
                <Text style={styles.txt3} numberOfLines={1}>
                  {ext ? `${totalText}` : `${base} • ${totalText}`}
                </Text>
              </View>

              {/* Right: actions when NOT uploading and NOT complete; else a tick after complete */}
              {!uploading && !isComplete ? (
                <View style={styles.actions}>
                  <Animated.View style={{transform: [{scale: editScale}]}}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => handleEdit(index)}>
                      <EditIcon />
                    </TouchableOpacity>
                  </Animated.View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleClear(index)}>
                    <CloseCircularIcon />
                  </TouchableOpacity>
                </View>
              ) : isComplete ? (
                <Animated.View
                  style={[
                    styles.tickWrap,
                    {opacity: tickOpacity, transform: [{scale: tickScale}]},
                  ]}>
                  <TickIcon primary={colors.Primary} width={24} height={26} />
                </Animated.View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
    // <View style={styles.fileRow}>
    //   <View style={styles.fileLeft}>
    //     <WordIcon />
    //     <View style={{ gap: normalized(4) }}>
    //       <Text style={styles.txt}>{base}</Text>
    //       <Text style={styles.txt3}>
    //         {ext ? `${base}.${ext} • ${totalText}` : `${base} • ${totalText}`}
    //       </Text>
    //     </View>
    //   </View>

    //   {/* Right: actions when NOT uploading and NOT complete; else a tick after complete */}
    //   {!uploading && !isComplete ? (
    //     <View style={styles.actions}>
    //       <Animated.View style={{ transform: [{ scale: editScale }] }}>
    //         <TouchableOpacity activeOpacity={0.8} onPress={handleEdit}>
    //           <EditIcon />
    //         </TouchableOpacity>
    //       </Animated.View>
    //       <TouchableOpacity activeOpacity={0.8} onPress={handleClear}>
    //         <CloseCircularIcon />
    //       </TouchableOpacity>
    //     </View>
    //   ) : isComplete ? (
    //     <Animated.View
    //       style={[
    //         styles.tickWrap,
    //         { opacity: tickOpacity, transform: [{ scale: tickScale }] },
    //       ]}>
    //       <TickIcon primary={colors.Primary} width={24} height={26} />
    //     </Animated.View>
    //   ) : null}
    // </View>
  );

  const BackContent = () => {
    const item = file?.[0];
    const name = item?.filename ?? 'Unnamed';
    const parts = name.split('.');
    const base = parts.length > 1 ? parts.slice(0, -1).join('.') : name;
    const ext = parts.length > 1 ? parts[parts.length - 1] : '';

    const totalBytes = item?.size || 0;
    const totalText = formatFileSize(totalBytes);
    const pct = Math.round(clamped * 100);
    const uploadedBytes = Math.round(totalBytes * clamped);
    const uploadedText = `${formatFileSize(uploadedBytes)} / ${totalText}`;

    return (
      <View style={styles.uploadFaceInner}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {width: widthInterpolate, backgroundColor: green},
            ]}
          />
        </View>

        <View style={styles.uploadRow}>
          <View style={styles.fileLeft}>
            <WordIcon />

            <View style={{gap: normalized(4), flexShrink: 1}}>
              <Text style={styles.txt}>{base}</Text>

              <Text style={styles.txt3}>
                {ext ? `${base}.${ext}` : base} • {uploadedText}
              </Text>
            </View>
          </View>

          <Text style={styles.pct}>{pct}%</Text>
        </View>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.cont,
        {
          height: boxHeight,
          backgroundColor: isError ? colors.redLight : colors.Background,
          borderColor: isError ? colors.ToastColors.Error : colors.Grey_2,
        },
      ]}>
      {/* Layered host INSIDE the box (keeps content on-position, not below) */}
      <View
        style={[
          styles.layerHost,
          {
            height: language == 'ar' ? normalized(100) : normalized(56),
          },
        ]}>
        {/* Empty state */}
        {!isSelected && (
          <Animated.View
            style={[styles.placeholder, {opacity: placeholderOpacity}]}>
            <TouchableOpacity onPress={handlePick} activeOpacity={0.85}>
              <View style={{alignItems: 'center'}}>
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
                  {text1 ? text1 : I18n.t('CHOOSE_FILES_TO_UPLOAD')}
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
                  {text2 ? text2 : I18n.t('NO_FILE_CHOSEN')}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* FRONT (file view / final view) — only when not uploading */}
        {isSelected && !uploading && (
          <Animated.View
            style={[
              styles.face,
              {transform: [{perspective: 1000}, {rotateY: frontRotateY}]},
            ]}>
            <FrontContent />
          </Animated.View>
        )}

        {/* BACK (uploading) — only while uploading */}
        {isSelected && uploading && (
          <Animated.View
            style={[
              styles.face,
              styles.backFace,
              {transform: [{perspective: 1000}, {rotateY: backRotateY}]},
            ]}>
            <BackContent />
          </Animated.View>
        )}
      </View>

      {showImagePicker ? (
        <AppImagePicker
          limit={1}
          onClose={() => {
            setShowImagePicker(false);
          }}
          onImageSelect={(userSelectedImage: any) => {
            setShowImagePicker(false);
            if (!userSelectedImage) {
              return;
            }

            const selectedPath = Array.isArray(userSelectedImage)
              ? userSelectedImage[0]
              : userSelectedImage;
            if (!selectedPath || typeof selectedPath !== 'string') {
              return;
            }

            const cleanPath = selectedPath.split('?')[0];
            const filename =
              cleanPath?.split('/').pop() ?? `image_${makeId(6)}.jpg`;
            const ext = filename.includes('.')
              ? filename.split('.').pop()?.toLowerCase()
              : 'jpg';
            const mimeType =
              ext === 'png'
                ? 'image/png'
                : ext === 'heic'
                ? 'image/heic'
                : ext === 'webp'
                ? 'image/webp'
                : 'image/jpeg';

            setFile([
              {
                filename,
                type: mimeType,
                uri:
                  Platform.OS === 'ios' && selectedPath.startsWith('file://')
                    ? selectedPath.replace('file://', '')
                    : selectedPath,
                size: 0,
              },
            ] as any);
          }}
        />
      ) : null}
    </Animated.View>
  );
};

export default CustomDocumentPicker;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    cont: {
      width: '100%',
      borderRadius: normalized(8),
      borderWidth: 1,
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'relative',
    },

    /* host inside the box; padding belongs here so faces can be absolute */
    layerHost: {
      position: 'relative',
      width: '100%',
      height: normalized(56),
      justifyContent: 'center',
      paddingHorizontal: normalized(16),
    },

    placeholder: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    face: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      backfaceVisibility: 'hidden',
      paddingHorizontal: normalized(16),
    },
    backFace: {transform: [{rotateY: '180deg'}]},

    /* rows */
    fileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    uploadRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    fileLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
      flexShrink: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(15),
    },
    tickWrap: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    /* uploading track (inside back face) */
    uploadFaceInner: {
      width: '100%',
      justifyContent: 'center',
      gap: normalized(10),
    },
    progressTrack: {
      width: '100%',
      height: normalized(6),
      backgroundColor: colors.Grey_2,
      borderRadius: normalized(999),
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: normalized(999),
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
    pct: {
      marginLeft: normalized(10),
      color: colors.Heading,
      fontSize: normalized(13),
      fontFamily: AppFonts.InterMedium ?? AppFonts.InterRegular,
    },
    img: {
      width: normalized(55),
      height: normalized(55),
      borderRadius: normalized(8),
    },
    imgCont: {
      // width: normalized(25),
      // height: normalized(25),
    },
  });
