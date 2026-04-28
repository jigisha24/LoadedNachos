export const uploadDataset = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const baseUrl = import.meta.env.PROD ? "" : "http://127.0.0.1:8000";
  return fetch(`${baseUrl}/api/upload/`, {
    method: "POST",
    body: formData,
  });
};

export const getAnalysis = async () => {
  const baseUrl = import.meta.env.PROD ? "" : "http://127.0.0.1:8000";
  return fetch(`${baseUrl}/api/analyze/`).then(r => r.json());
};
