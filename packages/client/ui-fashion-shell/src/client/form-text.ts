/** Text reads from submitted Fashion forms. */

/**
 * Read one text field from a submitted form.
 * @param data - The submitted form entries.
 * @param name - Field name.
 * @returns The field text; an absent field or a file entry reads as `''`, which every caller rejects as missing required input.
 */
export function formText(data: FormData, name: string): string {
  const value = data.get(name)
  return typeof value === 'string' ? value : ''
}
