"use client";

import { useEffect, useState } from "react";

export interface CompanyOption {
  value: string;
  label: string;
}

export interface AppSettings {
  orgName: string;
  currency: string;
  depreciationRate: number;
  renewalAlertDays: number;
  companies: CompanyOption[];
  departments: string[];
  locations: string[];
}

const DEFAULTS: AppSettings = {
  orgName: "National Group India",
  currency: "INR",
  depreciationRate: 25,
  renewalAlertDays: 30,
  companies: [
    { value: "NCPL", label: "NCPL" },
    { value: "NIPL", label: "NIPL" },
    { value: "NRPL", label: "NRPL" },
    { value: "RAINLAND_AUTO_CORP", label: "Rainland Auto Corp" },
    { value: "ISKY", label: "ISKY" },
    { value: "OTHER", label: "Other" },
  ],
  departments: ["IT", "HR", "Finance", "Operations", "Sales", "Marketing", "Admin", "Management", "Legal", "Engineering"],
  locations: ["Bangalore", "Ankola", "Chickmagalur", "Mumbai", "Delhi", "Chennai", "Hyderabad"],
};

let cached: AppSettings | null = null;
let fetchPromise: Promise<AppSettings> | null = null;

function doFetch(): Promise<AppSettings> {
  return fetch("/api/settings")
    .then((r) => r.json())
    .then((d) => {
      const s: AppSettings = {
        orgName: d.orgName || DEFAULTS.orgName,
        currency: d.currency || DEFAULTS.currency,
        depreciationRate: d.depreciationRate ?? DEFAULTS.depreciationRate,
        renewalAlertDays: d.renewalAlertDays ?? DEFAULTS.renewalAlertDays,
        companies: d.companies?.length ? d.companies : DEFAULTS.companies,
        departments: d.departments?.length ? d.departments : DEFAULTS.departments,
        locations: d.locations?.length ? d.locations : DEFAULTS.locations,
      };
      cached = s;
      return s;
    })
    .catch(() => {
      cached = DEFAULTS;
      return DEFAULTS;
    });
}

export function invalidateSettingsCache() {
  cached = null;
  fetchPromise = null;
}

export function useSettings(): AppSettings {
  const [settings, setSettings] = useState<AppSettings>(cached || DEFAULTS);

  useEffect(() => {
    if (cached) {
      setSettings(cached);
      return;
    }
    if (!fetchPromise) fetchPromise = doFetch();
    fetchPromise.then((s) => setSettings(s));
  }, []);

  return settings;
}
