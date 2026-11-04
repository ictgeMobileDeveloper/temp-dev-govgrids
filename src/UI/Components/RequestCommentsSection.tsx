import React, {memo, useMemo, useRef, useState} from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RenderHTML, {
  defaultHTMLElementModels,
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html';
import {RichEditor} from 'react-native-pell-rich-editor';
import {BlurView} from '@react-native-community/blur';
import {useSelector} from 'react-redux';

import {AppRootStore} from '../../Redux/AppStore';
import {AppFonts, normalized, ScreenSize} from '../../Utils/AppConstants';
import {formatTimeAgo, lightenHexColor} from '../../Utils/Helper';
import {Base_Url} from '../../Network/Urls';
import CustomButton from './CustomButton';
import SimpleButton from './SimpleButton';

import AppImageViewer from './AppImageView';
import CommentEditIcon from './../Svg/CommentEditIcon';
import LockIcon from '../Svg/LockIcon';
import CustomRichToolbar from './CustomRickToolbar';
import ReportIcon from '../Svg/ReportIcon';
import {CommentImageRenderer} from './ImageRender';
import {ScrollView} from 'react-native-gesture-handler';
import {KeyboardAwareScrollView} from 'react-native-keyboard-controller';

type Props = {
  comments: any[];
  loading?: boolean;
  disabled?: boolean;
  disabledMessage?: string;
  onCreateComment: (comment: string) => Promise<boolean> | boolean;
  onUpdateComment: (comment: string, item: any) => Promise<boolean> | boolean;
  getIsOwner: (item: any) => boolean;
  getAuthorName: (item: any) => string;
  getAvatarPath?: (item: any) => string | undefined;
  getInitial?: (item: any) => string;
  getCommentHtml?: (item: any) => string;
  getCommentDate?: (item: any) => string;
  canEditComment?: (item: any) => boolean;
  canShowEdit?: (item: any) => boolean;
  canReportComment?: (item: any) => boolean;
  onReportComment?: (item: any) => void;
  showComposer?: boolean;
};

const customHTMLElementModels = {
  'font face': HTMLElementModel.fromCustomModel({
    tagName: 'font face',
    contentModel: HTMLContentModel.block,
  }),
};

const customRenderers = {
  img: CommentImageRenderer,

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

const RequestCommentsSection: React.FC<Props> = ({
  comments,
  loading = false,
  disabled = false,
  disabledMessage,
  onCreateComment,
  onUpdateComment,
  getIsOwner,
  getAuthorName,
  getAvatarPath,
  getInitial,
  getCommentHtml = item => item?.comment,
  getCommentDate = item => item?.commentAt ?? item?.createdAt,
  canEditComment = item => !item?.isEdited,
  canShowEdit,
  canReportComment,
  onReportComment,
  showComposer = true,
}) => {
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const richTextRef = useRef<any>(null);
  const [singleComment, setSingleComment] = useState('');
  const [currentEditComment, setCurrentEditComment] = useState<any>(null);
  const Wrapper = comments?.length === 0 ? KeyboardAwareScrollView : View;

  const resetEditor = () => {
    setSingleComment('');
    setCurrentEditComment(null);
    richTextRef.current?.setContentHTML('');
  };

  const submit = async () => {
    if (disabled || loading) return;

    const html = String(singleComment || '').trim();
    if (!html) return;

    const ok = currentEditComment?.id
      ? await onUpdateComment(html, currentEditComment)
      : await onCreateComment(html);

    if (ok) {
      resetEditor();
    }
  };

  return (
    <>
      <KeyboardAwareScrollView>
        {showComposer && (
          <View style={styles.commentBoxWrapper}>
            <View style={styles.line} />

            <CustomRichToolbar editor={richTextRef} />

            <View style={styles.commentCont}>
              <RichEditor
                ref={richTextRef}
                disabled={disabled}
                onChange={setSingleComment}
                editorStyle={{
                  backgroundColor: colors.Background,
                  color: colors.Heading_Txt,
                }}
                placeholder="Enter your Comment"
                initialHeight={normalized(200)}
                useContainer={false}
                style={{
                  height: normalized(200),
                }}
              />
            </View>

            <View style={styles.actionRow}>
              {currentEditComment && !disabled && (
                <View style={styles.cancelBtnCont}>
                  <SimpleButton
                    text="Cancel"
                    onPress={resetEditor}
                    loading={false}
                  />
                </View>
              )}

              <View style={styles.nextBtnCont}>
                <CustomButton
                  text={
                    currentEditComment?.id ? 'Update Comment' : 'Add Comment'
                  }
                  onPress={submit}
                  loading={loading}
                />
              </View>
            </View>
          </View>
        )}
        {comments?.length > 0 &&
          comments.map((item: any) => {
            const isOwner = getIsOwner(item);
            const avatarPath = getAvatarPath?.(item);
            const authorName = getAuthorName(item);

            return (
              <View
                key={item?.id}
                style={[
                  styles.commentListCont,
                  {flexDirection: isOwner ? 'row-reverse' : 'row'},
                ]}>
                {avatarPath ? (
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.commProfileImgCont}>
                    <AppImageViewer
                      resizeMode="contain"
                      style={styles.commProfileImg}
                      source={{uri: `${Base_Url}${avatarPath}`}}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.avatarCont}>
                    <Text style={styles.avatarTxt}>
                      {(
                        getInitial?.(item) ||
                        authorName?.charAt(0) ||
                        'U'
                      ).toUpperCase()}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.commentRow,
                    {
                      backgroundColor:
                        currentEditComment?.id === item?.id
                          ? lightenHexColor(colors.Primary, 0.8)
                          : colors.ScreenBackground,
                    },
                  ]}>
                  <View style={styles.contentCont}>
                    <View style={styles.nameRow}>
                      <Text style={styles.commentName}>{authorName}</Text>
                      <Text style={styles.timeTxt}>
                        {formatTimeAgo(getCommentDate(item))}
                      </Text>
                    </View>

                    <RenderHTML
                      contentWidth={ScreenSize.width - normalized(60)}
                      source={{html: getCommentHtml(item)}}
                      tagsStyles={{
                        body: {color: colors.Heading_Txt},
                        div: {color: colors.Heading_Txt},
                        span: {color: colors.Heading_Txt},
                        p: {marginBottom: 12},
                        b: {fontWeight: 'bold'},
                        strong: {fontWeight: 'bold'},
                        i: {fontStyle: 'italic'},
                        em: {fontStyle: 'italic'},
                        u: {textDecorationLine: 'underline'},
                        a: {
                          color: colors.Heading_Txt,
                          textDecorationLine: 'underline',
                        },
                      }}
                      customHTMLElementModels={{
                        ...defaultHTMLElementModels,
                        ...customHTMLElementModels,
                      }}
                      renderers={customRenderers}
                      enableCSSInlineProcessing
                    />

                    <View style={styles.commentBtns}>
                      {(canShowEdit
                        ? canShowEdit(item)
                        : isOwner && canEditComment(item)) &&
                        !disabled && (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => {
                              setSingleComment(getCommentHtml(item));
                              richTextRef.current?.setContentHTML(
                                getCommentHtml(item),
                              );
                              setCurrentEditComment(item);
                            }}>
                            <CommentEditIcon primary={colors.Heading_Txt} />
                          </TouchableOpacity>
                        )}

                      {canReportComment?.(item) && (
                        <TouchableOpacity
                          activeOpacity={0.8}
                          onPress={() => onReportComment?.(item)}>
                          <ReportIcon primary={colors.Heading_Txt} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
      </KeyboardAwareScrollView>
    </>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    commentListCont: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: normalized(10),
      marginBottom: normalized(10),
    },
    commentRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: normalized(8),
      padding: normalized(10),
      borderRadius: normalized(8),
      borderWidth: 1,
      borderColor: colors.BorderColor,
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
    editCont: {
      alignSelf: 'flex-end',
    },
    commentBtns: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: normalized(12),
      marginTop: normalized(8),
    },
    avatarCont: {
      width: normalized(40),
      height: normalized(40),
      backgroundColor: colors.Primary,
      borderRadius: normalized(40),
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarTxt: {
      fontSize: normalized(14),
      fontFamily: AppFonts.UbuntuBold,
      color: colors.White,
    },
    commProfileImgCont: {
      width: normalized(40),
      height: normalized(40),
      borderRadius: normalized(40),
      overflow: 'hidden',
    },
    commProfileImg: {
      width: normalized(40),
      height: normalized(40),
      borderRadius: normalized(40),
      overflow: 'hidden',
    },
    commentBoxWrapper: {
      position: 'relative',
      marginBottom: normalized(20),
    },
    line: {
      backgroundColor: colors.Grey_2,
      height: normalized(1),
      marginBottom: normalized(10),
    },
    commentCont: {
      height: normalized(280),
      borderWidth: 1,
      borderRadius: normalized(8),
      overflow: 'hidden',
      borderColor: colors.BorderColor,
      marginTop: normalized(10),
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: normalized(12),
      alignSelf: 'flex-end',
    },
    cancelBtnCont: {
      width: normalized(80),
    },
    nextBtnCont: {
      width: normalized(150),
      alignSelf: 'flex-end',
    },
    commentDisableCont: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 990,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: normalized(8),
      overflow: 'hidden',
    },
    blurBackground: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: normalized(8),
    },

    disabledTxt: {
      color: colors.Desc_Txt,
      textAlign: 'center',
      fontFamily: AppFonts.UbuntuRegular,
      fontSize: normalized(13),
    },
  });

export default memo(RequestCommentsSection);
