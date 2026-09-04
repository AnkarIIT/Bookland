import { sourceDirectory, type ResourceCategory } from '../data/source-directory';

export interface SourceDirectoryResponse {
  categories: ResourceCategory[];
  total_sources: number;
  total_categories: number;
}

export const getSourceDirectory = (): SourceDirectoryResponse => ({
  categories: sourceDirectory,
  total_sources: sourceDirectory.reduce((acc, cat) => acc + cat.links.length, 0),
  total_categories: sourceDirectory.length,
});

export const getCategory = (id: string): ResourceCategory | undefined =>
  sourceDirectory.find((cat) => cat.id === id);

export const searchSources = (query: string): ResourceCategory[] => {
  const q = query.toLowerCase().trim();
  if (!q) return sourceDirectory;

  return sourceDirectory
    .map((cat) => ({
      ...cat,
      links: cat.links.filter(
        (link) =>
          link.name.toLowerCase().includes(q) ||
          (link.note || '').toLowerCase().includes(q) ||
          cat.title.toLowerCase().includes(q)
      ),
    }))
    .filter((cat) => cat.links.length > 0);
};
