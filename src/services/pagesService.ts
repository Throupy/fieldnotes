import { pagesDB } from "./db";

export const createPage = async (title: string, parent: string | null = null) => {
  const newPage = {
    _id: `page:${crypto.randomUUID()}`,
    title,
    content: '',
    parent,
    icon: '📄',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  await pagesDB.put(newPage)
  return newPage
}

export const getPages = async () => {
  const result = await pagesDB.allDocs({ include_docs: true })
  return result.rows.map((row) => row.doc)
}

export const getPage = async (id: string) => {
  return await pagesDB.get(id)
}

export const updatePage = async (pageId: string, updates: Partial<{ title: string; content: string; icon: string }>) => {
  const page = await pagesDB.get(pageId);
  const updatedPage = { ...page, ...updates, updatedAt: Date.now() };
  await pagesDB.put(updatedPage);
  return updatedPage;
};

export const deletePage = async (pageId: string) => {
  const page = await pagesDB.get(pageId);
  await pagesDB.remove(page);
};