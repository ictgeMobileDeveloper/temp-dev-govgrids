import ReactNativeBlobUtil from 'react-native-blob-util';
import {Platform} from 'react-native';
import {setShowToast} from '../Redux/AppReducers';
import {AppStrings} from '../Utils/AppStrings';
import {Base_Url} from '../Network/Urls';
import RNFS from 'react-native-fs';
import {zip} from 'react-native-zip-archive';
import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import notifee, {AndroidImportance} from 'react-native-notify-kit';

const DOWNLOAD_CHANNEL_ID = 'downloads';
const DOWNLOAD_NOTIFICATION_ID = 'download-notification';

const DOWNLOAD_DIR =
  Platform.OS === 'android'
    ? RNFS.DownloadDirectoryPath
    : RNFS.DocumentDirectoryPath;

const getMimeType = (fileName: string): string => {
  const ext = fileName.toLowerCase().split('.').pop() || '';

  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'mp4':
      return 'video/mp4';
    case 'mp3':
      return 'audio/mpeg';
    case 'zip':
      return 'application/zip';
    default:
      return 'application/octet-stream';
  }
};

let notificationsInitialized = false;
let notificationInitializationPromise: Promise<void> | null = null;

const initializeDownloadNotifications = async () => {
  if (notificationsInitialized) {
    return;
  }

  if (notificationInitializationPromise) {
    return notificationInitializationPromise;
  }

  notificationInitializationPromise = (async () => {
    await notifee.requestPermission();
    await createDownloadChannel();
    notificationsInitialized = true;
  })();

  try {
    await notificationInitializationPromise;
  } finally {
    notificationInitializationPromise = null;
  }
};
const createDownloadChannel = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: DOWNLOAD_CHANNEL_ID,
      name: 'Downloads',
      importance: AndroidImportance.HIGH,
    });
  }
};

const showDownloadNotification = async ({
  notificationId = DOWNLOAD_NOTIFICATION_ID,
  title,
  body,
  ongoing = true,
  progress,
  data,
}: {
  notificationId?: string;
  title: string;
  body: string;
  ongoing?: boolean;
  progress?: {
    max: number;
    current: number;
    indeterminate?: boolean;
  };
  data?: Record<string, string>;
}) => {
  // await initializeDownloadNotifications();
  await notifee.displayNotification({
    id: notificationId,
    title,
    body,
    data,
    android: {
      channelId: DOWNLOAD_CHANNEL_ID,
      smallIcon: 'ic_launcher',
      ongoing,
      autoCancel: !ongoing,
      onlyAlertOnce: true,
      pressAction: {
        id: data?.filePath ? 'open-downloaded-file' : 'default',
      },
      ...(progress ? {progress} : {}),
    },
    ios: {
      foregroundPresentationOptions: {
        alert: true,
        badge: false,
        sound: false,
      },
    },
  });
};

