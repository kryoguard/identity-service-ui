import { analyzeWithTextract, detectFace } from "@/app/helper/awssdk-services";
import { CapturedImage } from "@/app/helper/types/custom-types";

export async function captureImage(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
): Promise<CapturedImage> {
    if (!videoRef.current || !canvasRef.current) {
        throw new Error("Camera or canvas not initialized");
    }

    const { videoWidth, videoHeight } = videoRef.current;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
    const src = canvasRef.current.toDataURL("image/png");
    console.debug("Captured image set:", src.substring(0, 50) + "...");

    return { src, width: videoWidth, height: videoHeight };
}

export async function processImage(
    image: CapturedImage,
    isSelfie: boolean,
    toggleCamera: () => Promise<void>
): Promise<{ error?: string }> {
    const imageBytes = await new Promise<Uint8Array>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0);
            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject(new Error("Failed to create blob"));
                    const reader = new FileReader();
                    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
                    reader.onerror = () => reject(new Error("Error reading blob"));
                    reader.readAsArrayBuffer(blob);
                },
                "image/png",
                0.9
            );
        };
        img.src = image.src;
    });

    if (!isSelfie) {
        const result = await analyzeWithTextract(imageBytes);
        console.debug("Textract result:", result);
        if (result.data.status.code === 0 && result.data.status.nextStep === "SELFIE_CAPTURE") {
            await toggleCamera();
            return {};
        } else {
            return { error: result.data.status.message };
        }
    } else {
        const faceData = await detectFace(imageBytes);
        console.debug("Face detection result:", faceData);
        if (faceData.status.code !== 0) {
            return { error: faceData.status.message };
        }
        return {};
    }
}