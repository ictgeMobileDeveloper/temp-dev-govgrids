import {useRef, useState} from 'react';
import {apiHandler, ApiMethod} from '../Network/Services/ApiHandler';
import {ENDPOINTS} from '../Network/Urls';
import {AppStrings, AuthContext} from '../Utils/AppStrings';
import {downloadAllFiles, zipAndCleanup} from '../Utils/DownloadHelper';
import {useDispatch} from 'react-redux';
import {setShowToast} from '../Redux/AppReducers';

export const useSignedDocResolver = (
  queryParams: object,
  authContext: AuthContext,
  singleURLEndpoint: string,
  allsignedURLEndPoint: string,
  Method?: ApiMethod,
) => {
  const cache = useRef<Record<string, string>>({});
  const [downloadAllLoading, setDownloadAllLoading] = useState(false);
  const dispatch = useDispatch();
  console.log(Method, 'Method');
  const resolveDocUrl = (docItem: any, docType?: any): Promise<string> => {
    const key = String(docItem?.id);
    const endpoint = docType
      ? singleURLEndpoint.replace('{type}', docType)
      : singleURLEndpoint;
    if (cache.current[key]) return Promise.resolve(cache.current[key]);

    return new Promise(resolve => {
      apiHandler({
        endpoint: endpoint,
        method: Method ?? 'GET',
        ...(Method && Method !== 'GET'
          ? {
              payload: {
                ...queryParams,
                documentId: docItem?.id,
                id: docItem?.id,
              },
            }
          : {
              queryParams: {
                ...queryParams,
                documentId: docItem?.id,
                id: docItem?.id,
              },
            }),

        authContext: authContext,
        useRecaptcha: true,
        onComplete: (resp: any) => {
          console.log('response ', resp);
          const url = resp?.data?.signedURL ?? resp?.data?.data?.signedUrl;
          console.log(url);
          if (url) cache.current[key] = url;
          resolve(url);
        },
      });
    });
  };

  const downloadAll = () => {
    setDownloadAllLoading(true);
    // const queryParams =
    //   authContext === 'RESIDENT'
    //     ? {
    //         requestId,
    //         securityKey,
    //       }
    //     : {
    //         requestId: requestId,
    //         pageSize: 'all',
    //       };

    apiHandler({
      endpoint: allsignedURLEndPoint,
      method: 'GET',
      queryParams,
      authContext: authContext,
      useRecaptcha: true,
      onComplete: async (resp: any) => {
        try {
          if (!resp?.status) {
            throw new Error('Failed to get signed URLs');
          }

          const blobUrls = resp?.data?.blobUrls ?? (resp?.data?.data || []);

          if (!blobUrls.length) {
            throw new Error('No files to download');
          }

          const folderPath = await downloadAllFiles(blobUrls);
          await zipAndCleanup(folderPath);

          setDownloadAllLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Files zipped & downloaded successfully',
            }),
          );
        } catch (err) {
          console.error(err);
          setDownloadAllLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: 'Download failed',
            }),
          );
        }
      },
    });
  };

  return {resolveDocUrl, downloadAll, downloadAllLoading};
};
