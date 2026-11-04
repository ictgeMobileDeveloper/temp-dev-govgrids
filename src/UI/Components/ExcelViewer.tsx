import React, {useEffect, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import ReactNativeBlobUtil from 'react-native-blob-util';
import * as XLSX from 'xlsx';

type Props = {
  filePath: string;
  onError: (message: string) => void;
};

const ExcelViewer = ({filePath, onError}: Props) => {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadExcel = async () => {
      setLoading(true);

      try {
        const base64Data = await ReactNativeBlobUtil.fs.readFile(
          filePath,
          'base64',
        );

        // xlsx accepts a base64 string directly - no Buffer conversion needed here.
        const workbook = XLSX.read(base64Data, {type: 'base64'});

        if (cancelled) return;

        const sheetsHtml = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const tableHtml = XLSX.utils.sheet_to_html(worksheet, {
            id: undefined,
            editable: false,
          });
          return `<h2>${escapeHtml(sheetName)}</h2>${tableHtml}`;
        }).join('<hr/>');

        const styledHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, Roboto, Arial, sans-serif;
                  padding: 12px;
                  color: #222;
                }
                h2 { margin-top: 20px; font-size: 16px; }
                table {
                  border-collapse: collapse;
                  min-width: 100%;
                }
                td, th {
                  border: 1px solid #ccc;
                  padding: 6px 8px;
                  white-space: nowrap;
                  font-size: 12px;
                }
                hr { margin: 20px 0; border: none; border-top: 1px solid #ddd; }
              </style>
            </head>
            <body>${sheetsHtml}</body>
          </html>
        `;

        setHtml(styledHtml);
      } catch (err: any) {
        if (!cancelled) {
          console.log('ExcelViewer error:', err);
          onError('Unable to preview this spreadsheet.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadExcel();

    return () => {
      cancelled = true;
    };
  }, [filePath]);

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
      onError={() => onError('Unable to render this spreadsheet.')}
    />
  );
};

// Sheet names can contain arbitrary characters - escape before interpolating into HTML.
function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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

export default ExcelViewer;
