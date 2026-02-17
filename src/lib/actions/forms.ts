"use server";

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface PassportFormData {
  surname?: string;
  givenNames?: string;
  previousNames?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  countryOfBirth?: string;
  sex?: string;
  height?: string;
  colorOfEyes?: string;
  colorOfHair?: string;
  distinguishingMarks?: string;
  nationalityAtBirth?: string;
  currentNationality?: string;
  citizenshipCertificateNumber?: string;
  dateOfCitizenshipGrant?: string;
  occupation?: string;
  employerName?: string;
  residentialAddressLine1?: string;
  residentialAddressLine2?: string;
  residentialCity?: string;
  residentialCountry?: string;
  residentialPostalCode?: string;
  previousPassportNumber?: string;
  dateOfIssue?: string;
  placeOfIssue?: string;
  dateOfExpiry?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactAddress?: string;
}

export async function generateApplicationPdf(applicationId: string) {
  const supabase = await createClient();

  const { data: application, error } = await supabase
    .from("applications")
    .select("*, client:profiles!applications_client_id_fkey(*)")
    .eq("id", applicationId)
    .single();

  if (error || !application) {
    return { error: "Application not found" };
  }

  const formData = application.application_form_data as PassportFormData | null;
  if (!formData) {
    return { error: "Application form has not been completed" };
  }

  try {
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Courier);
    const boldFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

    const page = pdfDoc.addPage([612, 792]); // US Letter
    const { height } = page.getSize();

    let y = height - 50;
    const leftMargin = 50;
    const labelSize = 8;
    const valueSize = 10;
    const lineHeight = 18;

    // Helper: draw a field
    const drawField = (label: string, value: string) => {
      page.drawText(label.toUpperCase(), {
        x: leftMargin,
        y,
        size: labelSize,
        font: boldFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 12;
      page.drawText((value || "N/A").toUpperCase(), {
        x: leftMargin,
        y,
        size: valueSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    };

    const drawSection = (title: string) => {
      y -= 8;
      page.drawText(title.toUpperCase(), {
        x: leftMargin,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.6),
      });
      y -= 4;
      page.drawLine({
        start: { x: leftMargin, y },
        end: { x: 562, y },
        thickness: 0.5,
        color: rgb(0.1, 0.2, 0.6),
      });
      y -= lineHeight;
    };

    // Title
    page.drawText("REPUBLIC OF ASARIALAND", {
      x: 170,
      y,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 20;
    page.drawText("PASSPORT APPLICATION FORM", {
      x: 185,
      y,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 10;
    page.drawText(`Reference: ${application.reference_number}`, {
      x: 220,
      y,
      size: 8,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 30;

    // Section A
    drawSection("Section A: Personal Details");
    drawField("Surname", formData.surname ?? "");
    drawField("Given Names", formData.givenNames ?? "");
    drawField("Previous Names", formData.previousNames ?? "");
    drawField("Date of Birth", formData.dateOfBirth ?? "");
    drawField("Place of Birth", formData.placeOfBirth ?? "");
    drawField("Country of Birth", formData.countryOfBirth ?? "");
    drawField("Sex", formData.sex ?? "");
    drawField("Height", formData.height ?? "");
    drawField("Eye Color", formData.colorOfEyes ?? "");
    drawField("Hair Color", formData.colorOfHair ?? "");

    // New page for remaining sections
    const page2 = pdfDoc.addPage([612, 792]);
    y = height - 50;

    const drawField2 = (label: string, value: string) => {
      page2.drawText(label.toUpperCase(), {
        x: leftMargin,
        y,
        size: labelSize,
        font: boldFont,
        color: rgb(0.4, 0.4, 0.4),
      });
      y -= 12;
      page2.drawText((value || "N/A").toUpperCase(), {
        x: leftMargin,
        y,
        size: valueSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    };

    const drawSection2 = (title: string) => {
      y -= 8;
      page2.drawText(title.toUpperCase(), {
        x: leftMargin,
        y,
        size: 11,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.6),
      });
      y -= 4;
      page2.drawLine({
        start: { x: leftMargin, y },
        end: { x: 562, y },
        thickness: 0.5,
        color: rgb(0.1, 0.2, 0.6),
      });
      y -= lineHeight;
    };

    drawSection2("Section B: Nationality");
    drawField2("Nationality at Birth", formData.nationalityAtBirth ?? "");
    drawField2("Current Nationality", formData.currentNationality ?? "");
    drawField2("Citizenship Certificate #", formData.citizenshipCertificateNumber ?? "");
    drawField2("Date of Citizenship Grant", formData.dateOfCitizenshipGrant ?? "");

    drawSection2("Section C: Occupation & Address");
    drawField2("Occupation", formData.occupation ?? "");
    drawField2("Employer", formData.employerName ?? "");
    drawField2("Residential Address",
      [formData.residentialAddressLine1, formData.residentialAddressLine2, formData.residentialCity, formData.residentialCountry, formData.residentialPostalCode]
        .filter(Boolean)
        .join(", ")
    );

    drawSection2("Section D: Previous Passport");
    drawField2("Passport Number", formData.previousPassportNumber ?? "");
    drawField2("Date of Issue", formData.dateOfIssue ?? "");
    drawField2("Place of Issue", formData.placeOfIssue ?? "");
    drawField2("Date of Expiry", formData.dateOfExpiry ?? "");

    drawSection2("Section E: Emergency Contact");
    drawField2("Name", formData.emergencyContactName ?? "");
    drawField2("Relationship", formData.emergencyContactRelationship ?? "");
    drawField2("Phone", formData.emergencyContactPhone ?? "");
    drawField2("Address", formData.emergencyContactAddress ?? "");

    // Signature area
    y -= 20;
    page2.drawText("APPLICANT SIGNATURE:", {
      x: leftMargin,
      y,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 5;
    page2.drawLine({
      start: { x: leftMargin, y },
      end: { x: 300, y },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });
    y -= 15;
    page2.drawText("DATE:", {
      x: leftMargin,
      y,
      size: 9,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    page2.drawLine({
      start: { x: 90, y },
      end: { x: 300, y },
      thickness: 0.5,
      color: rgb(0, 0, 0),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `${application.reference_number}-application-form.pdf`;
    const filePath = `${applicationId}/forms/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("passport-forms")
      .upload(filePath, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return { error: `Upload failed: ${uploadError.message}` };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("passport-forms")
      .getPublicUrl(filePath);

    revalidatePath(`/admin/requests/${applicationId}`);

    return { success: true, filePath, publicUrl: urlData.publicUrl };
  } catch (err) {
    return {
      error: `PDF generation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}
