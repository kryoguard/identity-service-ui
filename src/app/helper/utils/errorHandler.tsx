export class AppError extends Error {
    constructor(public code: number, message: string) {
      super(message);
      this.name = "AppError";
    }
  }
  
  export function handleError(err: unknown, defaultMessage: string = "An error occurred"): string {
    if (err instanceof AppError) {
      return `${err.message} (Code: ${err.code})`;
    } else if (err instanceof Error) {
      return `${defaultMessage}: ${err.message}`;
    }
    return defaultMessage;
  }

  export function getErrorMessage(isSelfie: boolean, erroMsg?: string): string {
    if (isSelfie) return erroMsg || "Please ensure your selfie is clear and well-lit.";
    if (erroMsg === "Unsupported document type") {
      return "This type of document isn't currently supported. Please use a valid passport or national ID card.";
    }
    return "Make sure the text on the document is clear and readable. Avoid any glare or shadows that might obscure the text.";
  }