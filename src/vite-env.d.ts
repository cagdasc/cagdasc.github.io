/// <reference types="vite/client" />

declare module '*.md?raw' {
  const content: string;
  export default content;
}

declare module '*.md' {
  const content: string;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

