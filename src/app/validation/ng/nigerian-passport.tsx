import { DOCUMENT_CAMERA_FLOW } from "@/app/helper/camera-flow";
import { Data, PassportData } from "../data-interface";

const flow = DOCUMENT_CAMERA_FLOW["passport"];
let data: Data = { status: { code: 0, message: "success", nextStep: flow["DOCUMENT_FRONT"] } };

export const processNGData = (text: string): Data => {
    const type = determinDocumentType(text);
    console.log(type);

    switch (type) {
        case 'Passport':

            if (detectOldPassport(text)) {
                data = processOldPassportData(text);
            } else {
                data = processNewPassportData(text);
            }

            break;
        case "Drivers Licence":
            throw new Error("Nigerian Driver's Licence not supported yet");
            break;
        case 'National ID':
            throw new Error('Nigerian National ID not supported yet');
            break;
        default:
            throw new Error('Nigerian Unsupported document type');
            break;
    }
    return data;
};

const processOldPassportData = (text: string): PassportData => {
    const passportData: PassportData = { ...data };

    console.log("detect old passport");

    let textSplit = text.split('\n');
    try {
        for (let i = 0; i < textSplit.length; i++) {
            if (i == 1) {
                data.documentType = "Passport";
            } else if (i == 5) {
                passportData.type = textSplit[i].trim();
            } else if (i == 7) {
                passportData.countryCode = textSplit[i].trim();
            } else if (i == 8) {
                passportData.passportNumber = textSplit[i].trim();
            } else if (i == 10) {
                passportData.surname = textSplit[i].trim();
            } else if (i == 12) {
                passportData.givenNames = textSplit[i].trim();
            } else if (i == 15) {
                passportData.nationality = textSplit[i].trim();
            }
            /*else if (i == 15) {
                data.previousPassportNumber = textSplit[i].trim();
            } */
            else if (i == 18) {
                const dateSplit = textSplit[i].trim().split('/');
                passportData.dateOfBirth = dateSplit[0].trim() + ' ' + dateSplit[1].trim().split(' ')[1].trim();
            } else if (i == 21) {
                data.gender = textSplit[i].trim();

                if (textSplit[i].trim().length == 1) {
                    passportData.gender = textSplit[i].trim();
                } else {
                    const genderPOB = textSplit[i].trim().split(' ');
                    passportData.gender = genderPOB[0].trim();
                    passportData.placeOfBirth = genderPOB[1].trim();
                    textSplit = insertAt(textSplit, '-', i + 1);
                    i++;
                }

            } else if (i == 22) {
                passportData.placeOfBirth = textSplit[i].trim();
            } else if (i === 23) {
                passportData.authority = textSplit[i].trim();
            } else if (i == 26) {
                const dateSplit = textSplit[i].trim().split('/');
                passportData.dateOfIssue = dateSplit[0].trim() + ' ' + dateSplit[1].trim().split(' ')[1].trim();
            } else if (i == 28) {
                const dateSplit = textSplit[i].trim().split('/');
                passportData.dateOfExpiry = dateSplit[0].trim() + ' ' + dateSplit[1].trim().split(' ')[1].trim();
            }
        }
    } catch (error) {
        console.error(error);
    }

    const isValid = validateNGPassportData(passportData);
    passportData.status.code = isValid ? 0 : 1;
    passportData.status.message = isValid ? "success" : "invalid data";
    passportData.status.nextStep = isValid ? flow["SELFIE_CAPTURE"] : flow["DOCUMENT_FRONT"];

    return passportData;
};

