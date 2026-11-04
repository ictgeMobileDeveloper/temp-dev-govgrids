import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import FileViewer from '../../Components/MediaPreviewModal';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppFonts, normalized, ScreenSize} from '../../../Utils/AppConstants';
import {Base_Url} from '../../../Network/Urls';

import AppImageViewer from '../../Components/AppImageView';
import PlayIcon from '../../Svg/VideoSVG';
import {handleFileDownload} from '../../../Utils/DownloadHelper';
import {openFileExternally} from '../../../Utils/ExternalFileViewer';

import PdfIcon from '../../Svg/PdfIcon';
import ExcelIcon from '../../Svg/ExcelIcon';
import DocumentIcon from '../../Svg/DocumentIcon';
import WordIcon from '../../Svg/WordIcon';
import DownloadIcon from '../../Svg/DownloadIcon';
import AudioIcon from '../../Svg/AudioIcon';

export type AttachmentItem = {
  id?: number | string;

  url: string;

  // Your APIs use both filename and fileName
  filename?: string;
  fileName?: string;

  mimeType?: string;
  type?: string;

  /**
   * Use this when the image URL does not contain an extension.
   * For example, reqDetail.photos.
   */
  kind?: 'image' | 'file';

  bucketPath?: string;
  uploadedAt?: string;
  isCompleteUrl?: boolean;
};

type Props = {
  attachments?: AttachmentItem[] | null;
  title?: string;
  compact?: boolean;
};

export const VIDEO_EXTENSIONS = [
  'mp4',
  'mov',
  'm4v',
  'avi',
  'mkv',
  'webm',
  '3gp',
  'mpeg',
  'mpg',
  // 'ogv',
];

export const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'bmp',
  'heic',
  'heif',
  'avif',
];

export const AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'm4a',
  'aac',
  'flac',
  'ogg',
  'wma',
];

const getFilename = (item: AttachmentItem, index: number) => {
  return (
    item.fileName ||
    item.filename ||
    item.url?.split('?')?.[0]?.split('/')?.pop() ||
    `file_${index + 1}`
  );
};

const getExtension = (value?: string): string => {
  if (!value) {
    return '';
  }

  const cleanValue = value.split('?')[0].split('#')[0];
  return cleanValue.toLowerCase().split('.').pop() ?? '';
};

const isAbsoluteUrl = (url?: string) => {
  if (!url) {
    return false;
  }

  return /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(url);
};

const getCompleteUrl = (url?: string) => {
  if (!url) {
    return '';
  }

  if (isAbsoluteUrl(url)) {
    return url;
  }

  const baseUrl = Base_Url.endsWith('/') ? Base_Url.slice(0, -1) : Base_Url;

  const relativeUrl = url.startsWith('/') ? url : `/${url}`;

  return `${baseUrl}${relativeUrl}`;
};

const isImageAttachment = (attachment: AttachmentItem, filename: string) => {
  if (attachment.kind === 'image') {
    return true;
  }

  const mimeType = attachment.mimeType || attachment.type;

  if (mimeType?.toLowerCase().startsWith('image/')) {
    return true;
  }

  const filenameExtension = getExtension(filename);
  const urlExtension = getExtension(attachment.url);

  return (
    IMAGE_EXTENSIONS.includes(filenameExtension) ||
    IMAGE_EXTENSIONS.includes(urlExtension)
  );
};

const isVideoAttachment = (attachment: AttachmentItem, filename: string) => {
  const mimeType = attachment.mimeType || attachment.type;

  if (mimeType?.toLowerCase().startsWith('video/')) {
    return true;
  }

  const filenameExtension = getExtension(filename);
  const urlExtension = getExtension(attachment.url);

  return (
    VIDEO_EXTENSIONS.includes(filenameExtension) ||
    VIDEO_EXTENSIONS.includes(urlExtension)
  );
};
const isAudioAttachment = (attachment: AttachmentItem, filename: string) => {
  const mimeType = attachment.mimeType || attachment.type;

  if (mimeType?.toLowerCase().startsWith('audio/')) {
    return true;
  }

  const filenameExtension = getExtension(filename);
  const urlExtension = getExtension(attachment.url);

  return (
    AUDIO_EXTENSIONS.includes(filenameExtension) ||
    AUDIO_EXTENSIONS.includes(urlExtension)
  );
};

const getFileIcon = (filename: string) => {
  const extension = getExtension(filename);

  if (extension === 'pdf') {
    return PdfIcon;
  }

  if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return ExcelIcon;
  }

  if (['doc', 'docx'].includes(extension)) {
    return WordIcon;
  }

  return DocumentIcon;
};

