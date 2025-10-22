type Theme = {
  name: string;
  color: string;
}

type ThemeMapping = {
  [key: number]: Theme
}

export type {
  Theme,
  ThemeMapping,
}
