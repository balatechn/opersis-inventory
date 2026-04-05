"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Download } from "lucide-react";

interface BulkUploadProps {
  entityName: string;
  sampleHeaders: string[];
  sampleRow: string[];
  apiEndpoint: string;
  onComplete: () => void;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current.trim());
        current = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(current.trim());
        if (row.some((c) => c !== "")) rows.push(row);
        row = [];
        current = "";
      } else {
        current += ch;
      }
    }
  }
  row.push(current.trim());
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

export function BulkUpload({ entityName, sampleHeaders, sampleRow, apiEndpoint, onComplete }: BulkUploadProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] }>({ success: 0, failed: 0, errors: [] });
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep("upload");
    setHeaders([]);
    setRows([]);
    setResults({ success: 0, failed: 0, errors: [] });
  };

  const handleOpen = () => { reset(); setOpen(true); };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length < 2) return;
      setHeaders(parsed[0]);
      setRows(parsed.slice(1));
      setStep("preview");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const csv = [sampleHeaders.join(","), sampleRow.join(",")].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${entityName.toLowerCase().replace(/\s/g, "_")}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers, rows }),
      });
      const data = await res.json();
      setResults({ success: data.success || 0, failed: data.failed || 0, errors: data.errors || [] });
      setStep("result");
      if (data.success > 0) onComplete();
    } catch {
      setResults({ success: 0, failed: rows.length, errors: ["Network error. Please try again."] });
      setStep("result");
    }
    setUploading(false);
  };

  return (
    <>
      <Button size="sm" variant="outline" className="gap-1.5" onClick={handleOpen}>
        <Upload className="h-4 w-4" />Bulk Upload
      </Button>
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Bulk Upload {entityName}
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file to import multiple {entityName.toLowerCase()} records at once.
            </DialogDescription>
          </DialogHeader>

          {step === "upload" && (
            <div className="space-y-4 py-4">
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition"
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">Click to select a CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv files with headers in the first row</p>
              </div>
              <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Need a template?</p>
                  <p className="text-xs text-muted-foreground">Download a sample CSV with the expected columns</p>
                </div>
                <Button size="sm" variant="outline" onClick={downloadTemplate} className="gap-1.5">
                  <Download className="h-4 w-4" />Template
                </Button>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <p className="text-sm"><strong>{rows.length}</strong> rows found, <strong>{headers.length}</strong> columns</p>
                <Badge variant="outline">{rows.length} records</Badge>
              </div>
              <div className="overflow-x-auto border rounded-lg max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs w-10">#</TableHead>
                      {headers.map((h, i) => (<TableHead key={i} className="text-xs whitespace-nowrap">{h}</TableHead>))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 10).map((row, ri) => (
                      <TableRow key={ri}>
                        <TableCell className="text-xs text-muted-foreground">{ri + 1}</TableCell>
                        {row.map((cell, ci) => (<TableCell key={ci} className="text-xs whitespace-nowrap max-w-[200px] truncate">{cell || "—"}</TableCell>))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {rows.length > 10 && <p className="text-xs text-muted-foreground text-center">Showing first 10 of {rows.length} rows</p>}
              <DialogFooter>
                <Button variant="outline" onClick={reset}>Back</Button>
                <Button onClick={handleUpload} disabled={uploading} className="gap-1.5">
                  {uploading ? "Importing..." : `Import ${rows.length} Records`}
                </Button>
              </DialogFooter>
            </div>
          )}

          {step === "result" && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{results.success}</p>
                  <p className="text-xs text-muted-foreground">Imported</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-xl">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-1 text-red-600" />
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">{results.failed}</p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              </div>
              {results.errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 max-h-[150px] overflow-y-auto">
                  <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">Errors:</p>
                  {results.errors.slice(0, 20).map((err, i) => (
                    <p key={i} className="text-xs text-red-600 dark:text-red-400">{err}</p>
                  ))}
                </div>
              )}
              <DialogFooter>
                <Button onClick={() => setOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
