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
  const [infoMessages, setInfoMessages] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const downloadTemplate = () => {
    const csv = Papa.unparse([templateData]);
    // Add UTF-8 BOM to ensure proper encoding for Chinese characters
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFilename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const detectAndDecodeCSV = (arrayBuffer: ArrayBuffer): { text: string; encoding: string; infoMessages: string[]; errorWarnings: string[] } => {
    const infoMessages: string[] = [];
    const errorWarnings: string[] = [];
    let text = '';
    let encoding = 'UTF-8';
    let decodingSuccessful = false;

    // Try UTF-8 first (most common)
    try {
      const utf8Decoder = new TextDecoder('utf-8', { fatal: false });
      text = utf8Decoder.decode(arrayBuffer);
      
      const hasReplacementChars = text.includes('�');
      const hasValidChinese = /[\u4e00-\u9fa5]/.test(text);
      const hasGarbledChars = /[≈£◊…Ω]/.test(text);
      
      // If UTF-8 looks good, use it
      if (!hasReplacementChars && (!hasGarbledChars || hasValidChinese)) {
        decodingSuccessful = true;
        encoding = 'UTF-8';
      }
      
      // Otherwise try GB18030 (common Excel encoding for Chinese)
      if (!decodingSuccessful && (hasReplacementChars || hasGarbledChars)) {
        try {
          const gb18030Decoder = new TextDecoder('gb18030', { fatal: false });
          const gb18030Text = gb18030Decoder.decode(arrayBuffer);
          
          if (/[\u4e00-\u9fa5]/.test(gb18030Text) && !gb18030Text.includes('�')) {
            text = gb18030Text;
            encoding = 'GB18030';
            decodingSuccessful = true;
            infoMessages.push(`Auto-detected ${encoding} encoding and converted successfully.`);
            infoMessages.push("Tip: Use Google Sheets for best UTF-8 compatibility in the future.");
          }
        } catch (gb18030Error) {
          console.warn('GB18030 decoding failed:', gb18030Error);
          // Fall through to use UTF-8 text as fallback
        }
      }
      
      // If we still have issues, try Windows-1252 (common Excel encoding)
      if (!decodingSuccessful && (hasReplacementChars || hasGarbledChars)) {
        try {
          const win1252Decoder = new TextDecoder('windows-1252', { fatal: false });
          const win1252Text = win1252Decoder.decode(arrayBuffer);
          
          // Check if this looks better
          if (!win1252Text.includes('�') || win1252Text.length > text.length) {
            text = win1252Text;
            encoding = 'Windows-1252';
            decodingSuccessful = true;
            infoMessages.push(`Auto-detected ${encoding} encoding and converted successfully.`);
          }
        } catch (win1252Error) {
          console.warn('Windows-1252 decoding failed:', win1252Error);
          // Fall through to use UTF-8 text as fallback
        }
      }
      
      // Final fallback: use UTF-8 with warnings if nothing else worked
      if (!decodingSuccessful && text && text.length > 0) {
        encoding = 'UTF-8 (with issues)';
        errorWarnings.push(`Warning: File has encoding issues. Detected as ${encoding}.`);
        errorWarnings.push("Some characters may appear incorrectly.");
        errorWarnings.push("For best results, use Google Sheets or LibreOffice and export as UTF-8.");
      }
      
    } catch (error) {
      console.error('Critical encoding error:', error);
      errorWarnings.push("Critical encoding error during file read.");
      errorWarnings.push("Please ensure the file is a valid CSV.");
      
      // Last resort: try to read as text using FileReader fallback
      // This will be handled in the calling code
    }

    return { text, encoding, infoMessages, errorWarnings };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setInfoMessages([]);
    setParsedData([]);

    // Try ArrayBuffer approach first
    const arrayBufferReader = new FileReader();
    
    arrayBufferReader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      
      if (!arrayBuffer) {
        setErrors(["Failed to read file content."]);
        return;
      }

      const { text, encoding, infoMessages, errorWarnings } = detectAndDecodeCSV(arrayBuffer);
      
      // If text is empty or severely corrupted, try text reading as fallback
      if (!text || text.trim() === "" || text.length < 10) {
        console.warn('ArrayBuffer approach failed, trying text reader fallback...');
        
        // Fallback to text reader
        const textReader = new FileReader();
        textReader.onload = (e) => {
          const fallbackText = e.target?.result as string;
          if (!fallbackText || fallbackText.trim() === "") {
            setErrors([
              "CSV file is empty or has severe encoding issues.",
              "",
              "Note: Your spreadsheet app likely corrupted the file encoding.",
              "",
              "Solution - Use UTF-8 safe editors:",
              "   • Google Sheets (recommended for Chinese characters)",
              "   • LibreOffice Calc",
              "   • Notepad++ (Windows) or TextEdit (Mac)",
              "",
              "Steps:",
              "   1. Download the template again",
              "   2. Open in Google Sheets or LibreOffice",
              "   3. Paste your data",
              "   4. Export as CSV (UTF-8)",
              "   5. Upload here",
              "",
              "Important: Excel and Mac Numbers often corrupt UTF-8 encoding"
            ]);
            return;
          }
          
          // Process the fallback text
          processCSVText(fallbackText, [...errorWarnings, "Used text fallback due to encoding detection issues."]);
        };
        textReader.onerror = () => {
          setErrors(["Failed to read file with both methods. File may be corrupted."]);
        };
        textReader.readAsText(selectedFile, 'UTF-8');
        return;
      }
      
      setInfoMessages(infoMessages);
      processCSVText(text, errorWarnings);
    };
    
    arrayBufferReader.onerror = () => {
      setErrors(["Failed to read file. Please ensure the file is a valid CSV."]);
    };
    
    arrayBufferReader.readAsArrayBuffer(selectedFile);
  };

  const processCSVText = (text: string, initialErrors: string[]) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const validationErrors: string[] = [...initialErrors];
        const data = results.data as any[];

        if (data.length === 0) {
          validationErrors.push("");
          validationErrors.push("Error: 0 rows found in CSV file.");
          validationErrors.push("");
          validationErrors.push("This usually means encoding corruption from Excel or Mac Numbers.");
          validationErrors.push("");
          validationErrors.push("Solution - Use UTF-8 safe editors:");
          validationErrors.push("   • Google Sheets (recommended for Chinese characters)");
          validationErrors.push("   • LibreOffice Calc");
          validationErrors.push("   • Notepad++ (Windows) or TextEdit (Mac)");
          validationErrors.push("");
          validationErrors.push("Steps to fix:");
          validationErrors.push("   1. Download the template again from this dialog");
          validationErrors.push("   2. Open in Google Sheets: File → Import → Upload");
          validationErrors.push("   3. Paste your data into the template");
          validationErrors.push("   4. Download: File → Download → Comma Separated Values (.csv)");
          validationErrors.push("   5. Upload the downloaded file here");
          validationErrors.push("");
          validationErrors.push("Important: Excel and Mac Numbers corrupt UTF-8 Chinese characters");
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
            try {
              transformedData.push(transformRow(row));
            } catch (error) {
              validationErrors.push(`Row ${rowNumber}: Transform error - ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          } else {
            transformedData.push(row as T);
          }
        });

        setErrors(validationErrors);
        setParsedData(transformedData);
      },
      error: (error: any) => {
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
    setInfoMessages([]);
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
                    setInfoMessages([]);
                  }}
                  data-testid="button-clear-file"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear file
                </Button>
              )}
            </div>

            {infoMessages.length > 0 && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                      Encoding Auto-Correction
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-400">
                      {infoMessages.map((msg, i) => (
                        <li key={i}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

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
                        <li key={i} className="text-destructive/90">{error}</li>
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
