import { prisma } from '../../lib/prisma.js';
import { registerResource, type FieldDef } from '../../lib/adminResource.js';

const fields: FieldDef[] = [
  { name: 'scope', label: 'Scope', type: 'select', options: ['written', 'ssb'], required: true },
  { name: 'name', label: 'Plan name', type: 'text', required: true },
  { name: 'price', label: 'Price (display text)', type: 'text', required: true, help: 'e.g. ₹499' },
  {
    name: 'priceValue',
    label: 'Price value (number)',
    type: 'number',
    help: 'Only used by the "ssb" scope, for the 20% existing-member-discount calculation. Leave blank for "written" plans.',
  },
  { name: 'period', label: 'Period (display text)', type: 'text', required: true, help: 'e.g. per month' },
  { name: 'highlighted', label: 'Highlighted ("Most Popular")', type: 'checkbox' },
  { name: 'badge', label: 'Badge text (optional)', type: 'text' },
  { name: 'perks', label: 'Perks (one per line)', type: 'textarea', required: true },
  { name: 'active', label: 'Active (visible to candidates)', type: 'checkbox' },
  { name: 'sortOrder', label: 'Sort order (lower shows first)', type: 'number' },
];

function toData(body: Record<string, string>) {
  return {
    scope: body.scope ?? 'written',
    name: body.name?.trim() ?? '',
    price: body.price?.trim() ?? '',
    priceValue: body.priceValue?.trim() ? Number.parseInt(body.priceValue, 10) : null,
    period: body.period?.trim() ?? '',
    highlighted: body.highlighted === 'on',
    badge: body.badge?.trim() || null,
    perks: (body.perks ?? '')
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean),
    active: body.active === 'on',
    sortOrder: Number.parseInt(body.sortOrder, 10) || 0,
  };
}

export const pricingPlansRouter = registerResource({
  basePath: '/admin/pricing-plans',
  title: 'Pricing Plans',
  fields,
  listColumns: ['scope', 'name', 'price', 'active'],
  newDefaults: { active: true, scope: 'written' },
  list: async () => {
    const rows = await prisma.pricingPlan.findMany({ orderBy: [{ scope: 'asc' }, { sortOrder: 'asc' }] });
    // Present the JSON perks array as one-per-line text for the admin form/table.
    return rows.map((r) => ({ ...r, perks: (r.perks as string[]).join('\n') }));
  },
  create: async (body) => {
    await prisma.pricingPlan.create({ data: toData(body) });
  },
  update: async (id, body) => {
    await prisma.pricingPlan.update({ where: { id }, data: toData(body) });
  },
  remove: async (id) => {
    await prisma.pricingPlan.delete({ where: { id } });
  },
});
