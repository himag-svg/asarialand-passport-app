"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Application } from "@/types";

interface PassportFormData {
  surname: string;
  givenNames: string;
  previousNames: string;
  dateOfBirth: string;
  placeOfBirth: string;
  countryOfBirth: string;
  sex: "M" | "F" | "";
  height: string;
  colorOfEyes: string;
  colorOfHair: string;
  distinguishingMarks: string;
  nationalityAtBirth: string;
  currentNationality: string;
  citizenshipCertificateNumber: string;
  dateOfCitizenshipGrant: string;
  occupation: string;
  employerName: string;
  employerAddress: string;
  residentialAddressLine1: string;
  residentialAddressLine2: string;
  residentialCity: string;
  residentialCountry: string;
  residentialPostalCode: string;
  mailingAddressSame: boolean;
  mailingAddressLine1: string;
  mailingAddressLine2: string;
  mailingCity: string;
  mailingCountry: string;
  mailingPostalCode: string;
  previousPassportNumber: string;
  dateOfIssue: string;
  placeOfIssue: string;
  dateOfExpiry: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  emergencyContactAddress: string;
}

const EMPTY_FORM: PassportFormData = {
  surname: "",
  givenNames: "",
  previousNames: "",
  dateOfBirth: "",
  placeOfBirth: "",
  countryOfBirth: "",
  sex: "",
  height: "",
  colorOfEyes: "",
  colorOfHair: "",
  distinguishingMarks: "",
  nationalityAtBirth: "",
  currentNationality: "",
  citizenshipCertificateNumber: "",
  dateOfCitizenshipGrant: "",
  occupation: "",
  employerName: "",
  employerAddress: "",
  residentialAddressLine1: "",
  residentialAddressLine2: "",
  residentialCity: "",
  residentialCountry: "",
  residentialPostalCode: "",
  mailingAddressSame: true,
  mailingAddressLine1: "",
  mailingAddressLine2: "",
  mailingCity: "",
  mailingCountry: "",
  mailingPostalCode: "",
  previousPassportNumber: "",
  dateOfIssue: "",
  placeOfIssue: "",
  dateOfExpiry: "",
  emergencyContactName: "",
  emergencyContactRelationship: "",
  emergencyContactPhone: "",
  emergencyContactAddress: "",
};

// BLOCK letter input style
const blockInputClass =
  "mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-accent focus:outline-none uppercase font-mono tracking-widest";

const dateInputClass =
  "mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-accent focus:outline-none";

interface Props {
  application: Application;
}

