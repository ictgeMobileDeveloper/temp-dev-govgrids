import ReactNativeBlobUtil from 'react-native-blob-util';
import {open} from 'react-native-file-viewer-turbo';

export const openFileExternally = async (
  url: string,
  filename: string,
  onError?: (err: any) => void,
) => {
  try {
    const safeName = String(filename || 'document').replace(
      /[^a-zA-Z0-9_.-]/g,
      '_',
    );
    const path = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/${safeName}`;

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path,
    }).fetch('GET', url);

    await open(res.path(), {showOpenWithDialog: true});
  } catch (err) {
    console.log('openFileExternally failed:', err);
    onError?.(err);
  }
};
