import {Platform, Alert} from 'react-native';
import {
  pick,
  types as docTypes,
  isErrorWithCode,
  errorCodes,
  // keepLocalCopy, // optional – see note below
} from '@react-native-documents/picker';

export type PickedFile = {
  name: string | null;
  type: string | null; // MIME
  size: number | null;
  uri: string; // local or content://
};

type AllowedTypes = string[]; // usually use values from `docTypes`
type PickMode = 'single' | 'multiple';

const normalize = (r: {
  name: string | null;
  type: string | null;
  size: number | null;
  uri: string;
}): PickedFile => ({
  name: r.name ?? null,
  type: r.type ?? null,
  size: r.size ?? null,
  uri: Platform.select({
    ios: r?.uri?.startsWith('file://')
      ? r.uri.replace(/^file:\/\//, '')
      : r.uri, // strip file:// on iOS for easier FS usage
    android: r.uri,
    default: r.uri,
  })!,
});

/**
 * Pick documents using @react-native-documents/picker, handling:
 * - single vs multiple
 * - file type filters
 * - user cancellations
 * - returns: PickedFile | PickedFile[] | null
 *
 * By default we use `mode: "import"` which gives you a local, short-lived copy.
 * Switch to open mode if you need long-term access bookmarks.
 */
export async function pickDocuments(
  mode: PickMode = 'single',
  onComplete: (files: PickedFile[]) => void,
): Promise<PickedFile | PickedFile[] | null> {
  try {
    const result = await pick({
      mode: 'import',
      allowMultiSelection: mode === 'multiple',
      type: docTypes.allFiles,
    });

    const Documents: PickedFile[] = result.map(doc => ({
      name: doc.name ?? null,
      type: doc.type ?? null,
      uri: doc?.uri?.startsWith('file://')
        ? doc.uri.replace('file://', '')
        : doc.uri,
      size: doc.size ?? null,
    }));

    console.log('got -->>> ', Documents);

    onComplete(Documents);

    return mode === 'multiple' ? Documents : Documents[0] ?? null;
  } catch (err: unknown) {
    if (isErrorWithCode(err)) {
      if (err.code === errorCodes.OPERATION_CANCELED) {
        return null;
      }

      if (err.code === errorCodes.IN_PROGRESS) {
        Alert.alert('Please wait', 'A file picker is already open.');
        return null;
      }

      Alert.alert(
        'Could not open file',
        err.message ?? 'Unsupported file type.',
      );
      return null;
    }

    console.error('Document pick error:', err);
    Alert.alert('Error', 'Something went wrong while picking the document.');
    return null;
  }
}
