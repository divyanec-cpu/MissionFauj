import { prisma } from '../../lib/prisma.js';
import { registerResource, type FieldDef } from '../../lib/adminResource.js';

const EXPERT_CATEGORIES = ['IO', 'GTO', 'Psychologist', 'Board President', 'English & Confidence'];

const fields: FieldDef[] = [
  { name: 'role', label: 'Role (e.g. Interviewing Officer)', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', options: EXPERT_CATEGORIES, required: true },
  { name: 'accent', label: 'Accent (CSS var)', type: 'text', required: true, help: 'e.g. var(--color-amber)' },
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'credentials', label: 'Credentials', type: 'text', required: true },
  { name: 'bio', label: 'Bio', type: 'textarea', required: true },
  { name: 'price', label: 'Price (display text)', type: 'text', required: true, help: 'e.g. ₹1,499 / session' },
  { name: 'bonus', label: 'Show "Bonus" badge', type: 'checkbox' },
  { name: 'active', label: 'Active (visible to candidates)', type: 'checkbox' },
  { name: 'sortOrder', label: 'Sort order (lower shows first)', type: 'number' },
];

function toData(body: Record<string, string>) {
  return {
    role: body.role?.trim() ?? '',
    category: body.category ?? '',
    accent: body.accent?.trim() ?? '',
    name: body.name?.trim() ?? '',
    credentials: body.credentials?.trim() ?? '',
    bio: body.bio?.trim() ?? '',
    price: body.price?.trim() ?? '',
    bonus: body.bonus === 'on',
    active: body.active === 'on',
    sortOrder: Number.parseInt(body.sortOrder, 10) || 0,
  };
}

export const expertsRouter = registerResource({
  basePath: '/admin/experts',
  title: 'Experts',
  fields,
  listColumns: ['role', 'category', 'name', 'active'],
  newDefaults: { active: true },
  list: () => prisma.expert.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }),
  create: async (body) => {
    await prisma.expert.create({ data: toData(body) });
  },
  update: async (id, body) => {
    await prisma.expert.update({ where: { id }, data: toData(body) });
  },
  remove: async (id) => {
    await prisma.expert.delete({ where: { id } });
  },
});
