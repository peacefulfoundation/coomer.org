import { defineCollection, defineConfig } from '@content-collections/core';
import { compileMarkdown } from '@content-collections/markdown';

const memes = defineCollection({
  name: 'memes',
  directory: 'memes',
  include: '**/*.md',
  schema: (z) => ({
    title: z.string(),
    summary: z.string(),
  }),
  transform: async (document, context) => {
    const html = await compileMarkdown(context, document);
    return {
      ...document,
      html,
    };
  },
});

export default defineConfig({
  collections: [memes],
});
