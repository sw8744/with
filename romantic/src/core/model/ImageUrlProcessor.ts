function ImageUrlProcessor(url: string | null | undefined): string {
  let thumbnailUrl = "/api/v1/resources/image/store/00000000-0000-4000-0000-000000000000";
  if (!url) return thumbnailUrl;

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(url)) {
    thumbnailUrl = `/api/v1/resources/image/store/${url}`;
  } else if (url) {
    thumbnailUrl = url;
  }

  return thumbnailUrl;
}

export {
  ImageUrlProcessor
}
