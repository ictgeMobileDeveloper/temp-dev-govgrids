import {
  ActivityIndicator,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  View,
} from 'react-native';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import {AppRootStore} from '../../../Redux/AppStore';
import {AppStyles} from '../../../Utils/AppStyles';
import CustomHeader from '../../Components/CustomHeader';
import {
  AppFonts,
  AppHorizontalMargin,
  getApprovalCircleColor,
  getHelpDeskExtraDetailFields,
  HelpDesk_Switcher_list,
  normalized,
  ScreenProps,
  ScreenSize,
} from '../../../Utils/AppConstants';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';
import moment from 'moment';
import {
  capitalizeEachWord,
  formatTimeAgo,
  getErrorMessage,
  getStatusColor,
  lightenHexColor,
  removeHtmlTags,
  truncateFileName,
} from '../../../Utils/Helper';
import AppImageViewer from '../../Components/AppImageView';
import {handleFileDownload} from '../../../Utils/DownloadHelper';

import CustomButton from '../../Components/CustomButton';
import CustomRichToolbar from '../../Components/CustomRickToolbar';
import {RichEditor} from 'react-native-pell-rich-editor';
import SimpleButton from '../../Components/SimpleButton';
import {apiHandler} from '../../../Network/Services/ApiHandler';
import {Base_Url, ENDPOINTS} from '../../../Network/Urls';
import {setShowToast} from '../../../Redux/AppReducers';
import {AppStrings, Empty_Screen_Type} from '../../../Utils/AppStrings';
import CommentEditIcon from '../../Svg/CommentEditIcon';
import RenderHTML, {
  defaultHTMLElementModels,
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html';
import CustomDocumentPicker from '../../Components/CustomDocumentPicker';
import {HELP_DESK_LIST_ACTIONS} from '../Components/HelpDeskActions';
import ApprovalIcon from '../../Svg/ApprovalIcon';
import ApprovalPlusIcon from '../../Svg/ApprovalPlus';
import PlusIcon from '../../Svg/PlusIcon';
import TickIcon from '../../Svg/TickIcon';
import CloseIcon from '../../Svg/CloseIcon';
import {useIsFocused} from '@react-navigation/native';
import PdfIcon from '../../Svg/PdfIcon';
import {
  AUDIO_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../../ResidentIssuePortal/Components/FileListing';
import ImageIcon from '../../Svg/ImageIcon';
import PlayIcon from '../../Svg/VideoSVG';
import AudioIcon from '../../Svg/AudioIcon';
import WordIcon from '../../Svg/WordIcon';
import MailVector from '../../Svg/MailVector';
import ExcelIcon from '../../Svg/ExcelIcon';
import DocumentIcon from '../../Svg/DocumentIcon';
import FileViewer from '../../Components/MediaPreviewModal';
import {Routes} from '../../../Utils/Routes';
import {useSignedDocResolver} from '../../../Hooks/getSignedUrl';
import EmptyComp from '../../Components/EmptyComp';
import CustomSwitcher from '../../Components/CustomSwitcher';
import DownloadIcon from '../../Svg/DownloadIcon';
import ForwardArrowIcon from '../../Svg/ForwardArrowIcon';

const TicketDetailScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );
  const styles = useMemo(
    () => ({...makeStyles(colors), ...AppStyles(colors)}),
    [colors],
  );
  const selector: any = useSelector(
    (state: AppRootStore) => state.SliceReducer,
  );
  const dispatch = useDispatch();
  const routeItem = props?.route?.params?.item;
  // const approvalItem = props?.route?.params?.approvalItem;
  const actionKey = props?.route?.params?.actionKey;
  const resourceType = props?.route?.params?.type ?? 'ticket';

  const richTextRef = useRef<any>(null);
  const [singleComment, setSingleComment] = useState('');
  const [pageLoading, setPageLoading] = useState(false);
  const [details, setDetails] = useState<any>(routeItem ?? null);
  const [actionLoading, setActionLoading] = useState(false);
  const [commentFiles, setCommentFiles] = useState<any[]>([]);

  const [commentPickerKey, setCommentPickerKey] = useState(0);
  const [currentEditComment, setCurrentEditComment] = useState<any>(null);
  const scrollRef = useRef<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [listIndex, setListIndex] = useState(0);

  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [viewerItem, setViewerItem] = useState<any>(null);
  const [viewerSource, setViewerSource] = useState<'ticket' | 'comment' | null>(
    null,
  );

  const actionConfig =
    HELP_DESK_LIST_ACTIONS[actionKey] ??
    Object.values(HELP_DESK_LIST_ACTIONS).find(
      (item: any) => item?.detailKey === resourceType,
    ) ??
    HELP_DESK_LIST_ACTIONS.myTickets;

  const resourceId = props?.route?.params?.id || routeItem?.id;

  const detailIdValue =
    resourceType === 'change'
      ? details?.changeId || (details?.id ? `CH#${details.id}` : 'N/A')
      : resourceType === 'problem'
      ? details?.problemId || (details?.id ? `PR#${details.id}` : 'N/A')
      : details?.ticketId || 'N/A';

  const {resolveDocUrl: resolveTicketAttachmentUrl} = useSignedDocResolver(
    {
      [resourceType === 'change'
        ? 'changeId'
        : resourceType === 'problem'
        ? 'problemId'
        : 'ticketId']: details?.id,
    },
    'HELPDESK',
    ENDPOINTS.helpDeskAttachmentSignedUrl,
    '',
  );

  const {resolveDocUrl: resolveCommentAttachmentUrl} = useSignedDocResolver(
    {attachmentId: viewerItem?.id},
    'HELPDESK',
    ENDPOINTS.helpDeskCommentSignedUrl,
    '',
    'POST',
  );
  const hasApprovals = (details?.approvals?.length ?? 0) > 0;
  const switcherList = hasApprovals
    ? HelpDesk_Switcher_list
    : HelpDesk_Switcher_list.filter(({id}) => id !== 1);

  const detailIdLabel =
    resourceType === 'change'
      ? 'Change ID'
      : resourceType === 'problem'
      ? 'Problem ID'
      : 'Ticket ID';

  const getCommentResourceKey = () => {
    if (resourceType === 'change') {
      return 'changeId';
    }

    if (resourceType === 'problem') {
      return 'problemId';
    }

    return 'ticketId';
  };

  const isClosed = String(details?.status || '').toLowerCase() === 'closed';
  console.log('selector0 ID', selector?.helpDeskUserData?.id);
  const isTicket = resourceType === 'ticket';

  const canShowReopenTicket =
    isTicket && isClosed && details?.canReopenTicket === true;

  const getApprovalUpdateEndpoint = () => {
    if (resourceType === 'change') {
      return ENDPOINTS.helpDeskChangeApprovalUpdate;
    }

    if (resourceType === 'problem') {
      return ENDPOINTS.helpDeskProblemApprovalUpdate;
    }

    return ENDPOINTS.helpDeskTicketApprovalUpdate;
  };

  const onReopenTicket = () => {
    if (actionLoading) return;

    setActionLoading(true);

    apiHandler({
      endpoint: ENDPOINTS.ticketReOpen,
      method: 'POST',
      authContext: 'HELPDESK',
      payload: {
        ticketId: details?.id || resourceId,
      },
      onComplete: (resp: any) => {
        if (resp?.status) {
          fetchTicketDetail(() => {
            setActionLoading(false);

            dispatch(
              setShowToast({
                type: AppStrings.ToastType.success,
                message: resp?.message || 'Ticket reopened successfully',
              }),
            );
          });
        } else {
          setActionLoading(false);

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

  const onUpdateApprovalStatus = (
    approvalId: number,
    status: 'approved' | 'disapproved',
  ) => {
    if (actionLoading) return;

    setActionLoading(true);

    apiHandler({
      endpoint: getApprovalUpdateEndpoint(),
      method: 'POST',
      authContext: 'HELPDESK',
      payload: {
        approvalId,
        status,
      },
      onComplete: (resp: any) => {
        console.log('Approval status update response --->', resp);

        if (resp?.status) {
          fetchTicketDetail(() => {
            setActionLoading(false);

            dispatch(
              setShowToast({
                type: AppStrings.ToastType.success,
                message: resp?.message || 'Approval updated successfully',
              }),
            );
          });
        } else {
          setActionLoading(false);

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

  const extraDetailFields = getHelpDeskExtraDetailFields(resourceType, details);
  const onRefresh = () => {
    fetchTicketDetail(undefined, true);
  };

  const fetchTicketDetail = (callback?: () => void, isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true); // NEW
    } else {
      setPageLoading(true);
    }
    apiHandler({
      endpoint: actionConfig.detailEndpoint,
      method: 'GET',
      authContext: 'HELPDESK',
      queryParams: {
        id: resourceId,
      },
      onComplete: (resp: any) => {
        console.log(' Ticket Detail Response of data', resp);
        setPageLoading(false);
        setRefreshing(false);
        if (resp?.status) {
          console.log('HelpDesk Details', resp);
          setDetails(resp?.data?.data);
        } else {
          setPageLoading(false);
          dispatch(
            setShowToast({
              type: AppStrings.ToastType.error,
              message: getErrorMessage(resp),
            }),
          );
        }
        callback?.();
      },
    });
  };
  const isFocused = useIsFocused();
  useEffect(() => {
    fetchTicketDetail();
  }, [isFocused, props?.route?.params?.refreshedAt]);
  useEffect(() => {
    if (!hasApprovals && listIndex === 0) setListIndex(0);
  }, [hasApprovals]);

  const resetCommentEditor = () => {
    setCurrentEditComment(null);
    setSingleComment('');
    setCommentFiles([]);
    setCommentPickerKey(prev => prev + 1);
    richTextRef.current?.setContentHTML('');
  };
  const submitComment = () => {
    if (actionLoading) return;

    const isEdit = Boolean(currentEditComment?.id);

    const htmlComment = String(singleComment || '').trim();
    const plainComment = removeHtmlTags(htmlComment);

    if (!plainComment) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Comment is Required',
        }),
      );
      return;
    }

    const validFiles = (commentFiles || []).filter((file: any) =>
      Boolean(String(file?.uri ?? '').trim()),
    );

    if (!plainComment && !validFiles.length && !isEdit) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Please attach valid files.',
        }),
      );
      return;
    }

    const formData = new FormData();
    formData.append(getCommentResourceKey(), String(details?.id || resourceId));
    formData.append('comment', plainComment ? htmlComment : ' ');
    formData.append('isPrivate', 'false');

    validFiles.forEach((file: any, index: number) => {
      const rawUri = String(file?.uri ?? '');

      const normalizedUri =
        Platform.OS === 'ios' && !rawUri.startsWith('file://')
          ? `file://${rawUri}`
          : rawUri;

      formData.append(`files[${index}]`, {
        uri: normalizedUri,
        type: file?.type || 'application/octet-stream',
        name: file?.filename || file?.name || `attachment-${index}`,
      } as any);
    });
    setActionLoading(true);

    if (isEdit) {
      formData.append('commentId', String(currentEditComment?.id));
    }

    apiHandler({
      endpoint: `${ENDPOINTS.helpDeskComment}${isEdit ? 'edit/' : 'create/'}`,
      method: 'POST',
      authContext: 'HELPDESK',
      payload: formData,
      isFormData: true,
      onComplete: (resp: any) => {
        console.log(
          isEdit
            ? 'Update HelpDesk comment response --->'
            : 'Create HelpDesk comment response --->',
          resp,
        );

        if (resp?.status) {
          resetCommentEditor();

          fetchTicketDetail(() => {
            setActionLoading(false);
            dispatch(
              setShowToast({
                type: AppStrings.ToastType.success,
                message: isEdit
                  ? 'Comment Updated'
                  : 'Comment Successfully Posted',
              }),
            );
          });
        } else {
          setActionLoading(false);

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

  const onViewTicketAttachment = (index: number) => {
    setViewerIndex(index);
    setViewerItem(details?.attachments?.[index]);
    setViewerSource('ticket');
  };

  const onViewCommentAttachment = (attachment: any) => {
    setViewerIndex(null);
    setViewerItem(attachment);
    setViewerSource('comment');
  };

  const closeViewer = () => {
    setViewerIndex(null);
    setViewerItem(null);
    setViewerSource(null);
  };

  const onDownloadAttachment = async (item: any) => {
    const filePath = item?.filePath;

    if (!filePath) {
      dispatch(
        setShowToast({
          type: AppStrings.ToastType.error,
          message: 'Invalid attachment.',
        }),
      );
      return;
    }

    const finalUrl = String(filePath).startsWith('http')
      ? filePath
      : `${Base_Url}${String(filePath).startsWith('/') ? '' : '/'}${filePath}`;

    await handleFileDownload(
      {
        url: finalUrl.replace(/#/g, '%23'),
        name: item?.documentName ?? 'N/A',
        isCompleteUrl: true,
      },
      selector?.helpDeskUserData,
      dispatch,
    );
  };

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

      <CustomHeader
        onBackPress={() => props?.navigation?.goBack()}
        text={actionConfig?.detailTitle ?? 'Ticket Detail'}
      />

      {pageLoading && !details?.title ? (
        <View style={styles.loaderCont}>
          <ActivityIndicator color={colors.Primary} />
        </View>
      ) : (
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollView}
          ref={scrollRef}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.Primary]}
              tintColor={colors.Primary}
            />
          }>
          {canShowReopenTicket ? (
            <CustomButton
              text={'Flag Raising Request'}
              onPress={onReopenTicket}
              RightIcon={ForwardArrowIcon}
              loading={actionLoading}
            />
          ) : null}

          <View style={styles.itemCont}>
            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>{detailIdLabel}</Text>
                <Text style={styles.valueTxt}>{detailIdValue}</Text>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>Created At</Text>
                <Text style={styles.valueTxt}>
                  {details?.createdAt
                    ? moment(details?.createdAt).format('LL')
                    : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Title</Text>
                <Text style={styles.valueTxt}>{details?.title ?? '--'}</Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Status</Text>
                <View style={{maxWidth: normalized(170)}}>
                  <View
                    style={[
                      styles.statusCont,
                      {
                        backgroundColor: getStatusColor(
                          details?.status,
                          colors,
                        ),
                      },
                    ]}>
                    <Text style={styles.statusTxt}>
                      {capitalizeEachWord(details?.status ?? 'N/A')}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.item}>
                <Text style={styles.keyTxt}>Due Date</Text>
                <Text style={styles.valueTxt}>
                  {details?.dueDate
                    ? moment(details?.dueDate).format('LL')
                    : 'Never'}
                </Text>
              </View>
            </View>

            <View style={styles.rowCont}>
              {details?.technician ? (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Technician</Text>
                  <Text style={styles.valueTxt}>
                    {`${details?.technician?.firstName ?? ''} ${
                      details?.technician?.lastName ?? ''
                    }`.trim()}
                  </Text>
                </View>
              ) : null}

              {details?.requester?.email ? (
                <View style={styles.item}>
                  <Text style={styles.keyTxt}>Resident Email</Text>
                  <Text style={styles.valueTxt}>{details.requester.email}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.rowCont}></View>

            {details?.description ? (
              <View style={styles.item}>
                <Text style={styles.keyTxt}>Description</Text>

                <RenderHTML
                  contentWidth={ScreenSize.width - normalized(60)}
                  source={{
                    html: `
      <div class="description-wrapper">
        ${details?.description}
      </div>
    `,
                  }}
                  tagsStyles={{
                    body: {
                      color: colors.Heading_Txt,
                      margin: 0,
                      padding: 0,
                      backgroundColor: colors.Background,
                    },
                    div: {
                      color: colors.Heading_Txt,
                    },
                    span: {
                      color: colors.Heading_Txt,
                    },
                    p: {
                      color: colors.Heading_Txt,
                      marginBottom: 12,
                    },
                    img: {
                      backgroundColor: '#FFFFFF',
                      padding: normalized(8),
                      borderRadius: normalized(6),
                    },
                    b: {
                      fontWeight: 'bold',
                    },
                    strong: {
                      fontWeight: 'bold',
                    },
                    i: {
                      fontStyle: 'italic',
                    },
                    em: {
                      fontStyle: 'italic',
                    },
                    u: {
                      textDecorationLine: 'underline',
                    },
                    a: {
                      color: colors.Primary,
                      textDecorationLine: 'underline',
                    },
                  }}
                  classesStyles={{
                    'description-wrapper': {
                      backgroundColor: colors.Background,
                      color: colors.Heading_Txt,
                    },
                    'service-description-banner': {
                      backgroundColor: selector?.isDarkTheme
                        ? colors.ScreenBackground
                        : '#F5F5F5',
                      borderLeftWidth: normalized(3),
                      borderLeftColor: colors.Primary,
                      paddingVertical: normalized(10),
                      paddingHorizontal: normalized(12),
                      borderRadius: normalized(5),
                      marginBottom: normalized(14),
                      color: colors.Primary,
                    },
                    'service-description-row': {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.BorderColor,
                      paddingVertical: normalized(10),
                      paddingHorizontal: normalized(10),
                    },
                    'service-description-label': {
                      color: colors.Desc_Txt,
                      fontWeight: '500',
                    },
                    'service-description-value': {
                      color: colors.Heading_Txt,
                    },
                  }}
                  customHTMLElementModels={{
                    ...defaultHTMLElementModels,
                    ...customHTMLElementModels,
                  }}
                  renderers={customRenderers}
                  enableCSSInlineProcessing={true}
                />
              </View>
            ) : null}
            {extraDetailFields.length > 0
              ? extraDetailFields
                  .filter(field => Boolean(String(field?.value ?? '').trim()))
                  .map(field => (
                    <View key={field.label} style={styles.item}>
                      <Text style={styles.keyTxt}>{field.label}</Text>
                      <Text style={styles.valueTxt}>{field.value}</Text>
                    </View>
                  ))
              : null}
          </View>

          <View style={styles.itemCont}>
            <View style={[styles.rowCont, {alignItems: 'center'}]}>
              <Text style={[styles.Heading1]}>Attachments</Text>
            </View>
            {details?.attachments
              ?.slice(0, 3)
              .map((item: any, index: number) => {
                const type = item?.documentName?.split('.').pop();
                return (
                  <View
                    key={index}
                    style={[styles.docBlock, {marginTop: normalized(8)}]}>
                    <TouchableOpacity
                      style={styles.docTapArea}
                      onPress={() => onViewTicketAttachment(index)}>
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
                        <Text style={styles.nameTxt}>{item?.documentName}</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}
            {details?.attachments?.length > 3 ? (
              <CustomButton
                text={`See All (${details?.attachments?.length})`}
                onPress={() =>
                  props.navigation.navigate(Routes.DocumentListScreen, {
                    navigation: 'HELPDESK',
                    urls: details?.attachments,
                    payload: {
                      [resourceType === 'change'
                        ? 'changeId'
                        : resourceType === 'problem'
                        ? 'problemId'
                        : 'ticketId']: details?.id,
                    },
                    singleSignedURL: `/api/helpDesk/v1/${resourceType}/generateSignedURL/`,
                    AllSignedURL: '',
                  })
                }
              />
            ) : (
              details?.attachments?.length === 0 && (
                <Text style={styles.keyTxt}>No attachments found.</Text>
              )
            )}
          </View>
          {hasApprovals && (
            <CustomSwitcher
              list={switcherList}
              selectedIndex={listIndex}
              onChange={i => setListIndex(i)}
            />
          )}
          {switcherList[listIndex]?.id === 1 ? (
            details?.approvals?.length > 0 ? (
              <View style={styles.itemCont}>
                <View style={styles.approvalHeaderRow}>
                  <Text style={[styles.Heading1, {alignSelf: 'flex-start'}]}>
                    Ticket Approvals
                  </Text>
                </View>

                {details?.approvals?.map((approval: any, index: number) => {
                  const approverName = approval?.approver
                    ? `${approval?.approver?.firstName ?? ''} ${
                        approval?.approver?.lastName ?? ''
                      }`.trim()
                    : '--';
                  const statusType = approval?.status?.toLowerCase?.();
                  const isApproved = statusType === 'approved';
                  const isDisapproved = statusType === 'disapproved';

                  const approvalCircleColor = getApprovalCircleColor(
                    isDisapproved,
                    isApproved,
                  );

                  const approvalIcon = isDisapproved ? (
                    <CloseIcon primary={colors.White} width={33} height={33} />
                  ) : isApproved ? (
                    <TickIcon primary={colors.White} width={18} height={18} />
                  ) : (
                    <ApprovalPlusIcon
                      width={20}
                      height={20}
                      primary={colors.White}
                    />
                  );

                  return (
                    <View
                      key={approval?.id ?? index}
                      style={styles.approvalRow}>
                      <View style={styles.approvalTimeline}>
                        <View style={styles.timelineLine} />
                        <View
                          style={[
                            styles.plusCircle,
                            {backgroundColor: approvalCircleColor},
                          ]}>
                          {approvalIcon}
                        </View>
                      </View>

                      <View style={styles.approvalCard}>
                        <View style={styles.approvalContent}>
                          <Text style={styles.approverName}>
                            {approverName}
                          </Text>

                          <Text style={styles.approverEmail}>
                            {approval?.approver?.email ?? '--'}
                          </Text>

                          <View style={styles.statusLine}>
                            <Text style={styles.approvalLabel}>Status: </Text>
                            <View
                              style={[
                                styles.approvalStatusBadge,
                                {
                                  backgroundColor: getStatusColor(
                                    approval?.status,
                                    colors,
                                  ),
                                },
                              ]}>
                              <Text style={styles.approvalStatusTxt}>
                                {capitalizeEachWord(approval?.status ?? '--')}
                              </Text>
                            </View>
                          </View>

                          <Text style={styles.approvalLabel}>
                            Comment:
                            <Text style={styles.approvalComment}>
                              {approval?.comment || ''}
                            </Text>
                          </Text>
                        </View>

                        {approval?.status?.toLowerCase?.() === 'pending' &&
                        !actionLoading ? (
                          <View style={styles.approvalActions}>
                            <TouchableOpacity
                              activeOpacity={0.8}
                              style={styles.approvalActionBtn}
                              onPress={() =>
                                onUpdateApprovalStatus(approval?.id, 'approved')
                              }>
                              <TickIcon primary="#01BD91" />
                            </TouchableOpacity>

                            <TouchableOpacity
                              activeOpacity={0.8}
                              style={styles.approvalActionBtn}
                              onPress={() =>
                                onUpdateApprovalStatus(
                                  approval?.id,
                                  'disapproved',
                                )
                              }>
                              <CloseIcon primary="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <View style={{height: normalized(70)}}>
                <EmptyComp
                  type={Empty_Screen_Type.List}
                  subText="No Approval Now"
                  component={true}
                />
              </View>
            )
          ) : null}

          {switcherList[listIndex]?.id === 2 && (
            <View style={styles.itemCont}>
              {!isClosed ? (
                <>
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
                      }}
                    />
                  </View>
                  <CustomDocumentPicker
                    key={`comment-picker-${commentPickerKey}`}
                    type="file"
                    limit={5}
                    text1="Attach Documents"
                    text2="Choose files to upload"
                    onSelect={
                      ((files: any) => {
                        setCommentFiles(Array.isArray(files) ? files : []);
                      }) as any
                    }
                  />

                  <View style={styles.commentActionRow}>
                    {currentEditComment && !actionLoading ? (
                      <View style={styles.cancelBtnCont}>
                        <SimpleButton
                          text="Cancel"
                          onPress={resetCommentEditor}
                        />
                      </View>
                    ) : null}

                    {!actionLoading ? (
                      <CustomButton
                        text={
                          currentEditComment?.id
                            ? 'Update Comment'
                            : 'Submit Comment'
                        }
                        onPress={submitComment}
                      />
                    ) : null}
                  </View>
                </>
              ) : null}
              <Text style={[styles.Heading1, {margin: normalized(10)}]}>
                Comments & Communication
              </Text>
              {details?.comments?.length > 0 ? (
                details?.comments?.map((item: any) => {
                  const isOwner =
                    String(item?.commentBy?.id) ===
                    String(selector?.helpDeskUserData?.id);

                  const firstName = item?.commentBy?.firstName ?? '';
                  const lastName = item?.commentBy?.lastName ?? '';

                  return (
                    <View
                      key={item?.id}
                      style={[
                        styles.commentBlock,
                        {
                          flexDirection: isOwner ? 'row-reverse' : 'row',
                          borderColor:
                            currentEditComment?.id == item?.id
                              ? colors.Primary
                              : colors.BorderColor,
                          backgroundColor:
                            currentEditComment?.id == item?.id
                              ? lightenHexColor(colors.Primary, 0.9)
                              : colors.Background,
                        },
                      ]}>
                      {item?.commentBy?.profilePicture ? (
                        <View style={styles.commProfileImgCont}>
                          <AppImageViewer
                            style={styles.commProfileImg}
                            source={{
                              uri: `${Base_Url}${item?.commentBy?.profilePicture}`,
                            }}
                          />
                        </View>
                      ) : (
                        <View style={styles.avatarCont}>
                          <Text style={styles.avatarTxt}>
                            {firstName ? firstName[0] : 'U'}
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
                                : colors.ScreenBackground,
                          },
                        ]}>
                        <View style={styles.contentCont}>
                          <View style={styles.nameRow}>
                            <Text style={styles.commentName}>
                              {`${firstName} ${lastName}`.trim() || 'User'}
                            </Text>
                            <Text style={styles.timeTxt}>
                              {formatTimeAgo(item?.createdAt)}
                            </Text>
                          </View>

                          {String(item?.comment || '').includes('<') ? (
                            <RenderHTML
                              contentWidth={ScreenSize.width - normalized(80)}
                              source={{html: String(item?.comment || '')}}
                              tagsStyles={{
                                body: {
                                  color: colors.Heading_Txt,
                                  margin: 0,
                                  padding: 0,
                                },
                                p: {color: colors.Heading_Txt, marginBottom: 8},
                                span: {color: colors.Heading_Txt},
                                div: {color: colors.Heading_Txt},
                              }}
                            />
                          ) : (
                            <Text style={styles.keyTxt}>{item?.comment}</Text>
                          )}

                          {isOwner &&
                          !isClosed &&
                          !item?.isEdited &&
                          !actionLoading ? (
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() => {
                                setSingleComment(item?.comment || '');
                                setCurrentEditComment(item);

                                setTimeout(() => {
                                  richTextRef.current?.setContentHTML(
                                    item?.comment || '',
                                  );
                                  scrollRef.current?.scrollToEnd?.({
                                    animated: true,
                                  });
                                  richTextRef.current?.focusContentEditor?.();
                                }, 150);
                              }}
                              style={styles.editCont}>
                              <CommentEditIcon primary={colors.Heading_Txt} />
                            </TouchableOpacity>
                          ) : null}

                          {(item?.attachments ?? []).length > 0 && (
                            <View
                              style={{
                                marginTop: normalized(8),
                                gap: normalized(6),
                              }}>
                              {(item?.attachments ?? []).map(
                                (attachment: any, index: number) => (
                                  <View
                                    key={`${
                                      item?.id ?? 'comment'
                                    }-attachment-${index}`}
                                    style={styles.attachmentRow}>
                                    <TouchableOpacity
                                      onPress={() =>
                                        onViewCommentAttachment(attachment)
                                      }>
                                      <View style={styles.attachmentNameCont}>
                                        <Text
                                          style={styles.valueTxt}
                                          numberOfLines={2}
                                          ellipsizeMode="tail">
                                          {attachment?.documentName ?? 'N/A'}
                                        </Text>
                                      </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                      onPress={() =>
                                        onDownloadAttachment(attachment)
                                      }>
                                      <DownloadIcon />
                                    </TouchableOpacity>
                                  </View>
                                ),
                              )}
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.itemCont}>
                  <Text style={styles.keyTxt}>No comments yet.</Text>
                </View>
              )}
            </View>
          )}

          {viewerItem && (
            <FileViewer
              visible={!!viewerItem}
              onClose={closeViewer}
              filename={viewerItem?.documentName ?? viewerItem?.name ?? ''}
              resolveUrl={() =>
                viewerSource === 'comment'
                  ? resolveCommentAttachmentUrl({attachmentId: viewerItem?.id})
                  : resolveTicketAttachmentUrl(viewerItem, resourceType)
              }
              onPrevious={
                viewerSource === 'ticket' &&
                viewerIndex !== null &&
                viewerIndex > 0
                  ? () => {
                      const nextIndex = viewerIndex - 1;
                      setViewerIndex(nextIndex);
                      setViewerItem(details?.attachments?.[nextIndex]);
                    }
                  : undefined
              }
              onNext={
                viewerSource === 'ticket' &&
                viewerIndex !== null &&
                viewerIndex < (details?.attachments?.length ?? 0) - 1
                  ? () => {
                      const nextIndex = viewerIndex + 1;
                      setViewerIndex(nextIndex);
                      setViewerItem(details?.attachments?.[nextIndex]);
                    }
                  : undefined
              }
            />
          )}
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

export default TicketDetailScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.ScreenBackground,
    },
    scrollView: {
      paddingHorizontal: AppHorizontalMargin,
      marginVertical: normalized(20),
      paddingBottom: normalized(20),
      gap: normalized(20),
    },
    approvalHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    refreshTxt: {
      fontSize: normalized(20),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },

    reopenBtn: {
      height: normalized(40),
      borderRadius: normalized(10),
      paddingHorizontal: normalized(10),
      backgroundColor: colors.Primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    createTicketTxt: {
      fontSize: normalized(15),
      color: colors.White,
      fontFamily: AppFonts.UbuntuBold,
    },

    approvalRow: {
      flexDirection: 'row',
      marginTop: normalized(18),
    },

    approvalTimeline: {
      width: normalized(58),
      alignItems: 'center',
    },

    timelineLine: {
      position: 'absolute',
      top: normalized(18),
      width: normalized(20),
      height: 1,
      backgroundColor: colors.BorderColor,
    },

    plusCircle: {
      width: normalized(34),
      height: normalized(34),
      borderRadius: normalized(34),
      backgroundColor: '#FFA12B',
      alignItems: 'center',
      justifyContent: 'center',
    },

    plusTxt: {
      fontSize: normalized(28),
      color: colors.White,
      lineHeight: normalized(30),
    },

    approvalCard: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      padding: normalized(12),
      backgroundColor: colors.Background,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: normalized(10),
    },

    approvalContent: {
      flex: 1,
      gap: normalized(5),
    },

    approverName: {
      fontSize: normalized(14),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuBold,
    },

    approverEmail: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },

    statusLine: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },

    approvalLabel: {
      fontSize: normalized(12),
      color: colors.Heading_Txt,
      fontFamily: AppFonts.UbuntuMedium,
    },

    approvalComment: {
      fontFamily: AppFonts.UbuntuRegular,
      color: colors.Desc_Txt,
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
    filenameCont: {
      flex: 1,
      alignItems: 'flex-start',
      gap: normalized(4),
    },
    approvalStatusBadge: {
      paddingHorizontal: normalized(8),
      paddingVertical: normalized(3),
      borderRadius: normalized(12),
    },

    approvalStatusTxt: {
      fontSize: normalized(11),
      color: colors.White,
      fontFamily: AppFonts.UbuntuBold,
    },

    approvalActions: {
      flexDirection: 'row',
      gap: normalized(8),
    },

    approvalActionBtn: {
      width: normalized(34),
      height: normalized(34),
      borderRadius: normalized(8),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      backgroundColor: colors.ScreenBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },

    actionIconTxt: {
      fontSize: normalized(18),
      fontFamily: AppFonts.UbuntuBold,
    },

    editCont: {
      alignSelf: 'flex-end',
      marginTop: normalized(6),
    },
    attachmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // gap: normalized(10),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      padding: normalized(10),
    },
    attachmentNameCont: {
      flex: 1,
    },
    commentCont: {
      height: normalized(280),
      borderWidth: 1,
      borderRadius: normalized(8),
      overflow: 'hidden',
      borderColor: colors.BorderColor,
      marginTop: normalized(10),
    },
    commentActionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: normalized(12),
      marginTop: normalized(10),
    },

    cancelBtnCont: {
      width: normalized(85),
    },
    btn: {
      marginTop: 0,
      width: normalized(120),
      height: normalized(30),
    },
    loaderCont: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
      borderRadius: normalized(30),
      overflow: 'hidden',
      resizeMode: 'cover',
    },
    avatarTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.White,
    },
    commentBlock: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: normalized(10),
      marginBottom: normalized(10),
      padding: normalized(10),
      borderWidth: 1,
      borderRadius: normalized(10),
    },
    commentRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(8),
      padding: normalized(7),
      borderRadius: normalized(6),
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
    commentName: {
      color: colors.Heading_Txt,
      fontSize: normalized(16),
      fontFamily: AppFonts.UbuntuMedium,
    },
    timeTxt: {
      fontSize: normalized(12),
      color: colors.Desc_Txt,
      fontFamily: AppFonts.UbuntuRegular,
    },
  });