export const handleFileDownload = async (
  attachments: any,
  userData: any,
  dispatch: any,
) => {
  try {
    await initializeDownloadNotifications();
    console.log('attachments-----  ', attachments);
    const notificationId = `single-download-${Date.now()}`;

    const {url, name, isCompleteUrl = false} = attachments;

    if (!url || !name) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Invalid attachment.',
        }),
      );
      return;
    }

    const downloadUrl = isCompleteUrl ? url : `${Base_Url}${url}`;

    const extension = name.includes('.') ? `.${name.split('.').pop()}` : '';
    const baseName = name.includes('.')
      ? name.substring(0, name.lastIndexOf('.'))
      : name;
    const uniqueName = `${baseName}_${Date.now()}${extension}`;
    const mimeType = getMimeType(uniqueName);

    console.log('uniqueName ----  ', uniqueName);

    dispatch(
      setShowToast({
        type: AppStrings.ToastType.warning,
        message: 'Downloading...',
      }),
    );

    await showDownloadNotification({
      notificationId,
      title: 'Downloading file',
      body: uniqueName,
      ongoing: true,
      progress:
        Platform.OS === 'android'
          ? {
              max: 100,
              current: 0,
              indeterminate: true,
            }
          : undefined,
    });

    if (Platform.OS === 'android') {
      const tempRes = await ReactNativeBlobUtil.config({
        fileCache: true,
      })
        .fetch('GET', downloadUrl, {
          Authorization: `Bearer ${userData?.token}`,
        })
        .progress({interval: 300}, async (received, total) => {
          if (!total || total <= 0) return;

          const percent = Math.floor((received / total) * 100);

          await showDownloadNotification({
            notificationId,
            title: 'Downloading file',
            body: `${uniqueName} - ${percent}%`,
            ongoing: true,
            progress: {
              max: 100,
              current: percent,
              indeterminate: false,
            },
          });
        });

      const tempPath = tempRes.path();

      const filePath =
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: uniqueName,
            parentFolder: '',
            mimeType: mimeType,
          },
          'Download',
          tempPath,
        );

      await ReactNativeBlobUtil.fs.unlink(tempPath);

      await showDownloadNotification({
        notificationId,
        title: 'Download complete',
        body: `File downloaded successfully: ${uniqueName}`,
        ongoing: false,
      });

      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: `File downloaded successfully.\nSaved to public Downloads folder as:\n${uniqueName}`,
        }),
      );

      console.log('File saved to public Downloads:', uniqueName);
    } else {
      const dirs = ReactNativeBlobUtil.fs.dirs;
      const filePath = `${dirs.DocumentDir}/${uniqueName}`;

      const res = await ReactNativeBlobUtil.config({
        path: filePath,
      })
        .fetch('GET', downloadUrl, {
          Authorization: `Bearer ${userData?.token}`,
        })
        .progress({interval: 300}, async (received, total) => {
          if (!total || total <= 0) return;

          const percent = Math.floor((received / total) * 100);

          await showDownloadNotification({
            title: 'Downloading file',
            body: `${uniqueName} - ${percent}%`,
            ongoing: true,
          });
        });

      console.log('res.path() ----- ', res);

      await showDownloadNotification({
        title: 'Download complete',
        body: 'Tap to open downloaded file',
        ongoing: false,
        data: {
          filePath,
          mimeType,
        },
      });

      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: `File downloaded successfully.\nSaved to app Documents:\n${res.path()}`,
        }),
      );
    }
  } catch (err) {
    console.log('Download error:', err);

    await showDownloadNotification({
      title: 'Download failed',
      body: 'File could not be downloaded',
      ongoing: false,
    });

    dispatch(
      setShowToast({
        type: AppStrings.ToastType.error,
        message: `Download failed: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      }),
    );
  }
};

export const downloadAllFiles = async (blobUrls: any[]) => {
  await initializeDownloadNotifications();

  const folderPath = `${DOWNLOAD_DIR}/${DeviceInfo.getApplicationName()}`;

  await RNFS.mkdir(folderPath);

  const totalFiles = blobUrls.length;

  await showDownloadNotification({
    title: 'Downloading files',
    body: `Starting download... 0/${totalFiles}`,
    ongoing: true,
    progress:
      Platform.OS === 'android'
        ? {
            max: totalFiles * 100,
            current: 0,
            indeterminate: false,
          }
        : undefined,
  });

  try {
    for (let index = 0; index < blobUrls.length; index++) {
      const item = blobUrls[index];

      const fileName =
        item.filename ?? item?.documentName ?? `file_${index + 1}`;

      const filePath = `${folderPath}/${fileName}`;

      await showDownloadNotification({
        title: 'Downloading files',
        body: `${fileName} (${index + 1}/${totalFiles})`,
        ongoing: true,
        progress:
          Platform.OS === 'android'
            ? {
                max: totalFiles * 100,
                current: index * 100,
                indeterminate: false,
              }
            : undefined,
      });

      await RNFS.downloadFile({
        fromUrl: item.url ?? item?.signedUrl,
        toFile: filePath,
        progressDivider: 5,
        progress: progress => {
          const filePercent = progress.contentLength
            ? Math.floor((progress.bytesWritten / progress.contentLength) * 100)
            : 0;

          console.log('DOWNLOAD ALL FILE PROGRESS --->', fileName, filePercent);

          showDownloadNotification({
            title: 'Downloading files',
            body: `${fileName} - ${filePercent}% (${index + 1}/${totalFiles})`,
            ongoing: true,
            progress:
              Platform.OS === 'android'
                ? {
                    max: totalFiles * 100,
                    current: index * 100 + filePercent,
                    indeterminate: false,
                  }
                : undefined,
          });
        },
      }).promise;
    }

    await showDownloadNotification({
      title: 'Files downloaded',
      body: 'Preparing zip...',
      ongoing: true,
    });

    return folderPath;
  } catch (error) {
    await showDownloadNotification({
      title: 'Download failed',
      body: 'Some files could not be downloaded',
      ongoing: false,
    });

    throw error;
  }
};

export const handleLocalFileDownload = async (
  attachments: any,
  dispatch: any,
) => {
  try {
    console.log('local attachments ', attachments);

    const localUri = attachments?.url;
    const fileName = attachments?.name;

    if (!localUri) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Invalid attachment.',
        }),
      );
      return;
    }

    const sourcePath = String(localUri).startsWith('file://')
      ? String(localUri).replace('file://', '')
      : String(localUri);

    const extension = fileName.includes('.')
      ? `.${fileName.split('.').pop()}`
      : '';

    const baseName = fileName.includes('.')
      ? fileName.substring(0, fileName.lastIndexOf('.'))
      : fileName;

    const uniqueName = `${baseName}_${Date.now()}${extension}`;

    const destinationPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${uniqueName}`
        : `${RNFS.DocumentDirectoryPath}/${uniqueName}`;

    await RNFS.copyFile(sourcePath, destinationPath);

    dispatch(
      setShowToast({
        type: AppStrings.ToastType.success,
        message:
          Platform.OS === 'android'
            ? `File Saved to Downloads as ${uniqueName}`
            : `File Saved to Documents as ${uniqueName}`,
      }),
    );
  } catch (err) {
    dispatch(
      setShowToast({
        type: AppStrings.ToastType.error,
        message: 'Download failed.',
      }),
    );
  }
};

export const zipAndCleanup = async (sourcePath: string) => {
  const zipPath = `${DOWNLOAD_DIR}/${DeviceInfo.getApplicationName()}-${moment().format(
    'DD-MM-YYYY-HH-mm-ss',
  )}.zip`;

  await zip(sourcePath, zipPath);

  await RNFS.unlink(sourcePath);

  await showDownloadNotification({
    title: 'Download complete',
    body:
      Platform.OS === 'android'
        ? 'Tap to open downloaded zip file'
        : 'Zip file downloaded successfully',
    ongoing: false,
    data:
      Platform.OS === 'android'
        ? {
            filePath: zipPath,
            mimeType: 'application/zip',
          }
        : undefined,
  });

  return zipPath;
};
