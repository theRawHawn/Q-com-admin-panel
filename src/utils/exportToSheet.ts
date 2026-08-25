/**
 * Utility for exporting administrative datasets to Spreadsheet-compatible CSV / Sheet format.
 * Works natively with Microsoft Excel, Google Sheets, Apple Numbers, etc.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(filename: string, columns: ExportColumn<T>[], data: T[]) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // 1. Build Header Row
  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // 2. Build Data Rows
  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const val = col.accessor(item);
        if (val === null || val === undefined) {
          return '""';
        }
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',');
  });

  // 3. Combine with UTF-8 BOM for Excel compatibility
  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');

  // 4. Trigger File Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Quick export for multi-section summary reports (e.g., Executive Business Sheet).
 */
export function exportCustomSheet(filename: string, sections: { title: string; rows: (string | number)[][] }[]) {
  const contentLines: string[] = [];

  sections.forEach((section) => {
    contentLines.push(`"${section.title.replace(/"/g, '""')}"`);
    section.rows.forEach((row) => {
      const line = row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',');
      contentLines.push(line);
    });
    contentLines.push(''); // blank line between sections
  });

  const csvContent = '\uFEFF' + contentLines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
