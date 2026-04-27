export const uploadDataset = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return fetch("http://127.0.0.1:8000/api/upload/", {
    method: "POST",
    body: formData,
  });
};

export const getAnalysis = async () => {
  return fetch("http://127.0.0.1:8000/api/analyze/").then(r => r.json());
};
