/** Resolves public assets against the deployment base path. */
export function assetUrl(path: string): string {
  const base = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/`;
  return `${base}${path.replace(/^\//, '')}`;
}
