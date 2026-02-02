/**
 * Converts a File object to a Base64 string (Data URI).
 */
export const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Extracts the raw Base64 string and MimeType from a Data URI.
 */
export const parseDataUri = (dataUri: string): { base64: string; mimeType: string } => {
  const matches = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid Data URI");
  }
  return {
    mimeType: matches[1],
    base64: matches[2],
  };
};

/**
 * Downloads a Base64 image.
 */
export const downloadImage = (dataUri: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
