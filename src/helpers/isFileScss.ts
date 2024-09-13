/**
 * Check if the file is a SCSS file
 * @param filePath
 */
export function isFileScss(filePath: string): boolean {
  const extension = filePath.split(".").pop();
  return extension === "scss";
}
