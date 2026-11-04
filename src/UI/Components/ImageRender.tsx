import {Image as RNImage} from 'react-native';
import {Buffer} from 'buffer';
import {SvgXml} from 'react-native-svg';
import {useState} from 'react';
import {normalized, ScreenSize} from '../../Utils/AppConstants';

export const CommentImageRenderer = ({tnode}: any) => {
  const src: string | undefined = tnode?.attributes?.src;
  const [aspectRatio, setAspectRatio] = useState(1);

  if (!src) return null;

  const maxWidth = ScreenSize.width - normalized(160);

  if (src.startsWith('data:image/svg+xml')) {
    const base64 = src.split(',')[1] ?? '';
    let svgMarkup = '';
    try {
      svgMarkup = Buffer.from(base64, 'base64').toString('utf8');
    } catch (e) {
      return null;
    }
    return (
      <SvgXml
        xml={svgMarkup}
        width={maxWidth}
        height={maxWidth * 0.65}
        style={{marginVertical: normalized(6), borderRadius: normalized(6)}}
      />
    );
  }

  return (
    <RNImage
      source={{uri: src}}
      style={{
        width: maxWidth,
        height: maxWidth / aspectRatio,
        borderRadius: normalized(6),
        marginVertical: normalized(6),
      }}
      resizeMode="contain"
      onLoad={e => {
        const {width, height} = e.nativeEvent.source;
        if (width && height) setAspectRatio(width / height);
      }}
    />
  );
};