const processNewPassportData = (text: string): PassportData => {
    const passportData: PassportData = { ...data };

    let textSplit = text.split('\n');
    try {
        for (let i = 0; i < textSplit.length; i++) {
            if (i == 1) {
                passportData.documentType = textSplit[i].trim().split('/')[0].trim();
            } else if (i == 5) {
                passportData.type = textSplit[i].trim();
            } else if (i == 6) {
                passportData.countryCode = textSplit[i].trim();
            } else if (i == 7) {
                passportData.passportNumber = textSplit[i].trim();
            } else if (i == 9) {
                passportData.surname = textSplit[i].trim();
            } else if (i == 11) {
                passportData.givenNames = textSplit[i].trim();
            } else if (i == 14) {
                passportData.nationality = textSplit[i].trim();
            } else if (i == 15) {
                passportData.previousPassportNumber = textSplit[i].trim();
            } else if (i == 18) {
                const dateSplit = textSplit[i].trim().split('/');
                passportData.dateOfBirth = dateSplit[0]?.trim() + ' ' + dateSplit[1]?.trim().split(' ')[1]?.trim();
            } else if (i == 19) {
                passportData.nin = textSplit[i].trim();
            } else if (i == 21) {
                if (textSplit[i].trim().length == 1) {
                    passportData.gender = textSplit[i].trim();
                } else {
                    const genderPOB = textSplit[i].trim().split(' ');
                    passportData.gender = genderPOB[0].trim();
                    passportData.placeOfBirth = genderPOB[1].trim();
                    textSplit = insertAt(textSplit, '-', i + 1);
                    i++;
                }

            } else if (i == 22) {
                passportData.placeOfBirth = textSplit[i].trim();
            } else if (i == 25) {
                const dateSplit = textSplit[i].trim().split('/');
                passportData.dateOfIssue = dateSplit[0].trim() + ' ' + dateSplit[1].trim().split(' ')[1].trim();
            } else if (i == 26) {
                passportData.authority = textSplit[i].trim();
            } else if (i == 29) {
                const dateSplit = textSplit[i].trim().split('/');
                passportData.dateOfExpiry = dateSplit[0].trim() + ' ' + dateSplit[1].trim().split(' ')[1].trim();
            }
        }
    } catch (error) {
        console.error(error);
    }

    const isValid = validateNGPassportData(passportData);
    passportData.status.code = isValid ? 0 : 1;
    passportData.status.message = isValid ? "success" : "invalid data";
    passportData.status.nextStep = isValid ? flow["SELFIE_CAPTURE"] : flow["DOCUMENT_FRONT"];
    return passportData;
};

const detectOldPassport = (text: string): boolean => {
    const textSplit = text.split('\n');
    let result = false;

    try {
        result = textSplit[1].trim().includes('Type / Type');
    } catch (error) {
        console.error(error);
    }
    return result;
}

interface InsertAt {
    <T>(array: T[], element: T, position: number): T[];
}

const insertAt: InsertAt = (array, element, position) => {
    // Make a copy of the array to avoid modifying the original
    const newArray = [...array];

    // Check if position is valid
    if (position < 0 || position > array.length) {
        throw new Error('Invalid position');
    }

    // Insert element at specified position
    newArray.splice(position, 0, element);

    return newArray;
}

export const validateNGPassportData = (data: PassportData): boolean => {
    return !!(
        (data.countryCode && data.countryCode.length === 3 && data.countryCode === 'NGA') &&
        (data.documentType && data.documentType === 'Passport') &&
        (data.gender && data.gender.length === 1) &&
        (data.nin && data.nin.length === 11) &&
        (data.passportNumber && data.passportNumber.length === 9) &&
        (data.dateOfExpiry && !isDocumentExpired(parseDate(data.dateOfExpiry))) &&
        data.dateOfBirth && data.surname && data.givenNames && data
    );
};

const parseDate = (dateString: string): Date => {
    try {
        // Check format
        if (!/^\d{2}\s[A-Z]{3}\s\d{2}$/.test(dateString)) {
            throw new Error('Invalid date format. Expected "DD MMM YY"');
        }

        const [day, month, year] = dateString.split(' ');

        const months = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3,
            'MAY': 4, 'JUN': 5, 'JUL': 6, 'AUG': 7,
            'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
        };

        if (!months.hasOwnProperty(month.toUpperCase())) {
            throw new Error('Invalid month abbreviation');
        }

        const dayNum = parseInt(day);
        if (dayNum < 1 || dayNum > 31) {
            throw new Error('Invalid day');
        }

        const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
        const date = new Date(fullYear, months[month.toUpperCase() as keyof typeof months], dayNum);

        // Check if date is valid (e.g., not 31st of February)
        if (date.getDate() !== dayNum) {
            throw new Error('Invalid date for given month');
        }

        return date;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to parse date: ${error.message}`);
        } else {
            throw new Error('Failed to parse date: Unknown error');
        }
    }
}

export const isDocumentExpired = (expirationDate: Date) => {
    const today = new Date();
    return expirationDate < today;
}

const determinDocumentType = (text: string): string => {
    text = text.toLowerCase();
    if (text.includes('passport')) {
        return 'Passport';
    } else if (text.includes("drivers licence")) {
        return "Drivers Licence";
    } else if (text.includes('National ID')) {
        return 'National ID';
    } else {
        return 'Unknown';
    }
}