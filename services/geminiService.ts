import { GoogleGenAI } from "@google/genai";

// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Transforms an image based on a text prompt using Gemini 2.5 Flash Image.
 * 
 * @param base64Image The base64 string of the image (without data:image/... prefix)
 * @param mimeType The mime type of the image (e.g., image/png)
 * @param prompt The user's instruction for transformation
 */
export const transformImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    // According to guidelines: To edit images, prompt with text and images.
    // We use gemini-2.5-flash-image for general image editing tasks.
    const model = 'gemini-2.5-flash-image';

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `Transform this image based on the following instruction: ${prompt}. Return only the transformed image.`,
          },
        ],
      },
      // Note: responseMimeType is not supported for nano banana (flash-image) models per guidelines.
    });

    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("لم يتم استلام أي استجابة من النموذج.");
    }

    const parts = candidates[0].content.parts;
    let transformedImageUrl = '';

    for (const part of parts) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        // Assume PNG if not specified, but typically the model preserves or standardizes output
        transformedImageUrl = `data:image/png;base64,${base64Data}`;
        break;
      }
    }

    if (!transformedImageUrl) {
        // Fallback: Check if the model refused and sent text instead
        const textPart = parts.find(p => p.text);
        if (textPart) {
            throw new Error(`تعذر تحويل الصورة. رد النموذج: ${textPart.text}`);
        }
        throw new Error("لم يتم العثور على صورة في استجابة النموذج.");
    }

    return transformedImageUrl;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "حدث خطأ غير متوقع أثناء معالجة الصورة.");
  }
};