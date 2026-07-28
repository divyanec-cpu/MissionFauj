import { prisma } from '../../lib/prisma.js';
import { registerResource, type FieldDef } from '../../lib/adminResource.js';

const fields: FieldDef[] = [
  { name: 'date', label: 'Date (display text)', type: 'text', required: true, help: 'e.g. Jul 24' },
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'detail', label: 'Detail', type: 'textarea', required: true },
  { name: 'sourceName', label: 'Source name', type: 'text', required: true },
  { name: 'sourceUrl', label: 'Source URL', type: 'text', required: true },
  { name: 'active', label: 'Active (visible to candidates)', type: 'checkbox' },
  { name: 'sortOrder', label: 'Sort order (lower shows first)', type: 'number' },
];

function toData(body: Record<string, string>) {
  return {
    date: body.date?.trim() ?? '',
    title: body.title?.trim() ?? '',
    detail: body.detail?.trim() ?? '',
    sourceName: body.sourceName?.trim() ?? '',
    sourceUrl: body.sourceUrl?.trim() ?? '',
    active: body.active === 'on',
    sortOrder: Number.parseInt(body.sortOrder, 10) || 0,
  };
}

export const digestPostsRouter = registerResource({
  basePath: '/admin/digest-posts',
  title: 'Digest Posts',
  fields,
  listColumns: ['date', 'title', 'active'],
  newDefaults: { active: true },
  list: () => prisma.digestPost.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] }),
  create: async (body) => {
    await prisma.digestPost.create({ data: toData(body) });
  },
  update: async (id, body) => {
    await prisma.digestPost.update({ where: { id }, data: toData(body) });
  },
  remove: async (id) => {
    await prisma.digestPost.delete({ where: { id } });
  },
});
