const generateImageUrl = (image: string) => {
  if (!image) return image;
  const url = new URL(image);
  const parts = url.pathname.split("/");
  const filePath = encodeURIComponent(parts.slice(-3).join("/") || "");

  url.pathname = [...parts.slice(0, -3), filePath].join("/");

  return url.toString();
};

export { generateImageUrl };
