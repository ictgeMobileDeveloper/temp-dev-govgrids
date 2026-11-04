import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {Buffer} from 'buffer';
// @ts-ignore - mammoth has no bundled types
import mammoth from 'mammoth';

type Props = {
  filePath: string;
  onError: (message: string) => void;
};

const DocxViewer = ({filePath, onError}: Props) => {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadDocx = async () => {
      setLoading(true);

      try {
        const base64Data = await ReactNativeBlobUtil.fs.readFile(
          filePath,
          'base64',
        );

        // Buffer is already a dependency - no atob/base-64 polyfill needed.
        const nodeBuffer = Buffer.from(base64Data, 'base64');
        const arrayBuffer = new Uint8Array(nodeBuffer).buffer;
        console.log('docx bytes:', new Uint8Array(arrayBuffer).slice(0, 4));
        const result = await mammoth.convertToHtml({arrayBuffer});

        if (cancelled) return;

        const styledHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, Roboto, Arial, sans-serif;
                  padding: 16px;
                  line-height: 1.5;
                  color: #222;
                  word-wrap: break-word;
                }
                img { max-width: 100%; height: auto; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 12px; }
                td, th { border: 1px solid #ddd; padding: 8px; font-size: 14px; }
                h1, h2, h3 { margin-top: 20px; }
              </style>
            </head>
            <body>${result.value}</body>
          </html>
        `;

        setHtml(styledHtml);
      } catch (err) {
        if (!cancelled) {
          console.log('DocxViewer error:', err);
          onError('Unable to preview this document.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDocx();

    return () => {
      cancelled = true;
    };
  }, [filePath, onError]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{html}}
      style={styles.webview}
      scalesPageToFit
      onError={() => onError('Unable to render this document.')}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {fontSize: 14, color: '#B00020', textAlign: 'center'},
  webview: {flex: 1, backgroundColor: '#fff'},
});

export default DocxViewer;
