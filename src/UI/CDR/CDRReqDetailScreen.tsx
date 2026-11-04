import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppColors,
  AppFonts,
  normalized,
  ScreenProps,
  CDR_FORENSICS_DIVISION_LIST,
  CDR_RECORD_DIVISION_LIST,
  getCDRForensicsDivisionPayload,
} from '../../Utils/AppConstants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import CustomHeader from '../Components/CustomHeader';
import FileViewer from '../Components/MediaPreviewModal';
import {
  capitalizeEachWord,
  getErrorMessage,
  getStatusColor,
} from '../../Utils/Helper';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {ENDPOINTS} from '../../Network/Urls';
import {setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import TickIcon from '../Svg/TickIcon';
import moment from 'moment';
import WordIcon from '../Svg/WordIcon';
import DownloadIcon from '../Svg/DownloadIcon';
import {
  downloadAllFiles,
  handleFileDownload,
  zipAndCleanup,
} from '../../Utils/DownloadHelper';
import CustomSwitcher from '../Components/CustomSwitcher';
import CustomButton from '../Components/CustomButton';
import PdfIcon from '../Svg/PdfIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import DocumentIcon from '../Svg/DocumentIcon';
import RequestCommentsSection from '../Components/RequestCommentsSection';
import {requestCommentsService} from '../../Network/Services/RequestCommentsService';
import {
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../ResidentIssuePortal/Components/FileListing';
import ImageIcon from '../Svg/ImageIcon';
import PlayIcon from '../Svg/VideoSVG';
import AudioIcon from '../Svg/AudioIcon';
import MailVector from '../Svg/MailVector';
import {useSignedDocResolver} from '../../Hooks/getSignedUrl';
import {Routes} from '../../Utils/Routes';
import {useDeepLinkGuard} from '../../Hooks/DeepLinkGuard';

const CDRReqDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const userData = selector?.CDRUserData;
  const [data, setData] = useState<any>(null);
  const [files, setFiles] = useState<any>(null);
  const isCommentDisabled = [
    'published',
    'withdrawn',
    'closed',
    'archived',
    'declined',
  ].includes(data?.status?.toLowerCase());
  const [comments, setComments] = useState<any>([]);
  const [commentLoading, setCommentLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const {isBlocked} = useDeepLinkGuard(userData);
  if (isBlocked) {
    return (
      <View style={[styles.container, styles.loaderCont]}>
        <ActivityIndicator color={colors.Primary} size="large" />
      </View>
    );
  }

  // to cache the opened file
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const viewerItem =
    viewerIndex !== null ? data?.blob_urls?.[viewerIndex] : null;

  const {resolveDocUrl, downloadAll, downloadAllLoading} = useSignedDocResolver(
    {
      requestId: data?.id,
      pageSize: 'all',
    },
    'CDR',
    ENDPOINTS.cdrGetSingleSignedUrl,
    ENDPOINTS.cdrGetAllSignedUrl,
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReqDetail(false);
  };

  useEffect(() => {
    fetchReqDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchComments = () => {
    apiHandler({
      endpoint: `${ENDPOINTS.getCDRComments}?requestId=${
        props?.route?.params?.item?.id ?? props?.route?.params?.id
      }`,
      method: 'GET',
      authContext: 'CDR',
      onComplete: (res: any) => {
        setIsLoading(false);
        setRefreshing(false);
        setCommentLoading(false);

        if (res?.status) {
          setComments(res?.data?.data);
        } else {
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(res),
            }),
          );
        }
      },
    });
  };

  const fetchReqDetail = (showLoader = true) => {
    console.log('CDR params', props?.route?.params?.item?.id);
    if (showLoader) {
      setIsLoading(true);
    }

    apiHandler({
      endpoint: ENDPOINTS.getCDRReqDetail,
      method: 'GET',
      queryParams: {
        requestId: props?.route?.params?.item?.id ?? props?.route?.params?.id,
      },
      authContext: 'CDR',
      onComplete: (resp: any) => {
        if (resp?.status) {
          console.log(' CDR Request Detail ', resp);
          const responseData = resp?.data?.data;
          setFiles(resp?.data), setData(responseData);

          fetchComments();
        } else {
          setIsLoading(false);
          setRefreshing(false);

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

  // const fetchSignedUrl = (
  //   docItem: any,
  //   onSuccess: (signedURL: string) => void,
  // ) => {
  //   apiHandler({
  //     endpoint: ENDPOINTS.cdrGetSingleSignedUrl,
  //     method: 'GET',
  //     queryParams: {requestId: data?.id, documentId: docItem?.id},
  //     authContext: 'CDR',
  //     onComplete: (resp: any) => {
  //       const signedURL = resp?.data?.signedURL;

  //       if (!resp?.status || !signedURL) {
  //         dispatch(
  //           setShowToast({
  //             type: AppStrings.ToastType.error,
  //             message: getErrorMessage(resp) || 'Failed to get signed URL',
  //           }),
  //         );
  //         setOpeningDocId(null);
  //         setDownloadingDocId(null);
  //         return;
  //       }

  //       onSuccess(signedURL);
  //     },
  //   });
  // };

  const onViewDocument = (index: number) => {
    setViewerIndex(index);
  };
  // const onDownload = (docItem: any) => {
  //   setDownloadingDocId(docItem?.id);

  //   fetchSignedUrl(docItem, async signedURL => {
  //     try {
  //       await handleFileDownload(
  //         {
  //           url: signedURL,
  //           name: docItem?.documentName,
  //           isCompleteUrl: true,
  //         },
  //         userData,
  //         dispatch,
  //       );
  //     } catch (err) {
  //       dispatch(
  //         setShowToast({
  //           type: AppStrings.ToastType.error,
  //           message: 'Download failed',
  //         }),
  //       );
  //     } finally {
  //       setDownloadingDocId(null);
  //     }
  //   });
  // };

  // const getAllSignedUrl = () => {
  //   setDownloadAllLoading(true);

  //   apiHandler({
  //     endpoint: ENDPOINTS.cdrGetAllSignedUrl,
  //     method: 'GET',
  //     queryParams: {requestId: data?.id, pageSize: 'all'},
  //     authContext: 'CDR',
  //     onComplete: async (resp: any) => {
  //       try {
  //         if (!resp?.status) {
  //           throw new Error('Failed to get signed URLs');
  //         }

  //         const blobUrls = resp?.data?.data || [];

  //         if (!blobUrls.length) {
  //           throw new Error('No files to download');
  //         }

  //         const folderPath = await downloadAllFiles(blobUrls);
  //         await zipAndCleanup(folderPath);

  //         setDownloadAllLoading(false);
  //         dispatch(
  //           setShowToast({
  //             type: AppStrings.ToastType.success,
  //             message: 'Files zipped & downloaded successfully',
  //           }),
  //         );
  //       } catch (err) {
  //         console.error(err);
  //         setDownloadAllLoading(false);

  //         dispatch(
  //           setShowToast({
  //             type: AppStrings.ToastType.error,
  //             message: 'Download failed',
  //           }),
  //         );
  //       }
  //     },
  //   });
  // };
  const byCheckedFirst = (list: any[]) =>
    [...list].sort(
      (a, b) => Number(data?.[b.key] === true) - Number(data?.[a.key] === true),
    );

  const sortedForensicsList = useMemo(
    () => byCheckedFirst(CDR_FORENSICS_DIVISION_LIST),
    [data],
  );

  const sortedRecordsList = useMemo(
    () => byCheckedFirst(CDR_RECORD_DIVISION_LIST),
    [data],
  );
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
      {!isLoading && (
        <CustomHeader
          onBackPress={() => props?.navigation?.goBack()}
          text={data?.requestId}
        />
      )}

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{marginHorizontal: normalized(20)}}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.Primary}
              colors={[colors.Primary]}
            />
          }>
          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.nameTxt}>{'Request Details'}</Text>
            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Name</Text>
                <Text
                  style={
                    styles.valueTxt
                  }>{`${data?.requesterUser?.firstName} ${data?.requesterUser?.lastName}`}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Email</Text>
                <Text style={[styles.valueTxt, {fontSize: normalized(11)}]}>
                  {data?.requesterUser?.email}
                </Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Incident Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.incidentData)?.format('LL')}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>NBPD Case No</Text>
                <Text style={styles.valueTxt}>{data?.nbpdCaseNo}</Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Docket #</Text>
                <Text style={[styles.valueTxt, {fontSize: normalized(12)}]}>
                  {data?.docketNumber}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Defendant Name</Text>
                <Text style={styles.valueTxt}>{data?.defendantName}</Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Request Submission Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.requestDate).format('LL')}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Request Status</Text>
                <View
                  style={[
                    styles.statusCont,
                    {
                      backgroundColor: getStatusColor(data?.status, colors),
                      alignSelf: 'flex-start',
                    },
                  ]}>
                  <Text style={styles.statusTxt}>
                    {capitalizeEachWord(data?.status)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.nameTxt}>{'Digital Forensic Division'}</Text>

            {sortedForensicsList.map((item, index) => {
              const isSelected = data?.[item.key] === true;

              return (
                <View key={`${item.key}-${index}`} style={styles.forensicRow}>
                  {isSelected ? (
                    <TickIcon primary={AppColors.ToastColors.Success} />
                  ) : (
                    <Text style={styles.crossTxt}>❌</Text>
                  )}

                  <Text style={styles.valueTxt}>{item.label}</Text>
                </View>
              );
            })}

            <View style={styles.forensicRow}>
              <View style={styles.otherEvidenceCont}>
                <View style={styles.otherEvidenceHeader}>
                  {data?.otherEvidence ? (
                    <TickIcon primary={AppColors.ToastColors.Success} />
                  ) : (
                    <Text style={styles.crossTxt}>❌</Text>
                  )}

                  <Text style={styles.keyTxt}>Other Evidence:</Text>
                </View>

                <Text style={styles.otherEvidenceTxt}>
                  {data?.otherEvidence || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.nameTxt}>{'Records Division'}</Text>

            {sortedRecordsList.map((item, index) => {
              const isSelected = data?.[item.key] === true;

              return (
                <View key={`${item.key}-${index}`} style={styles.forensicRow}>
                  {isSelected ? (
                    <TickIcon primary={AppColors.ToastColors.Success} />
                  ) : (
                    <Text style={styles.crossTxt}>❌</Text>
                  )}

                  <Text style={styles.valueTxt}>{item.label}</Text>
                </View>
              );
            })}
          </View>

          {files?.URLS?.length > 0 && (
            <>
              <View style={{height: normalized(12)}} />
              <View style={styles.itemCont}>
                <Text style={styles.nameTxt}>Request Documents</Text>

                {files?.URLS.slice(0, 5).map((item: any, index: number) => {
                  const type = item?.documentName?.split('.').pop();
                  return (
                    <View
                      key={index}
                      style={[styles.docBlock, {marginTop: normalized(8)}]}>
                      <TouchableOpacity
                        style={styles.docTapArea}
                        onPress={() => onViewDocument(index)}>
                        {type == 'pdf' ? (
                          <PdfIcon />
                        ) : IMAGE_EXTENSIONS.includes(type) ? (
                          <ImageIcon size={30} />
                        ) : VIDEO_EXTENSIONS.includes(type) ? (
                          <PlayIcon />
                        ) : AUDIO_EXTENSIONS.includes(type) ? (
                          <AudioIcon />
                        ) : type == 'doc' || type == 'docx' ? (
                          <WordIcon />
                        ) : type == 'eml' ? (
                          <MailVector />
                        ) : ['xls', 'xlsx', 'csv'].includes(type) ? (
                          <ExcelIcon />
                        ) : (
                          <DocumentIcon
                            width={30}
                            height={30}
                            primary={colors.Desc_Txt}
                          />
                        )}
                        <View style={styles.filenameCont}>
                          <Text style={styles.nameTxt}>
                            {item?.documentName}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {files?.URLS?.length > 5 ? (
                  <CustomButton
                    text={`See All (${files?.URLS?.length})`}
                    onPress={() =>
                      props.navigation.navigate(Routes.DocumentListScreen, {
                        singleSignedURL: ENDPOINTS.cdrGetSingleSignedUrl,
                        AllSignedURL: ENDPOINTS.cdrGetAllSignedUrl,
                        navigation: 'CDR',
                        urls: files?.URLS,
                        payload: {
                          requestId: data?.id,
                          pageSize: 'all',
                        },
                      })
                    }
                  />
                ) : (
                  files?.URLS?.length > 1 && (
                    <CustomButton
                      text="Download All"
                      onPress={() => downloadAll()}
                      loading={downloadAllLoading}
                    />
                  )
                )}
              </View>
            </>
          )}

          <CustomSwitcher
            list={[{name: 'Comments'}]}
            selectedIndex={0}
            onChange={() => {}}
          />

          <RequestCommentsSection
            comments={comments}
            loading={commentLoading}
            disabled={isCommentDisabled}
            disabledMessage={`Your comments are disabled because your case has been ${capitalizeEachWord(
              data?.status,
            )}.`}
            showComposer={!isCommentDisabled}
            getIsOwner={item => item?.cdrUserId === userData?.id}
            getAuthorName={item =>
              `${item?.cdrUserFirstName || ''} ${
                item?.cdrUserLastName || ''
              }`.trim()
            }
            getAvatarPath={item => item?.cdrUserProfilePicture}
            getInitial={item => item?.cdrUserFirstName?.charAt(0)}
            getCommentHtml={item => item?.comment}
            getCommentDate={item => item?.commentAt}
            canEditComment={item => !item?.isEdited}
            onCreateComment={async comment => {
              if (!comment) return false;

              setCommentLoading(true);

              const resp = await requestCommentsService.createComment({
                endpoint: ENDPOINTS.cdrComment,
                authContext: 'CDR',
                payload: {
                  cdrRequest: data?.id,
                  comment,
                  commentBy: 'public',
                  requestId: data?.id,
                },
              });

              if (resp?.status) {
                fetchComments();
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.success,
                    message: 'Comment Successfully Posted',
                  }),
                );
                return true;
              }

              setCommentLoading(false);
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.error,
                  message: getErrorMessage(resp),
                }),
              );
              return false;
            }}
            onUpdateComment={async (comment, item) => {
              setCommentLoading(true);

              const resp = await requestCommentsService.updateComment({
                endpoint: ENDPOINTS.editCdrComment,
                authContext: 'CDR',
                queryParams: {commentId: item?.id},
                payload: {
                  comment,
                  cdrrequest: data?.id,
                  requestId: data?.id,
                  commentBy: 'public',
                },
              });

              if (resp?.status) {
                fetchComments();
                dispatch(
                  setShowToast({
                    type: AppStrings.ToastType.success,
                    message: 'Comment Updated',
                  }),
                );
                return true;
              }

              setCommentLoading(false);
              dispatch(
                setShowToast({
                  type: AppStrings.ToastType.error,
                  message: getErrorMessage(resp),
                }),
              );
              return false;
            }}
          />

          <View style={{height: normalized(30)}} />
        </ScrollView>
      )}
      {viewerItem && (
        <FileViewer
          visible={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          filename={viewerItem?.documentName ?? ''}
          resolveUrl={() => resolveDocUrl(viewerItem)}
          onPrevious={
            viewerIndex! > 0
              ? () => setViewerIndex(viewerIndex! - 1)
              : undefined
          }
          onNext={
            viewerIndex! < (data?.blob_urls?.length ?? 0) - 1
              ? () => setViewerIndex(viewerIndex! + 1)
              : undefined
          }
        />
      )}
    </View>
  );
};

export default CDRReqDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    forensicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filenameCont: {
      flex: 1,
      alignItems: 'flex-start',
      gap: normalized(4),
    },
    dateCont: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(20),
      marginHorizontal: normalized(50),
    },
    dateHeading: {
      color: colors.Black,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuBold,
    },
    crossTxt: {
      fontSize: normalized(11),
      color: colors.Error,
    },
    otherEvidenceCont: {
      marginTop: normalized(8),
      gap: normalized(4),
    },

    otherEvidenceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
    },

    otherEvidenceTxt: {
      color: colors.Heading_Txt,
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuRegular,
      lineHeight: normalized(20),
      paddingLeft: normalized(30),
    },
    docBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      padding: normalized(12),
      borderRadius: normalized(10),
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    docTapArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(10),
    },
    docIconWrap: {
      width: normalized(30),
      alignItems: 'center',
      justifyContent: 'center',
    },
    docDownloadBtn: {
      width: normalized(36),
      height: normalized(36),
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
