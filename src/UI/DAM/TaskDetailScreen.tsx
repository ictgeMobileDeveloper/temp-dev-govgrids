import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  AppColors,
  AppFonts,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../Utils/AppConstants';
import CustomHeader from '../Components/CustomHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {AppStyles} from '../../Utils/AppStyles';
import {apiHandler} from '../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../Network/Urls';
import {setIsLoader, setShowToast} from '../../Redux/AppReducers';
import {AppStrings} from '../../Utils/AppStrings';
import {
  capitalizeEachWord,
  formatTimeAgo,
  getErrorMessage,
  groupCommentsByDate,
  lightenHexColor,
  useGradualAnimation,
} from '../../Utils/Helper';
import moment from 'moment';
import CustomSwitcher from '../Components/CustomSwitcher';
import CustomRichToolbar from '../Components/CustomRickToolbar';
import {RichEditor} from 'react-native-pell-rich-editor';
import CustomButton from '../Components/CustomButton';
import SimpleButton from '../Components/SimpleButton';
import CommentEditIcon from '../Svg/CommentEditIcon';
import RenderHTML, {
  defaultHTMLElementModels,
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html';
import AppImageViewer from '../Components/AppImageView';
import PdfIcon from '../Svg/PdfIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import WordIcon from '../Svg/WordIcon';
import DownloadIcon from '../Svg/DownloadIcon';
import {handleFileDownload} from '../../Utils/DownloadHelper';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import CustomDocumentPicker from '../Components/CustomDocumentPicker';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import DocumentIcon from '../Svg/DocumentIcon';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

const TaskDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector?.themeColors;
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const userData = selector?.damUserData;
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [listIndex, setListIndex] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentCompLoading, setCommentCompLoading] = useState(false);
  const [comments, setComments] = useState<any>([]);
  const [singleComment, setSingleComment] = useState('');
  const richTextRef = useRef<any>(null);
  const [currentEditComment, setCurrentEditComment] = useState<any>(null);
  const [file, setFile] = useState<any>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileError, setFileError] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const Blob = ReactNativeBlobUtil.polyfill.Blob;
  const fs = ReactNativeBlobUtil.fs;

  const dispatch = useDispatch();
  const ageGroupArray = data?.ageGroup
    ? data.ageGroup
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item: any) => item.trim())
    : [];

  const daysArray = data?.daysOfWeek
    ? data.daysOfWeek
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item: any) => item.trim())
    : [];

  const LIST = [
    {
      id: 1,
      name: 'Artworks',
    },
    {
      id: 2,
      name: 'Comments',
    },
  ];

  const customHTMLElementModels = {
    'font face': HTMLElementModel.fromCustomModel({
      tagName: 'font face',
      contentModel: HTMLContentModel.block,
    }),
  };

  const customRenderers = {
    'font face': () => (
      <View
        style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: 'blue',
          alignSelf: 'center',
          marginVertical: 8,
        }}
      />
    ),
  };

  const {height} = useGradualAnimation();

  const keyboardPaddingBottom = useAnimatedStyle(() => {
    return {
      height: height.value + 40,
    };
  }, []);

  // const loadFileAsBlob = async (uri, type) => {
  //   const base64 = await fs.readFile(uri, 'base64');

  //   const blob = await Blob.build(base64, {type: type + ';BASE64'});

  //   return blob;
  // };

  useEffect(() => {
    fetchReqDetail();
  }, []);

  const fetchReqDetail = () => {
    setIsLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.artworkDetail,
      method: 'GET',
      queryParams: {id: props?.route?.params?.item?.id},
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          setData(resp?.data?.data);
          fetchComments(resp?.data?.data?.id);
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

  const fetchComments = (id?: any) => {
    setCommentCompLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.taskComments,
      method: 'GET',
      queryParams: {id: data?.id ?? id},
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          const data = groupCommentsByDate(resp?.data?.data);
          setComments(data);
          setCommentCompLoading(false);
        } else {
          setCommentCompLoading(false);
        }
      },
    });
  };

  const onComment = () => {
    if (singleComment == '') return;
    const params = {
      id: data?.id,
      comment: singleComment,
      isPrivate: false,
    };
    setCommentLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.createTaskComment,
      method: 'POST',
      queryParams: {id: data?.id},
      payload: params,
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          fetchComments();
          richTextRef.current?.setContentHTML('');
          setCommentLoading(false);
          setSingleComment('');
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Comment Successfully Posted',
            }),
          );
        } else {
          setCommentLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: resp.message,
            }),
          );
        }
      },
    });
  };

  const onUpdateComment = () => {
    setCommentLoading(true);
    apiHandler({
      endpoint: ENDPOINTS.updateTaskComment,
      method: 'PATCH',
      queryParams: {id: currentEditComment?.id},
      payload: {
        comment: singleComment,
        id: data?.id,
        isPrivate: false,
      },
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          richTextRef.current?.setContentHTML('');
          setSingleComment('');
          setCurrentEditComment(null);
          fetchComments();
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.success,
              message: 'Comment Updated',
            }),
          );
          setCommentLoading(false);
        } else {
          setCommentLoading(false);
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

  const generateUrl = (obj: any) => {
    console.log('obj 00-=----   ', obj);

    dispatch(setIsLoader(true));
    apiHandler({
      endpoint: ENDPOINTS.damSignedUrl,
      method: 'GET',
      queryParams: {
        requestId: obj?.requestId,
        documentId: obj?.documentId,
      },
      authContext: 'DAM',
      onComplete: (resp: any) => {
        if (resp?.status) {
          dispatch(setIsLoader(false));
          onDownload({
            url: resp?.data?.signedURL,
            name: obj?.filename,
            isCompleteUrl: true,
          });
        } else {
          dispatch(setIsLoader(false));
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

  const onDownload = async (attachments: any) => {
    await handleFileDownload(attachments, userData, dispatch);
  };

  useEffect(() => {
    setUploadLoading(false);
  }, []);

  const readFileAsBase64 = async (fileUri: any) => {
    return await RNFS.readFile(fileUri, 'base64');
  };

  const chunkString = (base64Data: any, chunkSize = 1024 * 100) => {
    const chunks = [];
    let offset = 0;

    while (offset < base64Data.length) {
      chunks.push(base64Data.slice(offset, offset + chunkSize));
      offset += chunkSize;
    }

    return chunks;
  };

  async function uploadFileInChunks() {
    try {
      setUploadLoading(true);

      const base64 = await readFileAsBase64(file.uri);
      const chunks = chunkString(base64);

      for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData();

        formData.append('chunk', {
          uri: `data:${file.type};base64,${chunks[i]}`,
          type: file.type,
          name: file.name,
        } as any);

        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', chunks.length.toString());
        formData.append('fileName', file.name);
        formData.append('id', data?.id);

        // ⏳ wait for each chunk upload
        const response = await new Promise<any>((resolve, reject) => {
          apiHandler({
            endpoint: ENDPOINTS.uploadArtworkFile,
            method: 'POST',
            isFormData: true,
            payload: formData,
            authContext: 'DAM',
            onComplete: (resp: any) => {
              if (resp?.status) {
                resolve(resp);
              } else {
                reject(resp);
              }
            },
          });
        });

        console.log(`Chunk ${i + 1}/${chunks.length} uploaded`);
      }

      // ✅ ALL chunks uploaded successfully
      fetchReqDetail();

      dispatch(
        setShowToast({
          type: AppStrings.ToastType.success,
          message: 'File uploaded successfully.',
        }),
      );
    } catch (error: any) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: getErrorMessage(error),
        }),
      );
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insects.top - normalized(Platform.OS == 'ios' ? 15 : 0),
          paddingBottom: Platform.OS === 'android' ? insects.bottom : 0,
        },
      ]}>
      <StatusBar
        barStyle={selector?.isDarkTheme ? 'light-content' : 'dark-content'}
      />

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={'Task Detail'}
      />

      {isLoading ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} size={'large'} />
        </View>
      ) : (
        <KeyboardAwareScrollView
          contentContainerStyle={{
            marginHorizontal: normalized(20),
            paddingBottom: normalized(20),
          }}
          showsVerticalScrollIndicator={false}>
          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.txt}>Artwork Details</Text>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Title</Text>
                <Text style={styles.valueTxt}>{data?.title}</Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Due Date</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.dueDate)?.format('LL')}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Assignee Type</Text>
                <Text style={styles.valueTxt}>
                  {capitalizeEachWord(data?.assigneeType)}
                </Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>Priority Level</Text>
                <Text style={styles.valueTxt}>
                  {capitalizeEachWord(data?.priorityLevel)}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Approver</Text>
                <Text style={styles.valueTxt}>
                  {`${data?.approver?.firstName} ${data?.approver?.lastName} (${data?.approver?.email})`}
                </Text>
              </View>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Artwork Type</Text>
                <Text style={styles.valueTxt}>{data?.artWorkType?.title}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Vendor</Text>

                <Text style={styles.valueTxt}>
                  {`${data?.vendor?.firstName} ${data?.vendor?.lastName} (${data?.vendor?.email})`}
                </Text>
              </View>
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>Description</Text>
              <Text style={styles.valueTxt}>{data?.description}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>Event</Text>
              <Text
                style={[
                  styles.valueTxt,
                  {textAlign: 'justify'},
                ]}>{`${data?.event?.title} - ${data?.event?.description}`}</Text>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.txt}>Requested Requirements</Text>

            {data?.requirements?.length > 0 ? (
              data?.requirements.map((item: any, index: number) => {
                const type = item?.filename?.split('.').pop();
                return (
                  <View
                    key={index}
                    style={[styles.docBlock, {marginTop: normalized(8)}]}>
                    {type == 'pdf' ? (
                      <PdfIcon />
                    ) : type == 'xls' ? (
                      <ExcelIcon />
                    ) : type == 'doc' || type == 'docx' ? (
                      <WordIcon />
                    ) : (
                      <DocumentIcon
                        width={30}
                        height={30}
                        primary={colors.Desc_Txt}
                      />
                    )}
                    <View style={styles.filenameCont}>
                      <Text style={styles.nameTxt}>{item?.fileName}</Text>
                      {/* <Text>{item?.fileName}</Text> */}
                    </View>
                    <TouchableOpacity
                      activeOpacity={1}
                      onPress={() => {
                        generateUrl({
                          requestId: data?.id,
                          documentId: item?.id,
                          filename: item?.fileName,
                        });
                      }}>
                      <DownloadIcon width={40} height={40} />
                    </TouchableOpacity>
                  </View>
                );
              })
            ) : (
              <Text style={styles.valueTxt}>No requirements Attached.</Text>
            )}
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.txt}>Activity Details</Text>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Age Group</Text>
              <View style={styles.groupCont}>
                {ageGroupArray?.length > 0 ? (
                  ageGroupArray.map((item: any) => (
                    <Text style={styles.groupTxt}>
                      {capitalizeEachWord(item)}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.valueTxt}>N/A</Text>
                )}
              </View>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Days of Week</Text>
              <View style={styles.groupCont}>
                {daysArray?.length > 0 ? (
                  daysArray.map((item: any) => (
                    <Text style={styles.groupTxt}>
                      {capitalizeEachWord(item)}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.valueTxt}>N/A</Text>
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Number of Sessions</Text>
                <Text style={styles.valueTxt}>{data?.numberOfSessions}</Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>Activity Time</Text>
                <Text style={styles.valueTxt}>{data?.activityTime}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Location</Text>
                <Text style={styles.valueTxt}>{data?.location}</Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>{'Fees ($)'}</Text>
                <Text style={styles.valueTxt}>{data?.fees}</Text>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Registration Deadline</Text>
                <Text style={styles.valueTxt}>
                  {moment(data?.registrationDeadline)?.format('LL')}
                </Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>Contact Person</Text>
                <Text style={styles.valueTxt}>{data?.contactPerson}</Text>
              </View>
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>Division</Text>
              <Text style={styles.valueTxt}>{data?.division}</Text>
            </View>

            <View style={styles.item}>
              <Text style={styles.keyTxt}>Special Note</Text>
              <Text style={styles.valueTxt}>{data?.specialNote}</Text>
            </View>
          </View>

          <View style={{height: normalized(12)}} />

          <View style={styles.itemCont}>
            <Text style={styles.txt}>Requester Details</Text>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Name</Text>
              <Text style={styles.valueTxt}>
                {`${data?.requester?.firstName} ${data?.requester?.lastName}`}
              </Text>
            </View>
            <View style={styles.item}>
              <Text style={styles.keyTxt}>Email</Text>
              <Text style={styles.valueTxt}>{data?.requester.email}</Text>
            </View>
          </View>

          {data?.attachments?.length == 0 && (
            <View style={{height: normalized(12)}} />
          )}

          {data?.attachments?.length == 0 && (
            <View style={styles.itemCont}>
              <Text style={styles.txt}>Upload Artwork</Text>

              <CustomDocumentPicker
                uploading={uploading}
                progress={progress}
                type="image"
                limit={1}
                onSelect={(obj: any) => {
                  const data = obj[0];
                  if (!data) return;

                  const fileType = data.type;
                  const fileName = data.filename?.toLowerCase() || '';

                  const isImage =
                    fileType?.startsWith('image/') ||
                    fileName.endsWith('.jpg') ||
                    fileName.endsWith('.jpeg') ||
                    fileName.endsWith('.png') ||
                    fileName.endsWith('.heic') ||
                    fileName.endsWith('.webp');

                  if (!isImage) {
                    setFileError(true);
                    setFile(null);
                    dispatch(
                      setShowToast({
                        type: AppStrings.ToastType.error,
                        message: 'Only image files are allowed.',
                      }),
                    );
                    return;
                  }

                  setFileError(false);

                  setFile({
                    uri: data?.uri,
                    type: data?.type,
                    name: data?.filename,
                    size: data?.size,
                  });
                }}
                isError={fileError}
              />

              {!fileError && file && (
                <CustomButton
                  style={styles.btn}
                  text={'Upload'}
                  loading={uploadLoading}
                  onPress={() => {
                    uploadFileInChunks();
                  }}
                />
              )}
            </View>
          )}

          <CustomSwitcher
            list={LIST}
            selectedIndex={listIndex}
            onChange={i => setListIndex(i)}
          />

          {listIndex ? (
            <>
              {comments?.map(([date, commentList]: any, dateIndex: any) => {
                return (
                  <View key={dateIndex}>
                    <View style={styles.dateCont}></View>
                    {commentList?.map((item: any, index: any) => {
                      const isVendor = item?.vendor?.id;
                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.commentListCont,
                            {flexDirection: isVendor ? 'row-reverse' : 'row'},
                          ]}>
                          {item?.vendor?.profilePicture ||
                          item?.cusUser?.profilePicture ||
                          selector?.baseData?.logo ? (
                            <TouchableOpacity
                              activeOpacity={1}
                              onPress={() => {}}
                              style={styles.commProfileImgCont}>
                              <AppImageViewer
                                style={styles.commProfileImg}
                                source={{
                                  uri: isVendor
                                    ? `${Base_Url}${item.vendor?.profilePicture}`
                                    : `${Base_Url}${
                                        item?.cusUser?.profilePicture ??
                                        selector?.baseData?.logo
                                      }`,
                                }}
                              />
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.avatarCont}>
                              <Text style={styles.avatarTxt}>
                                {isVendor
                                  ? item?.vendor?.firstName[0]
                                  : item?.cusUser?.firstName[0]}
                              </Text>
                            </View>
                          )}
                          <View
                            style={[
                              styles.commentRow,
                              {
                                backgroundColor:
                                  currentEditComment?.id == item?.id
                                    ? lightenHexColor(colors.Primary, 0.8)
                                    : colors.Grey_bg,
                              },
                            ]}>
                            <View style={styles.contentCont}>
                              <View style={styles.nameRow}>
                                <Text style={styles.commentName}>{`${
                                  isVendor
                                    ? item?.vendor?.firstName
                                    : item?.cusUser?.firstName
                                } ${
                                  isVendor
                                    ? item?.vendor?.lastName
                                    : item?.cusUser?.lastName
                                }`}</Text>
                                <Text style={styles.timeTxt}>
                                  {formatTimeAgo(item?.commentAt)}
                                </Text>
                              </View>
                              <RenderHTML
                                contentWidth={ScreenSize.width - normalized(60)}
                                source={{
                                  html: item?.comment,
                                }}
                                tagsStyles={{
                                  body: {color: '#000'},
                                  div: {color: '#000'},
                                  span: {color: '#000'},
                                  p: {
                                    marginBottom: 12,
                                  },
                                  b: {fontWeight: 'bold'},
                                  strong: {fontWeight: 'bold'},
                                  i: {fontStyle: 'italic'},
                                  em: {fontStyle: 'italic'},
                                  u: {textDecorationLine: 'underline'},
                                  a: {
                                    color: '#000',
                                    textDecorationLine: 'underline',
                                  },
                                }}
                                customHTMLElementModels={{
                                  ...defaultHTMLElementModels,
                                  ...customHTMLElementModels,
                                }}
                                renderers={customRenderers}
                                enableCSSInlineProcessing={true}
                              />
                              {isVendor && !item?.isEdited && (
                                <TouchableOpacity
                                  activeOpacity={0.8}
                                  onPress={() => {
                                    setSingleComment(item?.comment);
                                    richTextRef?.current?.setContentHTML(
                                      item?.comment,
                                    );
                                    setCurrentEditComment(item);
                                  }}
                                  style={styles.editCont}>
                                  <CommentEditIcon />
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                    <View
                      style={[styles.line, {marginBottom: normalized(10)}]}
                    />
                  </View>
                );
              })}
              <CustomRichToolbar editor={richTextRef} />
              <View style={styles.commentCont}>
                <RichEditor
                  ref={richTextRef}
                  onChange={descriptionText => {
                    setSingleComment(descriptionText);
                  }}
                  placeholder="Enter your Comment"
                  initialHeight={normalized(280)}
                  editorStyle={{
                    backgroundColor: colors.Background,
                    color: colors.Heading_Txt,
                    placeholderColor: colors.Desc_Txt,
                    contentCSSText: `
      body {
        color: ${colors.Heading_Txt};
        background-color: ${colors.Background};
      }
      div, p, span {
        color: ${colors.Heading_Txt};
      }
    `,
                  }}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: normalized(12),
                  alignSelf: 'flex-end',
                }}>
                {currentEditComment && (
                  <View style={{width: normalized(80)}}>
                    <SimpleButton
                      text={'Cancel'}
                      onPress={() => {
                        setCurrentEditComment(null);
                        setSingleComment('');
                        richTextRef?.current?.setContentHTML('');
                      }}
                      loading={false}
                    />
                  </View>
                )}
                <View style={styles.nextBtnCont}>
                  <CustomButton
                    text={
                      currentEditComment?.id ? 'Update Comment' : 'Add Comment'
                    }
                    onPress={() => {
                      currentEditComment?.id ? onUpdateComment() : onComment();
                    }}
                    loading={commentLoading}
                  />
                </View>
              </View>
            </>
          ) : data?.attachments?.length > 0 ? (
            data?.attachments?.map((item: any) => {
              return (
                <View style={styles.itemCont}>
                  <View style={styles.row}>
                    <Text style={styles.keyTxt}>Version</Text>
                    <Text style={styles.valueTxt}>{`  V${item?.version}`}</Text>
                  </View>

                  <Text style={styles.keyTxt}>Artwork</Text>
                  <Text style={styles.valueTxt}>{item?.fileName}</Text>

                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.btn}
                    onPress={() => {
                      generateUrl({
                        requestId: data?.id,
                        documentId: item?.id,
                        filename: item?.fileName,
                      });
                    }}>
                    <Text style={styles.btnTxt}>Download</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          ) : (
            <View style={styles.itemCont}>
              <Text style={styles.artworkTxt}>No Artwork has be uploaded.</Text>
            </View>
          )}
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

export default TaskDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txt: {
      fontFamily: AppFonts.UbuntuSemiBold,
      fontSize: normalized(16),
      color: colors.Heading_Txt,
      flex: 1,
      alignSelf: 'center',
    },
    groupCont: {
      flexDirection: 'row',
      gap: normalized(8),
      flexWrap: 'wrap',
      marginTop: normalized(8),
    },
    groupTxt: {
      backgroundColor: AppColors.Grey_bg,
      fontFamily: AppFonts.UbuntuRegular,
      color: AppColors.Black,
      borderRadius: normalized(100),
      paddingHorizontal: normalized(8),
      paddingVertical: normalized(3),
    },
    commentCont: {
      height: normalized(280),
      borderWidth: 1,
      borderRadius: normalized(8),
      overflow: 'hidden',
      borderColor: colors.BorderColor,
      marginTop: normalized(10),
    },
    commentListCont: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: normalized(10),
      marginBottom: normalized(10),
    },
    nextBtnCont: {
      width: normalized(150),
      alignSelf: 'flex-end',
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
    editImg: {
      width: normalized(20),
      height: normalized(20),
      resizeMode: 'contain',
      tintColor: colors.Black,
    },
    editCont: {
      alignSelf: 'flex-end',
    },
    commentRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(8),
      backgroundColor: colors.Grey_bg,
      padding: normalized(7),
      borderRadius: normalized(6),
    },
    commentName: {
      color: colors.Black,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuMedium,
    },
    avatarCont: {
      width: normalized(40),
      height: normalized(40),
      backgroundColor: colors.Primary,
      borderRadius: normalized(10),
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    commProfileImgCont: {
      width: normalized(40),
      height: normalized(40),
      borderRadius: normalized(10),
      overflow: 'hidden',
    },
    commProfileImg: {
      width: normalized(40),
      height: normalized(40),
      borderRadius: normalized(10),
      overflow: 'hidden',
      resizeMode: 'cover',
    },
    avatarTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.White,
    },
    contentCont: {
      flex: 1,
    },
    nameRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    line: {
      flex: 1,
      backgroundColor: colors.Grey_2,
      height: normalized(1),
    },
    timeTxt: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },
    docBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(10),
      padding: normalized(10),
      borderRadius: normalized(8),
      borderColor: colors.BorderColor,
      borderWidth: 1,
    },
    filenameCont: {
      flex: 1,
      alignItems: 'flex-start',
      gap: normalized(4),
    },
    btn: {
      backgroundColor: colors.Primary,
      flex: 1,
      height: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(8),
    },
    btnTxt: {
      color: colors.White,
      fontSize: normalized(13),
      fontFamily: AppFonts.UbuntuSemiBold,
    },
    artworkTxt: {
      fontSize: normalized(15),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuMedium,
      marginVertical: normalized(15),
    },
  });