const RequestAttachmentsGallery: React.FC<Props> = ({
  attachments,
  title = 'Attachments',
  compact = false,
}) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);

  const colors = selector.themeColors;
  const userData = selector?.residentUserData;
  const dispatch = useDispatch();

  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [openingIndex, setOpeningIndex] = useState<number | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);

  if (!attachments?.length) {
    return null;
  }

  const onOpenAttachment = (attachment: AttachmentItem, index: number) => {
    setViewerIndex(index); // NEW - was: isImage ? setPreviewUri(...) : openFileExternally(...)
  };

  // const onDownloadAttachment = async (
  //   attachment: AttachmentItem,
  //   index: number,
  // ) => {
  //   const filename = getFilename(attachment, index);
  //   const completeUrl = getCompleteUrl(attachment.url);

  //   try {
  //     setDownloadingIndex(index);

  //     await handleFileDownload(
  //       {
  //         url: completeUrl,
  //         name: filename,
  //         isCompleteUrl: true,
  //       },
  //       userData,
  //       dispatch,
  //     );
  //   } finally {
  //     setDownloadingIndex(null);
  //   }
  // };

  const gallery = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      {attachments.map((attachment, index) => {
        const filename = getFilename(attachment, index);
        const completeUrl = getCompleteUrl(attachment.url);
        const isImage = isImageAttachment(attachment, filename);
        const isVideo = isVideoAttachment(attachment, filename);
        const isAudio = isAudioAttachment(attachment, filename);
        const FileIcon = getFileIcon(filename);

        return (
          <View
            key={`${attachment.id ?? filename}-${index}`}
            style={styles.attachmentContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.attachmentTouchable}
              disabled={openingIndex === index}
              onPress={() => onOpenAttachment(attachment, index)}>
              {openingIndex === index ? (
                <ActivityIndicator size="small" color={colors.Primary} />
              ) : isImage ? (
                <AppImageViewer
                  source={{uri: completeUrl}}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : isVideo ? (
                <View style={styles.videoContainer}>
                  <PlayIcon
                    width={normalized(48)}
                    height={normalized(48)}
                    primary={colors.Primary}
                  />
                </View>
              ) : isAudio ? (
                <View style={styles.audioContainer}>
                  <AudioIcon
                    width={normalized(42)}
                    height={normalized(42)}
                    primary={colors.Primary}
                  />
                </View>
              ) : (
                <View style={styles.documentContainer}>
                  <FileIcon
                    width={normalized(42)}
                    height={normalized(42)}
                    primary={colors.Primary}
                  />
                </View>
              )}
            </TouchableOpacity>
            {/* 
            <TouchableOpacity
              activeOpacity={0.7}
              disabled={downloadingIndex === index}
              onPress={() => onDownloadAttachment(attachment, index)}
              style={styles.downloadButton}>
              {downloadingIndex === index ? (
                <ActivityIndicator size="small" color={colors.White} />
              ) : (
                <DownloadIcon
                  primary={colors.White}
                  width={normalized(14)}
                  height={normalized(14)}
                />
              )}
            </TouchableOpacity> */}
          </View>
        );
      })}
    </ScrollView>
  );

  return (
    <>
      {compact ? (
        gallery
      ) : (
        <View style={styles.container}>
          <Text style={styles.titleText}>{title}</Text>
          {gallery}
        </View>
      )}

      {viewerIndex !== null && (
        <FileViewer
          visible={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          filename={getFilename(attachments[viewerIndex], viewerIndex)}
          resolveUrl={() =>
            Promise.resolve(getCompleteUrl(attachments[viewerIndex].url))
          }
          onPrevious={
            viewerIndex > 0 ? () => setViewerIndex(viewerIndex - 1) : undefined
          }
          onNext={
            viewerIndex < attachments.length - 1
              ? () => setViewerIndex(viewerIndex + 1)
              : undefined
          }
        />
      )}
    </>
  );
};

export default RequestAttachmentsGallery;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(12),
      padding: normalized(16),
      backgroundColor: colors.Background,
    },

    titleText: {
      fontSize: normalized(16),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
      marginBottom: normalized(12),
    },

    scrollContent: {
      gap: normalized(12),
      paddingRight: normalized(4),
    },

    attachmentContainer: {
      width: normalized(110),
      height: normalized(110),
      borderRadius: normalized(10),
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.BorderColor,
      backgroundColor: colors.Background,
    },

    attachmentTouchable: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    audioContainer: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.Background,
    },

    thumbnail: {
      width: '100%',
      height: '100%',
    },

    documentContainer: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.Background,
    },

    downloadButton: {
      position: 'absolute',
      right: normalized(6),
      bottom: normalized(6),
      width: normalized(28),
      height: normalized(28),
      borderRadius: normalized(14),
      backgroundColor: 'rgba(0,0,0,0.58)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    previewOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    previewImage: {
      width: ScreenSize.width * 0.95,
      height: ScreenSize.height * 0.75,
    },
    videoContainer: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.Background,
    },
  });