export function PassportFormEditor({ application }: Props) {
  const existing = application.application_form_data as PassportFormData | null;
  const [form, setForm] = useState<PassportFormData>(existing ?? EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const update = (field: keyof PassportFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("applications")
        .update({
          application_form_data: form,
          form_completed_at: new Date().toISOString(),
        })
        .eq("id", application.id);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Application form saved");
        router.refresh();
      }
    });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-surface-900 p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-500">
            Asarialand Passport Application Form
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            All text fields must be typed in BLOCK LETTERS. No handwriting or
            erasures.
          </p>
        </div>
        {application.form_completed_at && (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400">
            Saved
          </span>
        )}
      </div>

      <div className="mt-6 space-y-8">
        {/* Section A: Personal Details */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-accent">
            Section A: Personal Details
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Surname *
              </label>
              <input
                type="text"
                value={form.surname}
                onChange={(e) => update("surname", e.target.value)}
                className={blockInputClass}
                placeholder="SURNAME"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Given Names *
              </label>
              <input
                type="text"
                value={form.givenNames}
                onChange={(e) => update("givenNames", e.target.value)}
                className={blockInputClass}
                placeholder="GIVEN NAMES"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Previous Names (if any)
            </label>
            <input
              type="text"
              value={form.previousNames}
              onChange={(e) => update("previousNames", e.target.value)}
              className={blockInputClass}
              placeholder="PREVIOUS NAMES"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Date of Birth *
              </label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className={dateInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Place of Birth *
              </label>
              <input
                type="text"
                value={form.placeOfBirth}
                onChange={(e) => update("placeOfBirth", e.target.value)}
                className={blockInputClass}
                placeholder="PLACE OF BIRTH"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Country of Birth *
              </label>
              <input
                type="text"
                value={form.countryOfBirth}
                onChange={(e) => update("countryOfBirth", e.target.value)}
                className={blockInputClass}
                placeholder="COUNTRY"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Sex *
              </label>
              <select
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
                className={dateInputClass}
              >
                <option value="">Select</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Height
              </label>
              <input
                type="text"
                value={form.height}
                onChange={(e) => update("height", e.target.value)}
                className={blockInputClass}
                placeholder="E.G. 175CM"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Eye Color
              </label>
              <input
                type="text"
                value={form.colorOfEyes}
                onChange={(e) => update("colorOfEyes", e.target.value)}
                className={blockInputClass}
                placeholder="BROWN"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Hair Color
              </label>
              <input
                type="text"
                value={form.colorOfHair}
                onChange={(e) => update("colorOfHair", e.target.value)}
                className={blockInputClass}
                placeholder="BLACK"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">
              Distinguishing Marks
            </label>
            <input
              type="text"
              value={form.distinguishingMarks}
              onChange={(e) => update("distinguishingMarks", e.target.value)}
              className={blockInputClass}
              placeholder="NONE"
            />
          </div>
        </fieldset>

        {/* Section B: Nationality */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-accent">
            Section B: Nationality
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Nationality at Birth *
              </label>
              <input
                type="text"
                value={form.nationalityAtBirth}
                onChange={(e) => update("nationalityAtBirth", e.target.value)}
                className={blockInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Current Nationality *
              </label>
              <input
                type="text"
                value={form.currentNationality}
                onChange={(e) => update("currentNationality", e.target.value)}
                className={blockInputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Citizenship Certificate #
              </label>
              <input
                type="text"
                value={form.citizenshipCertificateNumber}
                onChange={(e) =>
                  update("citizenshipCertificateNumber", e.target.value)
                }
                className={blockInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Date of Citizenship Grant
              </label>
              <input
                type="date"
                value={form.dateOfCitizenshipGrant}
                onChange={(e) =>
                  update("dateOfCitizenshipGrant", e.target.value)
                }
                className={dateInputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Section C: Occupation & Address */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-accent">
            Section C: Occupation & Address
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Occupation
              </label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => update("occupation", e.target.value)}
                className={blockInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Employer Name
              </label>
              <input
                type="text"
                value={form.employerName}
                onChange={(e) => update("employerName", e.target.value)}
                className={blockInputClass}
              />
            </div>
          </div>

          <h4 className="text-xs font-medium text-slate-400">
            Residential Address
          </h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={form.residentialAddressLine1}
              onChange={(e) =>
                update("residentialAddressLine1", e.target.value)
              }
              className={blockInputClass}
              placeholder="ADDRESS LINE 1"
            />
            <input
              type="text"
              value={form.residentialAddressLine2}
              onChange={(e) =>
                update("residentialAddressLine2", e.target.value)
              }
              className={blockInputClass}
              placeholder="ADDRESS LINE 2"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              type="text"
              value={form.residentialCity}
              onChange={(e) => update("residentialCity", e.target.value)}
              className={blockInputClass}
              placeholder="CITY"
            />
            <input
              type="text"
              value={form.residentialCountry}
              onChange={(e) => update("residentialCountry", e.target.value)}
              className={blockInputClass}
              placeholder="COUNTRY"
            />
            <input
              type="text"
              value={form.residentialPostalCode}
              onChange={(e) => update("residentialPostalCode", e.target.value)}
              className={blockInputClass}
              placeholder="POSTAL CODE"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={form.mailingAddressSame}
              onChange={(e) => update("mailingAddressSame", e.target.checked)}
            />
            Mailing address same as residential
          </label>

          {!form.mailingAddressSame && (
            <>
              <h4 className="text-xs font-medium text-slate-400">
                Mailing Address
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  value={form.mailingAddressLine1}
                  onChange={(e) =>
                    update("mailingAddressLine1", e.target.value)
                  }
                  className={blockInputClass}
                  placeholder="ADDRESS LINE 1"
                />
                <input
                  type="text"
                  value={form.mailingAddressLine2}
                  onChange={(e) =>
                    update("mailingAddressLine2", e.target.value)
                  }
                  className={blockInputClass}
                  placeholder="ADDRESS LINE 2"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input
                  type="text"
                  value={form.mailingCity}
                  onChange={(e) => update("mailingCity", e.target.value)}
                  className={blockInputClass}
                  placeholder="CITY"
                />
                <input
                  type="text"
                  value={form.mailingCountry}
                  onChange={(e) => update("mailingCountry", e.target.value)}
                  className={blockInputClass}
                  placeholder="COUNTRY"
                />
                <input
                  type="text"
                  value={form.mailingPostalCode}
                  onChange={(e) =>
                    update("mailingPostalCode", e.target.value)
                  }
                  className={blockInputClass}
                  placeholder="POSTAL CODE"
                />
              </div>
            </>
          )}
        </fieldset>

        {/* Section D: Previous Passport */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-accent">
            Section D: Previous Passport
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Previous Passport Number *
              </label>
              <input
                type="text"
                value={form.previousPassportNumber}
                onChange={(e) =>
                  update("previousPassportNumber", e.target.value)
                }
                className={blockInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Place of Issue
              </label>
              <input
                type="text"
                value={form.placeOfIssue}
                onChange={(e) => update("placeOfIssue", e.target.value)}
                className={blockInputClass}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Date of Issue
              </label>
              <input
                type="date"
                value={form.dateOfIssue}
                onChange={(e) => update("dateOfIssue", e.target.value)}
                className={dateInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Date of Expiry
              </label>
              <input
                type="date"
                value={form.dateOfExpiry}
                onChange={(e) => update("dateOfExpiry", e.target.value)}
                className={dateInputClass}
              />
            </div>
          </div>
        </fieldset>

        {/* Section E: Emergency Contact */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-wider text-accent">
            Section E: Emergency Contact
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Contact Name
              </label>
              <input
                type="text"
                value={form.emergencyContactName}
                onChange={(e) =>
                  update("emergencyContactName", e.target.value)
                }
                className={blockInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Relationship
              </label>
              <input
                type="text"
                value={form.emergencyContactRelationship}
                onChange={(e) =>
                  update("emergencyContactRelationship", e.target.value)
                }
                className={blockInputClass}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Phone
              </label>
              <input
                type="text"
                value={form.emergencyContactPhone}
                onChange={(e) =>
                  update("emergencyContactPhone", e.target.value)
                }
                className={blockInputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300">
                Address
              </label>
              <input
                type="text"
                value={form.emergencyContactAddress}
                onChange={(e) =>
                  update("emergencyContactAddress", e.target.value)
                }
                className={blockInputClass}
              />
            </div>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="w-full rounded-lg bg-accent py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Application Form"}
        </button>
      </div>
    </div>
  );
}
