import {Image, Platform} from 'react-native';

export type FileToValidate = {
  uri?: string;
  type?: string;
  mimeType?: string;
  filename?: string;
  fileName?: string;
  name?: string;
  size?: number;
};

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

const IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'heic',
  'heif',
  'bmp',
  'tif',
  'tiff',
];

const getExtension = (value?: string): string => {
  if (!value) {
    return '';
  }

  const cleanValue = value.split('?')[0].split('#')[0].toLowerCase();

  const lastPart = cleanValue.split('/').pop() ?? '';

  if (!lastPart.includes('.')) {
    return '';
  }

  return lastPart.split('.').pop() ?? '';
};

export const isImageFile = (file: FileToValidate): boolean => {
  const mimeType = (file.type ?? file.mimeType ?? '').toLowerCase().trim();

  const possibleValues = [file.filename, file.fileName, file.name, file.uri];

  const hasImageExtension = possibleValues.some(value =>
    IMAGE_EXTENSIONS.includes(getExtension(value)),
  );

  return (
    mimeType.startsWith('image/') ||
    mimeType.includes('jpeg') ||
    mimeType.includes('jpg') ||
    mimeType.includes('png') ||
    mimeType.includes('webp') ||
    mimeType.includes('heic') ||
    mimeType.includes('heif') ||
    hasImageExtension
  );
};

const getImageUris = (uri: string): string[] => {
  const cleanUri = uri.trim();
  const candidates = new Set<string>();

  candidates.add(cleanUri);

  if (
    Platform.OS === 'ios' &&
    cleanUri.startsWith('/') &&
    !cleanUri.startsWith('file://')
  ) {
    candidates.add(`file://${cleanUri}`);
  }

  try {
    candidates.add(decodeURI(cleanUri));
  } catch {
    // Keep original URI.
  }

  return Array.from(candidates);
};

const openImage = (uri: string): Promise<boolean> => {
  return new Promise(resolve => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve(width > 0 && height > 0);
      },
      error => {
        console.log('Cannot open image:', uri, error);
        resolve(false);
      },
    );
  });
};

const canOpenImage = async (uri: string): Promise<boolean> => {
  const uriCandidates = getImageUris(uri);

  for (const candidate of uriCandidates) {
    if (await openImage(candidate)) {
      return true;
    }
  }

  return false;
};

export const validateCorruptedFile = async (
  file: FileToValidate,
): Promise<ValidationResult> => {
  const imageFile = isImageFile(file);

  console.log('Corruption validation:', {
    name: file.filename ?? file.fileName ?? file.name,
    type: file.type ?? file.mimeType,
    uri: file.uri,
    imageFile,
  });

  // Non-image documents pass without corruption validation.
  if (!imageFile) {
    return {isValid: true};
  }

  if (!file.uri?.trim()) {
    return {
      isValid: false,
      message: 'The selected image could not be opened.',
    };
  }

  const validImage = await canOpenImage(file.uri);

  if (!validImage) {
    return {
      isValid: false,
      message:
        'The selected image cannot be opened. Please select another image.',
    };
  }

  return {isValid: true};
};

export const validateSelectedFiles = async (
  files: FileToValidate[],
): Promise<ValidationResult> => {
  if (!Array.isArray(files) || files.length === 0) {
    return {
      isValid: false,
      message: 'No file was selected.',
    };
  }

  for (const file of files) {
    const result = await validateCorruptedFile(file);

    if (!result.isValid) {
      return result;
    }
  }

  return {isValid: true};
};
