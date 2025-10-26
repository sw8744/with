function thumbnailUrl(url: string | null | undefined): string {
  // TODO: CHANGE STRING BELOW LINE TO DEFAULT IMAGE PATH
  let thumbnailUrl = "";
  if (!url) return thumbnailUrl;

  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(url)) {
    thumbnailUrl = `/image/${url}`;
  } else if (url) {
    thumbnailUrl = url;
  }

  return thumbnailUrl;
}

export {
  thumbnailUrl
}
