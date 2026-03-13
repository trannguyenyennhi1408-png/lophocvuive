import { GoogleGenAI } from "@google/genai";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const pollOperation = async <T,>(
    ai: GoogleGenAI,
    // FIX: The operation object from the API can have a `done` property.
    operation: { name: string; done?: boolean },
    onProgress: (message: string) => void
  ): Promise<T> => {
  // FIX: Explicitly type `currentOperation` to include `done` and `response` properties,
  // which are accessed in the function body.
  let currentOperation: { name: string; done?: boolean; response?: T } = operation;
  let pollCount = 0;
  const maxPolls = 20; // Approx 3.3 minutes max polling time
  
  while (!currentOperation.done && pollCount < maxPolls) {
    pollCount++;
    onProgress(`Đang xử lý... (${pollCount}/${maxPolls}) Vui lòng đợi.`);
    await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
    try {
      // The type assertion is needed here as the SDK types are generic for operations
      currentOperation = await ai.operations.getVideosOperation({ operation: operation }) as { name: string; done?: boolean; response?: T };
    } catch(e) {
      console.error("Polling failed", e);
      // Even if polling fails, we continue to try a few more times
    }
  }

  if (!currentOperation.done) {
    throw new Error("Quá trình tạo video mất quá nhiều thời gian và đã hết thời gian chờ.");
  }

  return currentOperation.response as T;
};


export const generateVideo = async (
  prompt: string,
  imageFile: File | null,
  numVideos: number,
  onProgress: (message: string) => void,
  apiKey: string,
  selectedModel: string
): Promise<string[]> => {
  if (!apiKey) {
    throw new Error("API key không được tìm thấy. Vui lòng cấu hình trong mục Settings.");
  }
  const ai = new GoogleGenAI({ apiKey });

  let imagePayload;
  if (imageFile) {
    onProgress("Đang chuyển đổi hình ảnh...");
    const base64Data = await fileToBase64(imageFile);
    imagePayload = {
      imageBytes: base64Data,
      mimeType: imageFile.type,
    };
  }

  const allModels = ['gemini-3-flash-preview', 'gemini-3-pro-preview', 'gemini-2.5-flash'];
  // Đưa model người dùng chọn lên đầu tiên, sau đó là các model fallback (loại bỏ model đã chọn để tránh trùng)
  const modelsToTry = [selectedModel, ...allModels.filter(m => m !== selectedModel)];

  let operation: any = null;
  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    try {
      if (i === 0) {
        onProgress(`Đang gửi yêu cầu tạo video đến Gemini bằng model ${currentModel}...`);
      } else {
        onProgress(`Model trước quá tải. Đang tự động thử lại bằng model dự phòng: ${currentModel}...`);
      }

      operation = await ai.models.generateVideos({
        model: currentModel, // Áp dụng model từ danh sách fallback
        prompt: prompt,
        image: imagePayload,
        config: {
          numberOfVideos: numVideos,
        }
      });
      
      onProgress(`Yêu cầu gửi qua ${currentModel} thành công. Đang chờ xử lý kết quả...`);
      lastError = null; // Reset lỗi
      break; // Thoát vòng lặp nếu thành công
      
    } catch (err: any) {
      console.error(`Lỗi khi gọi model ${currentModel}:`, err);
      // Giữ lại lỗi nguyên văn từ API (VD: "429 RESOURCE_EXHAUSTED")
      lastError = err;
    }
  }

  // Nếu tất cả các model đều thất bại
  if (lastError) {
    const errorMsg = lastError?.message || JSON.stringify(lastError);
    throw new Error(`${errorMsg}`); // Gửi nguyên văn lỗi về UI để hiển thị "Đã dừng do lỗi" màu đỏ
  }

  const result = await pollOperation<{ generatedVideos?: { video?: { uri: string } }[] }>(ai, operation, onProgress);

  const videoUris = result.generatedVideos?.map(v => v.video?.uri).filter((uri): uri is string => !!uri);

  if (!videoUris || videoUris.length === 0) {
    throw new Error("Không thể tạo video. Vui lòng thử lại với một prompt khác.");
  }
  
  // Append API key to download links
  return videoUris.map(uri => `${uri}&key=${apiKey}`);
};
