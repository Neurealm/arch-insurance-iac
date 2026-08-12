// Browser generated exports for the SRE Based Agentic NOC. No backend involved.

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) => row
      .map((cell) => {
        const value = String(cell ?? "");
        return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
      })
      .join(","))
    .join("\n");
}

export function downloadBlob(content: string, filename: string, mime: string): string {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return content;
}

export function exportCsv(filename: string, rows: (string | number)[][]): string {
  return downloadBlob(toCsv(rows), filename, "text/csv;charset=utf-8");
}

export function exportJson(filename: string, data: unknown): string {
  return downloadBlob(JSON.stringify(data, null, 2), filename, "application/json");
}
