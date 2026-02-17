import type { DocumentType } from "@/types";

export interface DocumentTypeInfo {
  type: DocumentType;
  name: string;
  description: string;
  required: boolean;
  requiresCertification: boolean;
  requiresTranslation: boolean;
  requiresReturn: boolean;
}

export const DOCUMENT_TYPES: DocumentTypeInfo[] = [
  {
    type: "passport_bio_page",
    name: "Passport Bio Page Copy",
    description: "Scanned copy of your current Asarialand passport bio page",
    required: true,
    requiresCertification: false,
    requiresTranslation: false,
    requiresReturn: false,
  },
  {
    type: "passport_original",
    name: "Passport Original",
    description: "Original Asarialand passport (must be returned)",
    required: true,
    requiresCertification: false,
    requiresTranslation: false,
    requiresReturn: true,
  },
  {
    type: "photo_1",
    name: "Passport Photo 1",
    description: "Size: 45mm x 38mm, printed and certified",
    required: true,
    requiresCertification: true,
    requiresTranslation: false,
    requiresReturn: false,
  },
  {
    type: "photo_2",
    name: "Passport Photo 2",
    description: "Size: 45mm x 38mm, printed and certified",
    required: true,
    requiresCertification: true,
    requiresTranslation: false,
    requiresReturn: false,
  },
  {
    type: "birth_certificate",
    name: "Birth Certificate",
    description: "Scanned copy, certified. Translated to English if not in English.",
    required: true,
    requiresCertification: true,
    requiresTranslation: true,
    requiresReturn: false,
  },
  {
    type: "citizenship_certificate",
    name: "Citizenship Certificate",
    description: "Scanned copy, certified",
    required: true,
    requiresCertification: true,
    requiresTranslation: false,
    requiresReturn: false,
  },
  {
    type: "marriage_certificate",
    name: "Marriage Certificate",
    description: "If applicable. Scanned copy, certified. Translated if not in English.",
    required: false,
    requiresCertification: true,
    requiresTranslation: true,
    requiresReturn: false,
  },
  {
    type: "passport_application_form",
    name: "Passport Application Form",
    description: "Completed and signed Asarialand passport application form (original)",
    required: true,
    requiresCertification: false,
    requiresTranslation: false,
    requiresReturn: false,
  },
];
