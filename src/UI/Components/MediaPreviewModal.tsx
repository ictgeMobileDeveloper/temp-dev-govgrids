import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import RNBlobUtil from 'react-native-blob-util';
import Video from 'react-native-video';
import Pdf from 'react-native-pdf';
import RenderHTML from 'react-native-render-html';
import EMLViewer from './EMLViewer';
import AppImageViewer from './AppImageView';
import CloseIcon from '../Svg/CloseIcon';
import DownloadIcon from '../Svg/DownloadIcon';
import PdfIcon from '../Svg/PdfIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import WordIcon from '../Svg/WordIcon';
import DocumentIcon from '../Svg/DocumentIcon';
import ImageIcon from '../Svg/ImageIcon';
import AudioIcon from '../Svg/AudioIcon';
import PlayIcon from '../Svg/VideoSVG';
import ExternalLinkVector from '../Svg/ExternalLinkVector';
import DocxViewer from './DocumentViewer';
import ExcelViewer from './ExcelViewer';
import {openFileExternally} from '../../Utils/ExternalFileViewer';
import {handleFileDownload} from '../../Utils/DownloadHelper';
import {AppFonts, ScreenSize, normalized} from '../../Utils/AppConstants';

import {AppRootStore} from '../../Redux/AppStore';
import {
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../ResidentIssuePortal/Components/FileListing';
import PdfModal from './PdfModal';
import BackArrowIcon from '../Svg/BackArrowIcon';
import MailVector from '../Svg/MailVector';
import WebView from 'react-native-webview';
import {SvgUri} from 'react-native-svg';

const DOCX_EXTENSIONS = ['docx'];
const SHEET_EXTENSIONS = ['xls', 'xlsx', 'csv'];
const PDF_EXTENSIONS = ['pdf'];
const TEXT_EXTENSIONS = ['txt', 'html', 'htm', 'log', 'json'];
const EML_EXTENSIONS = ['eml'];

type FileKind =
  | 'image'
  | 'video'
  | 'svg'
  | 'audio'
  | 'pdf'
  | 'docx'
  | 'sheet'
  | 'text'
  | 'eml'
  | 'unsupported';

const getExtension = (value?: string): string => {
  if (!value) return '';
  const clean = value.split('?')[0].split('#')[0];
  return clean.toLowerCase().split('.').pop() ?? '';
};

const getFileKind = (extension: string): FileKind => {
  if (extension === 'svg') return 'svg';
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
  if (AUDIO_EXTENSIONS.includes(extension)) return 'audio';
  if (PDF_EXTENSIONS.includes(extension)) return 'pdf';
  if (DOCX_EXTENSIONS.includes(extension)) return 'docx';
  if (EML_EXTENSIONS.includes(extension)) return 'eml';
  if (SHEET_EXTENSIONS.includes(extension)) return 'sheet';
  if (TEXT_EXTENSIONS.includes(extension)) return 'text';
  return 'unsupported';
};

const getBadgeMeta = (kind: FileKind, colors: any) => {
  switch (kind) {
    case 'pdf':
      return {
        Icon: PdfIcon,
        label: 'PDF',
        color: colors.ToastColors?.Danger ?? '#D93025',
      };
    case 'sheet':
      return {Icon: ExcelIcon, label: 'EXCEL', color: '#188038'};
    case 'docx':
      return {Icon: WordIcon, label: 'WORD', color: '#1A73E8'};
    case 'image':
      return {Icon: ImageIcon, label: 'IMAGE', color: colors.Primary};
    case 'video':
      return {Icon: PlayIcon, label: 'VIDEO', color: colors.Primary};
    case 'audio':
      return {Icon: AudioIcon, label: 'AUDIO', color: colors.Primary};
    case 'eml':
      return {Icon: MailVector, label: 'EMAIL', color: '#53ea35'};
    default:
      return {Icon: DocumentIcon, label: 'FILE', color: colors.Grey};
  }
};

type Props = {
  visible: boolean;
  onClose: () => void;
  filename: string;
  onNext?: () => void; // NEW
  onPrevious?: () => void; // NEW
  /**
   * Resolves to a usable URL. For attachments that already carry a direct
   * link, pass `() => Promise.resolve(completeUrl)`. For flows that need a
   * signed URL first (FOIA-style), wrap the existing callback API in a
   * promise once at the call site - see usage notes.
   */
  resolveUrl: () => Promise<string>;
};

const FileViewer: React.FC<Props> = ({
  visible,
  onClose,
  filename,
  resolveUrl,
  onNext,
  onPrevious,
}) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const userData = selector?.residentUserData;
  const dispatch = useDispatch();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const extension = getExtension(filename);
  const kind = getFileKind(extension);
  const badge = getBadgeMeta(kind, colors);

  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [localPath, setLocalPath] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);
  const [openingExternally, setOpeningExternally] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localFileCache = useRef<Record<string, string>>({});
  const textCache = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!visible) {
      setResolvedUrl(null);
      setLocalPath(null);
      setTextContent('');
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setError(null);

      // ADD: cache-first check before showing spinner or hitting network
      if (kind === 'docx' || kind === 'sheet' || kind === 'pdf') {
        const cachedLocal = localFileCache.current[filename];
        if (cachedLocal) {
          const exists = await RNBlobUtil.fs.exists(cachedLocal);
          if (exists) {
            setLocalPath(cachedLocal);
            resolveUrl().then(url => {
              if (!cancelled) setResolvedUrl(url);
            });
            return; // skip download entirely
          }
          delete localFileCache.current[filename];
        }
      } else if (kind === 'text') {
        const cachedText = textCache.current[filename];
        if (cachedText) {
          setTextContent(cachedText);
          resolveUrl().then(url => {
            if (!cancelled) setResolvedUrl(url);
          });
          return;
        }
      }

      setLoading(true);

      try {
        const url = await resolveUrl();
        if (cancelled) return;
        setResolvedUrl(url);

        if (kind === 'docx' || kind === 'sheet' || kind === 'pdf') {
          const dest = `${
            RNBlobUtil.fs.dirs.CacheDir
          }/preview_${Date.now()}.${extension}`;
          const res = await RNBlobUtil.config({path: dest}).fetch('GET', url);
          if (cancelled) return;

          localFileCache.current[filename] = res.path(); // ADD: save for next open
          setLocalPath(res.path());
        } else if (kind === 'text') {
          const res = await RNBlobUtil.fetch('GET', url);
          if (cancelled) return;
          const content = await res.text();

          textCache.current[filename] = content; // ADD: save for next open
          setTextContent(content);
        }
      } catch (err) {
        console.log('FileViewer load error:', err);
        if (!cancelled) setError('Unable to load this file for preview.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [visible, filename]);

  const onDownload = async () => {
    try {
      setDownloading(true);
      const url = resolvedUrl ?? (await resolveUrl());
      await handleFileDownload(
        {url, name: filename, isCompleteUrl: true},
        userData,
        dispatch,
      );
    } catch (err) {
      console.log('FileViewer download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const onOpenExternally = async () => {
    if (openingExternally) return;

    try {
      setOpeningExternally(true);

      const url = resolvedUrl ?? (await resolveUrl());

      await openFileExternally(url, filename);
    } catch (err) {
      console.log('FileViewer open externally error:', err);
    } finally {
      setOpeningExternally(false);
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.Primary} />
        </View>
      );
    }

    if (error || !resolvedUrl) {
      return (
        <View style={styles.center}>
          <DocumentIcon width={48} height={48} primary={colors.Desc_Txt} />
          <Text style={styles.errorText}>
            {error ?? 'Preview unavailable.'}
          </Text>
          <TouchableOpacity
            style={styles.fallbackBtn}
            onPress={onOpenExternally}>
            <Text style={styles.fallbackBtnTxt}>Open Externally</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (kind) {
      case 'svg':
        return (
          <SvgUri
            uri={resolvedUrl}
            width="100%"
            height="100%"
            onError={() => setError('Unable to view SVG')}
          />
        );
      case 'image':
        return (
          <Image
            source={{uri: resolvedUrl}}
            style={styles.mediaFill}
            resizeMode="contain"
            onLoad={showLoader}
            onLoadEnd={() => setLoading(false)}
            onError={() => setError('Unable to view image')}
          />
        );

      case 'video':
      case 'audio':
        return (
          <Video
            source={{uri: resolvedUrl}}
            style={styles.mediaFill}
            controls
            resizeMode="contain"
            paused={false}
            onLoad={hideLoader}
            onReadyForDisplay={hideLoader}
            onProgress={() => loading && setLoading(false)}
            onBuffer={({isBuffering}) => setLoading(isBuffering)}
            onError={() => {
              setLoading(false);
              setError('Unable to view media');
            }}
          />
        );

      case 'pdf':
        return localPath ? (
          Platform.OS === 'ios' ? (
            <WebView
              source={{
                uri: localPath.startsWith('file://')
                  ? localPath
                  : `file://${localPath}`,
              }}
              style={styles.mediaFill}
              originWhitelist={['*']}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              onError={() => {
                setError('Unable to render this PDF.');
              }}
            />
          ) : (
            <Pdf
              source={{
                uri: localPath.startsWith('file://')
                  ? localPath
                  : `file://${localPath}`,
              }}
              style={styles.mediaFill}
              onError={err => {
                console.log('Pdf render error:', err);
                setError('Unable to render this PDF.');
              }}
            />
          )
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.Primary} />
          </View>
        );

      case 'docx':
        return localPath ? (
          <DocxViewer filePath={localPath} onError={setError} />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.Primary} />
          </View>
        );

      case 'sheet':
        return localPath ? (
          <ExcelViewer filePath={localPath} onError={setError} />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.Primary} />
          </View>
        );

      case 'text':
        return (
          <View style={styles.textContainer}>
            <RenderHTML
              contentWidth={ScreenSize.width - normalized(32)}
              source={{html: textContent || '<p>No content.</p>'}}
            />
          </View>
        );
      case 'eml':
        return (
          <EMLViewer
            url={resolvedUrl}
            contentWidth={ScreenSize.width - normalized(32)}
            textColor={colors.Desc_Txt}
            headingColor={colors.Heading_Txt}
          />
        );

      default:
        return (
          <View style={styles.center}>
            <DocumentIcon width={48} height={48} primary={colors.Desc_Txt} />
            <Text style={styles.errorText}>
              Preview isn't available for this file type.
            </Text>
            <TouchableOpacity
              style={styles.fallbackBtn}
              onPress={onOpenExternally}>
              <Text style={styles.fallbackBtnTxt}>Open Externally</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.headerTextCont}>
              {/* <Text style={styles.filename} numberOfLines={1}>
                {filename}
              </Text> */}
              <View
                style={[
                  styles.typeBadge,
                  {backgroundColor: `${badge.color}1A`},
                ]}>
                <Text style={[styles.typeBadgeTxt, {color: badge.color}]}>
                  {badge.label}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              disabled={openingExternally}
              onPress={onOpenExternally}>
              <ExternalLinkVector
                height={13}
                width={13}
                color={openingExternally ? colors.Grey_2 : colors.Desc_Txt}
              />
            </TouchableOpacity>

            {onPrevious && (
              <TouchableOpacity onPress={onPrevious}>
                <BackArrowIcon
                  height={20}
                  width={20}
                  primary={colors.Heading_Txt}
                />
              </TouchableOpacity>
            )}
            {onNext && (
              <TouchableOpacity
                style={{transform: [{scaleX: -1}]}}
                onPress={onNext}>
                <BackArrowIcon
                  height={20}
                  width={20}
                  primary={colors.Heading_Txt}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity disabled={downloading} onPress={onDownload}>
              {downloading ? (
                <ActivityIndicator size="small" color={colors.Desc_Txt} />
              ) : (
                <DownloadIcon
                  width={26}
                  height={26}
                  strokeWidth={0.1}
                  primary={colors.Desc_Txt}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerIconBtn} onPress={onClose}>
              <CloseIcon
                width={28}
                height={28}
                strokeWidth={2}
                primary={colors.Desc_Txt}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.header}>
            <Text style={styles.filename} numberOfLines={1}>
              {filename}
            </Text>
          </View>
          <View style={styles.body}>{renderBody()}</View>
        </View>
      </View>
    </Modal>
  );
};

export default FileViewer;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: normalized(20),
    },
    card: {
      width: '92%',
      height: '70%',
      backgroundColor: colors.Background,
      borderRadius: normalized(14),
      overflow: 'hidden',
      // small shadow so it lifts off the dim backdrop
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: normalized(12),
      shadowOffset: {width: 0, height: normalized(4)},
      elevation: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(26),
      paddingHorizontal: normalized(16),
      paddingVertical: normalized(12),
      borderBottomWidth: 1,
      borderBottomColor: colors.BorderColor,
    },
    badgeIcon: {
      width: normalized(36),
      height: normalized(36),
      borderRadius: normalized(8),
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTextCont: {flex: 1, gap: normalized(4)},
    filename: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.Heading_Txt,
    },
    typeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: normalized(8),
      paddingVertical: normalized(2),
      borderRadius: normalized(4),
    },
    typeBadgeTxt: {
      fontSize: normalized(10),
      fontFamily: AppFonts.UbuntuBold,
    },
    headerIconBtn: {
      width: normalized(36),
      height: normalized(36),
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {flex: 1}, // now sized by `card`'s height, not the full screen
    mediaFill: {flex: 1, backgroundColor: '#000'},
    textContainer: {flex: 1, padding: normalized(16)},
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: normalized(24),
      gap: normalized(12),
    },
    errorText: {
      fontSize: normalized(13),
      color: colors.Desc_Txt,
      textAlign: 'center',
    },
    fallbackBtn: {
      paddingHorizontal: normalized(20),
      paddingVertical: normalized(10),
      backgroundColor: colors.Primary,
      borderRadius: normalized(8),
    },
    fallbackBtnTxt: {
      color: '#fff',
      fontFamily: AppFonts.UbuntuBold,
      fontSize: normalized(13),
    },
    navArrow: {
      fontSize: normalized(22),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },
  });
