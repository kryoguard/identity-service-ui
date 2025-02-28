import { PassportData } from "@/app/helper/types/custom-types";
import { AppError } from "@/app/helper/utils/errorHandler";

export const validateNGPassportData = (data: PassportData): boolean => {
    return !!(
      data.countryCode === "NGA" &&
      data.documentType === "Passport" &&
      data.gender?.length === 1 &&
      (!data.nin || data.nin.length === 11) && // Optional for old passports
      data.passportNumber?.length === 9 &&
      data.dateOfExpiry &&
      !isDocumentExpired(parseDate(data.dateOfExpiry)) &&
      data.dateOfBirth &&
      data.surname &&
      data.givenNames
    );
  };
  
  export const parseDate = (dateString: string): Date => {
    if (!/^\d{2}\s[A-Z]{3}\s\d{2}$/.test(dateString)) {
      throw new AppError(400, 'Invalid date format. Expected "DD MMM YY"');
    }
    const [day, month, year] = dateString.split(" ");
    const months: { [key: string]: number } = {
      JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
      JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
    };
    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
    const date = new Date(fullYear, months[month.toUpperCase()], parseInt(day));
    if (date.getDate() !== parseInt(day)) {
      throw new AppError(400, "Invalid date for given month");
    }
    return date;
  };
  
  export const isDocumentExpired = (expirationDate: Date): boolean => {
    return expirationDate < new Date();
  };