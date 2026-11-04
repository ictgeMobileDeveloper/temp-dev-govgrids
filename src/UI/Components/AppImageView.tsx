import React, {useEffect, useMemo, useState} from 'react';
import {View, ActivityIndicator} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';

import {AppStyles} from '../../Utils/AppStyles';
import {SvgUri} from 'react-native-svg';
const AppImageViewer = (props: any) => {
  const [loading, setLoading] = useState(false);
  const loadedUriRef = React.useRef<string | null>(null);

  const uri = props?.source?.uri;
  const isSvg = uri?.toLowerCase().endsWith('.svg');
  const showPlaceholder = !!props?.placeholder && !uri;
  const colors = useSelector(
    (state: AppRootStore) => state.SliceReducer.themeColors,
  );

  useEffect(() => {
    if (loadedUriRef.current !== uri) {
      setLoading(false);
    }
  }, [uri]);

  return (
    <View
      style={{
        ...props.style,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {showPlaceholder ? (
        props.placeholder
      ) : isSvg ? (
        <SvgUri
          uri={uri}
          width="100%"
          height="100%"
          onError={e => {
            console.error('SvgUri error:', e, uri);
          }}
        />
      ) : (
        <FastImage
          resizeMode={props?.resizeMode ? props?.resizeMode : 'cover'}
          source={props.source}
          onLoadStart={() => {
            if (loadedUriRef.current === uri) {
              setLoading(false);
              return;
            }

            setLoading(true);
          }}
          onLoad={() => {
            loadedUriRef.current = uri;
            setLoading(false);
          }}
          onLoadEnd={() => {
            loadedUriRef.current = uri;
            setLoading(false);
          }}
          onError={() => {
            console.log('FastImage error for uri:', uri);
            setLoading(false);
          }}
          style={{
            ...props.style,
            borderWidth: 0,
          }}
        />
      )}

      {loading && !showPlaceholder && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator
            size={props?.indicatorSize ? props?.indicatorSize : 'small'}
            color={colors.Primary}
          />
        </View>
      )}
    </View>
  );
};
export default AppImageViewer;
