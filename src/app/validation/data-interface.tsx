export interface BaseData {
    status: {
        code: number;
        message: string;
        nextStep: string;
    }
}
export interface Data extends BaseData {
    documentType?: string;
    dateOfBirth?: string;
    gender?: string;
    dateOfIssue?: string;
    dateOfExpiry?: string;
}

export interface PassportData extends Data {
    type?: string;
    countryCode?: string;
    passportNumber?: string;
    surname?: string;
    givenNames?: string;
    nationality?: string;
    previousPassportNumber?: string;
    nin?: string;
    placeOfBirth?: string;
    authority?: string;
    mrz?: string;
}