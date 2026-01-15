/**
 * Data export utilities for CSV and JSON export
 */

type ExportableValue = string | number | boolean | null | undefined | Date;

export interface ExportOptions {
  format: 'csv' | 'json';
  filename?: string;
}

/**
 * Convert an array of objects to CSV string
 */
export function toCSV<T extends Record<string, ExportableValue>>(
  data: T[],
  columns?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) return '';

  // Use provided columns or infer from first item
  const cols = columns || Object.keys(data[0]).map((key) => ({
    key: key as keyof T,
    label: key,
  }));

  // Header row
  const header = cols.map((col) => escapeCSV(col.label)).join(',');

  // Data rows
  const rows = data.map((item) =>
    cols
      .map((col) => {
        const value = item[col.key];
        return escapeCSV(formatValue(value));
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Escape a value for CSV
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Format a value for export
 */
function formatValue(value: ExportableValue): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV
 */
export function exportToCSV<T extends Record<string, ExportableValue>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void {
  const csv = toCSV(data, columns);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Export data as JSON
 */
export function exportToJSON<T>(data: T[], filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
}

/**
 * Pre-configured export functions for deals and contacts
 */
export const dealExportColumns = [
  { key: 'name' as const, label: 'Deal Name' },
  { key: 'status' as const, label: 'Status' },
  { key: 'property_type' as const, label: 'Property Type' },
  { key: 'address' as const, label: 'Address' },
  { key: 'city' as const, label: 'City' },
  { key: 'state' as const, label: 'State' },
  { key: 'zip' as const, label: 'ZIP' },
  { key: 'sf' as const, label: 'Square Feet' },
  { key: 'notes' as const, label: 'Notes' },
  { key: 'created_at' as const, label: 'Created' },
];

export const contactExportColumns = [
  { key: 'name' as const, label: 'Name' },
  { key: 'email' as const, label: 'Email' },
  { key: 'phone' as const, label: 'Phone' },
  { key: 'company' as const, label: 'Company' },
  { key: 'role' as const, label: 'Role' },
  { key: 'notes' as const, label: 'Notes' },
  { key: 'created_at' as const, label: 'Created' },
];
