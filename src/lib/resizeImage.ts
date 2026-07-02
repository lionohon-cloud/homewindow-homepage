/**
 * 업로드 전 이미지 리사이즈/압축 (브라우저 canvas).
 *
 * 후기 사진은 폰 원본이 3~10MB라 그대로 올리면 업로드가 매우 느리다.
 * 장변을 MAX_EDGE 로 줄이고 JPEG 로 재인코딩해 전송량을 크게 낮춘다.
 *   예) 4032x3024 3MB → 1600x1200 ~300KB
 *
 * canvas 가 못 읽는 포맷(일부 HEIC 등)이나 변환 실패 시 원본 File 을 그대로 반환한다(안전).
 */

const MAX_EDGE = 1600; // 장변 최대 px
const QUALITY = 0.82; // JPEG 품질

export async function resizeImageFile(file: File): Promise<File> {
  // 이미지가 아니거나 이미 충분히 작으면 그대로
  if (!file.type.startsWith("image/")) return file;

  try {
    const bitmap = await loadBitmap(file);
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));

    // 리사이즈 불필요 + 원본이 작으면 그대로 (재인코딩 이득 없음)
    if (scale === 1 && file.size < 600 * 1024) {
      close(bitmap);
      return file;
    }

    const w = Math.round(width * scale);
    const h = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      close(bitmap);
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    close(bitmap);

    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );
    if (!blob || blob.size >= file.size) return file; // 변환 이득 없으면 원본

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file; // 실패 시 원본 유지
  }
}

/** createImageBitmap 우선(빠름), 실패 시 <img> 폴백 */
async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fall through */
    }
  }
  return await new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

function close(b: ImageBitmap | HTMLImageElement) {
  if (typeof ImageBitmap !== "undefined" && b instanceof ImageBitmap) b.close();
}
