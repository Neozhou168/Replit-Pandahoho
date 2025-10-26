import { useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, Download, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CSVImportProps<T> {
  onImport: (data: T[]) => Promise<void>;
  templateData: T;
  templateFilename: string;
  requiredColumns: string[];
  validateRow?: (row: any) => { valid: boolean; errors: string[] };
  transformRow?: (row: any) => T;
  title?: string;
  description?: string;
}

export function CSVImport<T extends Record<string, any>>({
  onImport,
  templateData,
  templateFilename,
  requiredColumns,
  validateRow,
  transformRow,
  title = "Import CSV",
  description = "Upload a CSV file to bulk import data",
}: CSVImportProps<T>) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<T[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const csv = Papa.unparse([templateData]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFilename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setParsedData([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [];
        const data = results.data as any[];

        if (data.length === 0) {
          validationErrors.push("CSV file is empty");
          setErrors(validationErrors);
          return;
        }

        const headers = Object.keys(data[0]);
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          validationErrors.push(`Missing required columns: ${missingColumns.join(", ")}`);
        }

        const transformedData: T[] = [];
        data.forEach((row, index) => {
          const rowNumber = index + 2;
          
          if (validateRow) {
            const validation = validateRow(row);
            if (!validation.valid) {
              validation.errors.forEach(error => {
                validationErrors.push(`Row ${rowNumber}: ${error}`);
              });
            }
          }

          requiredColumns.forEach(col => {
            if (!row[col] || row[col].toString().trim() === "") {
              validationErrors.push(`Row ${rowNumber}: Missing required field "${col}"`);
            }
          });

          if (transformRow) {
            transformedData.push(transformRow(row));
          } else {
            transformedData.push(row as T);
          }
        });

        setErrors(validationErrors);
        setParsedData(transformedData);
      },
      error: (error) => {
        setErrors([`Failed to parse CSV: ${error.message}`]);
      },
    });
  };

  const handleImport = async () => {
    if (parsedData.length === 0 || errors.length > 0) return;

    setImporting(true);
    try {
      await onImport(parsedData);
      setOpen(false);
      setFile(null);
      setParsedData([]);
      setErrors([]);
    } catch (error) {
      setErrors([`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`]);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setFile(null);
    setParsedData([]);
    setErrors([]);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        data-testid="button-csv-import"
      >
        <Upload className="w-4 h-4 mr-2" />
        Import CSV
      </Button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-csv-import">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadTemplate}
                data-testid="button-download-template"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Template
              </Button>
              <p className="text-sm text-muted-foreground">
                Download a template CSV file with the correct format
              </p>
            </div>

            <div>
              <label
                htmlFor="csv-file-input"
                className="block w-full cursor-pointer"
                data-testid="label-file-upload"
              >
                <Card className="p-8 text-center hover-elevate border-2 border-dashed">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  {file ? (
                    <div className="space-y-2">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {parsedData.length} rows found
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="font-medium mb-2">Click to upload CSV file</p>
                      <p className="text-sm text-muted-foreground">
                        or drag and drop
                      </p>
                    </>
                  )}
                </Card>
                <input
                  id="csv-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="sr-only"
                  data-testid="input-csv-file"
                />
              </label>
              {file && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                    setErrors([]);
                  }}
                  data-testid="button-clear-file"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear file
                </Button>
              )}
            </div>

            {errors.length > 0 && (
              <Card className="p-4 bg-destructive/10 border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-destructive mb-2">
                      Validation Errors ({errors.length})
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {errors.slice(0, 10).map((error, i) => (
                        <li key={i} className="text-destructive/90">• {error}</li>
                      ))}
                      {errors.length > 10 && (
                        <li className="text-destructive/70 italic">
                          ... and {errors.length - 10} more errors
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {parsedData.length > 0 && errors.length === 0 && (
              <Card className="p-4 bg-primary/10 border-primary/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary mb-1">
                      Ready to Import
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {parsedData.length} rows validated successfully
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {parsedData.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Preview (first 5 rows)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(parsedData[0]).map((key) => (
                            <TableHead key={key} className="whitespace-nowrap">
                              {key}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 5).map((row, i) => (
                          <TableRow key={i}>
                            {Object.values(row).map((value: any, j) => (
                              <TableCell key={j} className="whitespace-nowrap">
                                {value?.toString() || ""}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                data-testid="button-cancel-import"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={parsedData.length === 0 || errors.length > 0 || importing}
                data-testid="button-confirm-import"
              >
                {importing ? "Importing..." : `Import ${parsedData.length} Rows`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
