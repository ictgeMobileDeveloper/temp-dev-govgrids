import React, {useMemo, useState} from 'react';
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
import {normalized, ScreenProps} from '../../Utils/AppConstants';
import CustomHeader from './CustomHeader';
import FileViewer from './MediaPreviewModal';
import {useSignedDocResolver} from '../../Hooks/getSignedUrl';
import PdfIcon from '../Svg/PdfIcon';
import ExcelIcon from '../Svg/ExcelIcon';
import DocumentIcon from '../Svg/DocumentIcon';
import WordIcon from '../Svg/WordIcon';
import ImageIcon from '../Svg/ImageIcon';
import PlayIcon from '../Svg/VideoSVG';
import AudioIcon from '../Svg/AudioIcon';
import MailVector from '../Svg/MailVector';
import {
  IMAGE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../ResidentIssuePortal/Components/FileListing';
import CustomButton from './CustomButton';

const FILTERS = [
  {key: 'all', label: 'All'},
  {key: 'pdf', label: 'PDF'},
  {key: 'image', label: 'Images'},
  {key: 'video', label: 'Video'},
  {key: 'audio', label: 'Audio'},
  {key: 'doc', label: 'Word'},
  {key: 'excel', label: 'Excel'},
];

const getFileName = (item: any, navigation?: string) => {
  return navigation === 'RESIDENT' ? item?.filename : item?.documentName;
};

const getCategory = (filename?: string) => {
  const type = filename?.split('.').pop()?.toLowerCase() ?? '';
  if (type === 'pdf') return 'pdf';
  if (IMAGE_EXTENSIONS.includes(type)) return 'image';
  if (VIDEO_EXTENSIONS.includes(type)) return 'video';
  if (AUDIO_EXTENSIONS.includes(type)) return 'audio';
  if (type === 'doc' || type === 'docx') return 'doc';
  if (['xls', 'xlsx', 'csv'].includes(type)) return 'excel';
  return 'other';
};

const getDocIcon = (filename?: string, colors?: any) => {
  const category = getCategory(filename);
  switch (category) {
    case 'pdf':
      return <PdfIcon />;
    case 'image':
      return <ImageIcon size={30} />;
    case 'video':
      return <PlayIcon />;
    case 'audio':
      return <AudioIcon />;
    case 'doc':
      return <WordIcon />;
    case 'excel':
      return <ExcelIcon />;
    default:
      return <DocumentIcon width={30} height={30} primary={colors?.Desc_Txt} />;
  }
};

const DocumentsListScreen = (props: ScreenProps) => {
  const insects = useSafeAreaInsets();
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const colors = selector.themeColors;
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const {urls, payload, singleSignedURL, AllSignedURL, navigation} =
    props?.route?.params ?? {};

  console.log(props?.route?.params);

  const {resolveDocUrl, downloadAll, downloadAllLoading} = useSignedDocResolver(
    payload,
    navigation,
    singleSignedURL,
    AllSignedURL,
  );

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const filteredUrls = useMemo(() => {
    return (urls ?? []).filter((item: any) => {
      const filename = getFileName(item, navigation);

      const matchesSearch = (filename ?? '')
        .toLowerCase()
        .includes(search.trim().toLowerCase());

      const matchesFilter =
        activeFilter === 'all' || getCategory(filename) === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [urls, search, activeFilter, navigation]);

  const viewerItem = viewerIndex !== null ? filteredUrls[viewerIndex] : null;

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
        text={`Documents (${urls?.length ?? 0})`}
      />

      <View style={styles.searchCont}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search documents"
          placeholderTextColor={colors.Desc_Txt}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.filterCont}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTERS}
          keyExtractor={item => item.key}
          contentContainerStyle={{gap: normalized(8)}}
          renderItem={({item}) => {
            const isActive = activeFilter === item.key;
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveFilter(item.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive
                      ? colors.Primary
                      : colors.Ice_Blue,
                  },
                ]}>
                <Text
                  style={[
                    styles.chipTxt,
                    {color: isActive ? colors.White : colors.Heading_Txt},
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filteredUrls}
        keyExtractor={(item, index) => String(item?.id ?? index)}
        contentContainerStyle={{
          paddingHorizontal: normalized(20),
          paddingTop: normalized(10),
          paddingBottom: normalized(30),
        }}
        ItemSeparatorComponent={() => <View style={{height: normalized(10)}} />}
        ListEmptyComponent={
          <Text style={styles.emptyTxt}>No documents found</Text>
        }
        ListFooterComponent={
          <CustomButton
            text="Download All"
            onPress={() => downloadAll()}
            loading={downloadAllLoading}
          />
        }
        renderItem={({item, index}) => {
          const filename = getFileName(item, navigation);

          return (
            <TouchableOpacity
              style={styles.docBlock}
              onPress={() => setViewerIndex(index)}>
              {getDocIcon(filename, colors)}

              <View style={styles.filenameCont}>
                <Text
                  style={styles.nameTxt}
                  numberOfLines={1}
                  ellipsizeMode="middle">
                  {filename}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {viewerItem && (
        <FileViewer
          visible={viewerIndex !== null}
          onClose={() => setViewerIndex(null)}
          filename={getFileName(viewerItem, navigation) ?? ''}
          resolveUrl={() => resolveDocUrl(viewerItem)}
          onPrevious={
            viewerIndex! > 0
              ? () => setViewerIndex(viewerIndex! - 1)
              : undefined
          }
          onNext={
            viewerIndex! < filteredUrls.length - 1
              ? () => setViewerIndex(viewerIndex! + 1)
              : undefined
          }
        />
      )}
    </View>
  );
};

export default DocumentsListScreen;

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.Background,
    },
    searchCont: {
      paddingHorizontal: normalized(20),
      marginTop: normalized(12),
    },
    searchInput: {
      height: normalized(44),
      borderWidth: 1,
      borderColor: colors.BorderColor,
      borderRadius: normalized(8),
      paddingHorizontal: normalized(14),
      color: colors.Heading_Txt,
    },
    filterCont: {
      paddingHorizontal: normalized(20),
      marginTop: normalized(12),
      marginBottom: normalized(4),
    },
    chip: {
      paddingHorizontal: normalized(14),
      paddingVertical: normalized(8),
      borderRadius: normalized(20),
    },
    chipTxt: {
      fontSize: normalized(13),
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
    filenameCont: {
      flex: 1,
      alignItems: 'flex-start',
      gap: normalized(4),
    },
    nameTxt: {
      color: colors.Heading_Txt,
    },
    emptyTxt: {
      textAlign: 'center',
      marginTop: normalized(40),
      color: colors.Desc_Txt,
    },
  });
