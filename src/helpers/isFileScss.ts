export function isFileScss(filePath: string): boolean {
  const extension = filePath.split('.').pop();
  return extension === 'scss';
}
