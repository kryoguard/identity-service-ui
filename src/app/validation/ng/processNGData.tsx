import { DOCUMENT_CAMERA_FLOW } from "@/app/helper/camera-flow";
import { Data, PassportData } from "@/app/helper/types/custom-types";
import { AppError } from "@/app/helper/utils/errorHandler";
import { validateNGPassportData } from "./validatePassport";

const flow = DOCUMENT_CAMERA_FLOW["passport"];

export const processNGData = (text: string): Data => {
    const type = determineDocumentType(text.toLowerCase());
    const initialData: Data = { status: { code: 0, message: "success", nextStep: flow["DOCUMENT_FRONT"] } };

    switch (type) {
        case "Passport":
            return detectOldPassport(text)
                ? processPassportData(text, initialData, "old")
                : processPassportData(text, initialData, "new");
        case "Drivers Licence":
        case "National ID":
            return { ...initialData, status: { code: 1, message: "Unsupported document type", nextStep: flow["DOCUMENT_FRONT"] } };
        default:
            return { ...initialData, status: { code: 1, message: "Unsupported document type", nextStep: flow["DOCUMENT_FRONT"] } };
    }
};

const processPassportData = (text: string, initialData: Data, version: "old" | "new"): PassportData => {
    const passportData: PassportData = { ...initialData, documentType: "Passport" };
    const textSplit = text.split("\n");

    const fieldMappings = {
        old: {
            type: 5,
            countryCode: 7,
            passportNumber: 8,
            surname: 10,
            givenNames: 12,
            nationality: 15,
            dateOfBirth: 18,
            gender: 21,
            placeOfBirth: 22,
            authority: 23,
            dateOfIssue: 26,
            dateOfExpiry: 28,
        },
        new: {
            type: 5,
            countryCode: 6,
            passportNumber: 7,
            surname: 9,
            givenNames: 11,
            nationality: 14,
            previousPassportNumber: 15,
            dateOfBirth: 18,
            nin: 19,
            gender: 21,
            placeOfBirth: 22,
            authority: 26,
            dateOfIssue: 25,
            dateOfExpiry: 29,
        },
    };

    try {
        const mappings = fieldMappings[version];
        for (let i = 0; i < textSplit.length; i++) {
            const line = textSplit[i]?.trim();
            if (i === mappings.type) passportData.type = line;
            else if (i === mappings.countryCode) passportData.countryCode = line;
            else if (i === mappings.passportNumber) passportData.passportNumber = line;
            else if (i === mappings.surname) passportData.surname = line;
            else if (i === mappings.givenNames) passportData.givenNames = line;
            else if (i === mappings.nationality) passportData.nationality = line;
            else if (i === mappings.previousPassportNumber && version === "new") passportData.previousPassportNumber = line;
            else if (i === mappings.nin && version === "new") passportData.nin = line;
            else if (i === mappings.dateOfBirth) {
                const dateSplit = line?.split("/");
                passportData.dateOfBirth = `${dateSplit[0]?.trim()} ${dateSplit[1]?.trim().split(" ")[1]?.trim()}`;
            } else if (i === mappings.gender) {
                if (line?.length === 1) {
                    passportData.gender = line;
                } else {
                    const [gender, placeOfBirth] = line?.split(" ") || [];
                    passportData.gender = gender?.trim();
                    passportData.placeOfBirth = placeOfBirth?.trim();
                    textSplit.splice(i + 1, 0, "-"); // Insert placeholder
                    i++;
                }
            } else if (i === mappings.placeOfBirth) passportData.placeOfBirth = line;
            else if (i === mappings.authority) passportData.authority = line;
            else if (i === mappings.dateOfIssue) {
                const dateSplit = line?.split("/");
                passportData.dateOfIssue = `${dateSplit[0]?.trim()} ${dateSplit[1]?.trim().split(" ")[1]?.trim()}`;
            } else if (i === mappings.dateOfExpiry) {
                const dateSplit = line?.split("/");
                passportData.dateOfExpiry = `${dateSplit[0]?.trim()} ${dateSplit[1]?.trim().split(" ")[1]?.trim()}`;
            }
        }

        const isValid = validateNGPassportData(passportData);
        passportData.status = {
            code: isValid ? 0 : 1,
            message: isValid ? "success" : "invalid data",
            nextStep: isValid ? flow["SELFIE_CAPTURE"] : flow["DOCUMENT_FRONT"],
        };
    } catch (error) {
        throw new AppError(500, `Error processing passport data: ${(error as Error).message}`);
    }

    return passportData;
};

const detectOldPassport = (text: string): boolean => {
    return text.split("\n")[1]?.trim().includes("Type / Type") || false;
};

const determineDocumentType = (text: string): string => {
    if (text.includes("passport")) return "Passport";
    if (text.includes("drivers licence")) return "Drivers Licence";
    if (text.includes("national id")) return "National ID";
    return "Unknown";
};
