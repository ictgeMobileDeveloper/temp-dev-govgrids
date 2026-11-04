import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNBlobUtil from 'react-native-blob-util';
import RenderHTML from 'react-native-render-html';
import {Buffer} from 'buffer';
import {useSelector} from 'react-redux';
import {AppRootStore} from '../../Redux/AppStore';
type Props = {
  url: string;
  contentWidth: number;
  textColor?: string;
  headingColor?: string;
};

type EmailData = {
  subject?: string;
  from?: string;
  to?: string;
  cc?: string;
  date?: string;
  html?: string;
  text?: string;
};

const EMLViewer: React.FC<Props> = ({
  url,
  contentWidth,
  textColor = '#333',
  headingColor = '#000',
}) => {
  const [email, setEmail] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const selector = useSelector((state: AppRootStore) => state.SliceReducer);
  const color = selector.themeColors;
  const colors = useEffect(() => {
    let cancelled = false;

    const loadEML = async () => {
      try {
        setLoading(true);
        setError(null);
        setEmail(null);

        if (!url) {
          throw new Error('Invalid EML URL');
        }

        const response = await RNBlobUtil.fetch('GET', url);

        const status = response.info().status;

        if (status < 200 || status >= 300) {
          throw new Error(`EML download failed: ${status}`);
        }

        const rawEML = await response.text();

        if (!rawEML) {
          throw new Error('Empty EML file');
        }

        console.log('EML PREVIEW:', rawEML.substring(0, 500));

        const parsed = parseEML(rawEML);

        if (cancelled) return;

        setEmail(parsed);
      } catch (err) {
        console.log('EMLViewer error:', err);

        if (!cancelled) {
          setError('Unable to read this email file.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadEML();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading email...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!email) {
    return (
      <View style={styles.center}>
        <Text>No email content available.</Text>
      </View>
    );
  }

  const htmlContent = email.html
    ? email.html
    : `
      <div style="color:${textColor}; font-family: Arial;">
        ${escapeHtml(email.text || 'No email content available.')}
      </div>
    `;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator>
      {email.subject && (
        <Text style={[styles.subject, {color: headingColor}]}>
          {email.subject}
        </Text>
      )}

      {email.from && (
        <Text style={[styles.meta, {color: textColor}]}>
          From: {email.from}
        </Text>
      )}

      {email.to && (
        <Text style={[styles.meta, {color: textColor}]}>To: {email.to}</Text>
      )}

      {email.cc && (
        <Text style={[styles.meta, {color: textColor}]}>Cc: {email.cc}</Text>
      )}

      {email.date && (
        <Text style={[styles.meta, {color: textColor}]}>
          Date: {email.date}
        </Text>
      )}

      <View style={styles.divider} />

      <RenderHTML
        contentWidth={contentWidth}
        source={{html: htmlContent}}
        defaultTextProps={{
          selectable: true,
        }}
        tagsStyles={{
          body: {color: color.Heading_Txt},
          div: {color: color.Heading_Txt},
          span: {color: color.Heading_Txt},
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
          img: {
            margin: 20,
            width: 50,
            height: 50,
            resizeMode: 'contain',
          },
        }}
      />
    </ScrollView>
  );
};

const decodeBase64 = (value: string): string => {
  return Buffer.from(value, 'base64').toString('utf8');
};

const decodeMimeBody = (body: string, encoding?: string): string => {
  const cleanBody = body.replace(/\r?\n/g, '').trim();

  if (encoding === 'base64') {
    try {
      return decodeBase64(cleanBody);
    } catch (error) {
      console.log('❌ Base64 decode failed:', error);
      return body;
    }
  }

  //   if (encoding === 'quoted-printable') {
  //     return decodeP(body);
  //   }

  return body;
};

const parseEML = (rawEML: string): EmailData => {
  console.log('================ EML PARSING START ================');

  const normalized = rawEML.replace(/\r\n/g, '\n');

  const headerBodySeparator = normalized.indexOf('\n\n');

  const rawHeaders =
    headerBodySeparator >= 0
      ? normalized.substring(0, headerBodySeparator)
      : normalized;

  const body =
    headerBodySeparator >= 0
      ? normalized.substring(headerBodySeparator + 2)
      : '';

  const headers = parseHeaders(rawHeaders);

  console.log('🧾 PARSED HEADERS:', headers);

  const contentType = headers['content-type'] || '';

  let html: string | undefined;
  let text: string | undefined;

  // Multipart email
  if (contentType.toLowerCase().startsWith('multipart/')) {
    const boundaryMatch = contentType.match(
      /boundary\s*=\s*(?:"([^"]+)"|([^;]+))/i,
    );

    const boundary = boundaryMatch?.[1] || boundaryMatch?.[2];

    console.log('🔗 MIME BOUNDARY:', boundary);

    if (boundary) {
      const parts = body.split(`--${boundary}`);

      console.log('📦 MIME PARTS:', parts.length);

      for (const part of parts) {
        const partSeparator = part.indexOf('\n\n');

        if (partSeparator === -1) {
          continue;
        }

        const partHeadersRaw = part.substring(0, partSeparator);
        const partBody = part
          .substring(partSeparator + 2)
          .trim()
          .replace(/--$/, '')
          .trim();

        const partHeaders = parseHeaders(partHeadersRaw);

        const partContentType =
          partHeaders['content-type']?.toLowerCase() || '';

        const transferEncoding =
          partHeaders['content-transfer-encoding']?.toLowerCase() || '';

        console.log('📦 MIME PART:', {
          contentType: partContentType,
          transferEncoding,
          bodyLength: partBody.length,
        });

        if (partContentType.includes('text/html')) {
          html = decodeMimeBody(partBody, transferEncoding);

          console.log('✅ HTML PART FOUND');
          console.log('🌐 DECODED HTML:', html.substring(0, 500));

          break;
        }

        if (partContentType.includes('text/plain') && !text) {
          text = decodeMimeBody(partBody, transferEncoding);

          console.log('✅ TEXT PART FOUND');
        }
      }
    }
  } else if (contentType.toLowerCase().includes('text/html')) {
    html = decodeMimeBody(
      body,
      headers['content-transfer-encoding']?.toLowerCase(),
    );
  } else if (body.includes('<html') || body.includes('<body')) {
    html = body;
  } else {
    text = decodeMimeBody(
      body,
      headers['content-transfer-encoding']?.toLowerCase(),
    );
  }

  const result: EmailData = {
    subject: decodeMimeHeader(headers.subject),
    from: decodeMimeHeader(headers.from),
    to: decodeMimeHeader(headers.to),
    cc: decodeMimeHeader(headers.cc),
    date: headers.date,
    html,
    text,
  };

  console.log('🎯 FINAL EMAIL DATA:', {
    ...result,
    html: result.html ? `${result.html.substring(0, 500)}...` : undefined,
    text: result.text ? `${result.text.substring(0, 500)}...` : undefined,
  });

  return result;
};
const parseHeaders = (rawHeaders: string): Record<string, string> => {
  const unfolded = rawHeaders.replace(/\n[ \t]+/g, ' ');

  const result: Record<string, string> = {};

  unfolded.split('\n').forEach(line => {
    const separatorIndex = line.indexOf(':');

    if (separatorIndex === -1) return;

    const key = line.substring(0, separatorIndex).trim().toLowerCase();

    const value = line.substring(separatorIndex + 1).trim();

    result[key] = value;
  });

  return result;
};

const decodeMimeHeader = (value?: string): string | undefined => {
  if (!value) return undefined;

  return value.replace(
    /=\?([^?]+)\?([bBqQ])\?([^?]+)\?=/g,
    (_match, charset, encoding, encodedText) => {
      try {
        let bytes: number[];

        if (encoding.toLowerCase() === 'b') {
          bytes = Array.from(Buffer.from(encodedText, 'base64'));
        } else {
          const decoded = encodedText
            .replace(/_/g, ' ')
            .replace(/=([A-Fa-f0-9]{2})/g, (_: string, hex: string) =>
              String.fromCharCode(parseInt(hex, 16)),
            );

          bytes = Array.from(Buffer.from(decoded, 'latin1'));
        }

        return Buffer.from(bytes).toString('utf8');
      } catch (error) {
        console.log('❌ MIME header decode failed:', error);
        return encodedText;
      }
    },
  );
};

const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br />');
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 10,
  },

  errorText: {
    color: '#D93025',
    textAlign: 'center',
  },

  subject: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },

  meta: {
    fontSize: 13,
    marginBottom: 4,
  },

  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 16,
  },
});

export default EMLViewer;
