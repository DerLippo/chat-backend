export const sanitizeString = str => {
  if (!str) return '';

  // Entferne unsichtbare Zeichen
  const invisibleChars =
    /[\u0000-\u001F\u007F\u00A0\u00AD\u1680\u180E\u2000-\u200A\u2028-\u202F\u205F\u3000]/g;

  let sanitizedStr = str.replace(invisibleChars, '');

  return sanitizedStr;
};
