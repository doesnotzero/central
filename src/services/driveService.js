export const extractDriveFileId = value => {
  const text = String(value || "").trim();
  if (!text) return "";

  const fileMatch = text.match(/\/file\/d\/([^/]+)/);
  if (fileMatch?.[1]) return fileMatch[1];

  const idMatch = text.match(/[?&]id=([^&]+)/);
  if (idMatch?.[1]) return idMatch[1];

  return text.includes("/") ? "" : text;
};

export const drivePreviewUrl = fileId =>
  fileId ? `https://drive.google.com/file/d/${fileId}/preview` : "";

export const driveViewUrl = fileId =>
  fileId ? `https://drive.google.com/file/d/${fileId}/view` : "";
