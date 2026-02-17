import { z } from "zod";

export const addressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  postal_code: z.string().min(1, "Postal code is required"),
});

export const createRequestSchema = z.object({
  serviceType: z.enum(["normal", "expedited"]),
  currentPassportNumber: z.string().min(1, "Passport number is required"),
  passportExpiryDate: z.string().min(1, "Expiry date is required"),
  address: addressSchema,
});

export const passportFormSchema = z.object({
  surname: z.string().min(1).max(50),
  givenNames: z.string().min(1).max(100),
  previousNames: z.string().optional(),
  dateOfBirth: z.string().min(1),
  placeOfBirth: z.string().min(1),
  countryOfBirth: z.string().min(1),
  sex: z.enum(["M", "F"]),
  height: z.string().optional(),
  colorOfEyes: z.string().optional(),
  colorOfHair: z.string().optional(),
  distinguishingMarks: z.string().optional(),
  nationalityAtBirth: z.string().min(1),
  currentNationality: z.string().min(1),
  citizenshipCertificateNumber: z.string().optional(),
  dateOfCitizenshipGrant: z.string().optional(),
  occupation: z.string().optional(),
  employerName: z.string().optional(),
  employerAddress: z.string().optional(),
  residentialAddress: addressSchema,
  mailingAddress: addressSchema.optional(),
  previousPassportNumber: z.string().min(1),
  dateOfIssue: z.string().optional(),
  placeOfIssue: z.string().optional(),
  dateOfExpiry: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactAddress: z.string().optional(),
});
