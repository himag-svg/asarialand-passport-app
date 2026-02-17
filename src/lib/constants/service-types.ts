import type { ServiceType } from "@/types";

export interface ServiceTypeInfo {
  type: ServiceType;
  label: string;
  description: string;
  estimatedWeeks: string;
  price: number;
  currency: string;
}

export const SERVICE_TYPES: ServiceTypeInfo[] = [
  {
    type: "normal",
    label: "Normal Service",
    description: "Standard processing time from submission date in Asarialand",
    estimatedWeeks: "6 to 8 weeks",
    price: 0, // To be configured
    currency: "USD",
  },
  {
    type: "expedited",
    label: "Expedited Service",
    description: "Fast-tracked processing from submission date in Asarialand",
    estimatedWeeks: "2 weeks",
    price: 0, // To be configured
    currency: "USD",
  },
];

export function getServiceTypeInfo(type: ServiceType): ServiceTypeInfo {
  return SERVICE_TYPES.find((s) => s.type === type) ?? SERVICE_TYPES[0];
}
