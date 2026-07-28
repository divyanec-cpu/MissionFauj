import { prisma } from '../../lib/prisma.js';
import { registerResource, type FieldDef } from '../../lib/adminResource.js';

const fields: FieldDef[] = [
  { name: 'name', label: 'Scheme name', type: 'text', required: true },
  { name: 'branch', label: 'Branch', type: 'text', required: true },
  { name: 'ageMin', label: 'Minimum age', type: 'number', required: true },
  { name: 'ageMax', label: 'Maximum age', type: 'number', required: true },
  { name: 'education', label: 'Education requirement', type: 'select', options: ['12th', 'graduate'], required: true },
  { name: 'requiresPCM', label: 'Requires PCM (Physics/Chemistry/Maths)', type: 'checkbox' },
  { name: 'pcmLabel', label: 'PCM subject wording (optional)', type: 'text', help: 'Used in the fail-reason text when requiresPCM is checked' },
  { name: 'marital', label: 'Marital status requirement', type: 'select', options: ['unmarried', 'any'], required: true },
  { name: 'requiresNCC', label: 'Requires NCC', type: 'checkbox' },
  {
    name: 'failPriority',
    label: 'Fail-reason priority order (comma-separated)',
    type: 'text',
    required: true,
    help: 'Subset of: pcm, education, age, marital, ncc — order decides which failing check is reported first',
  },
  { name: 'okReason', label: 'Eligible-reason text', type: 'textarea', required: true },
  { name: 'active', label: 'Active (visible to candidates)', type: 'checkbox' },
  { name: 'sortOrder', label: 'Sort order (lower shows first)', type: 'number' },
];

function toData(body: Record<string, string>) {
  return {
    name: body.name?.trim() ?? '',
    branch: body.branch?.trim() ?? '',
    ageMin: Number.parseFloat(body.ageMin) || 0,
    ageMax: Number.parseFloat(body.ageMax) || 0,
    education: body.education ?? '12th',
    requiresPCM: body.requiresPCM === 'on',
    pcmLabel: body.pcmLabel?.trim() || null,
    marital: body.marital ?? 'any',
    requiresNCC: body.requiresNCC === 'on',
    failPriority: (body.failPriority ?? '')
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean),
    okReason: body.okReason?.trim() ?? '',
    active: body.active === 'on',
    sortOrder: Number.parseInt(body.sortOrder, 10) || 0,
  };
}

export const eligibilityRulesRouter = registerResource({
  basePath: '/admin/eligibility-rules',
  title: 'Eligibility Rules',
  fields,
  listColumns: ['id', 'name', 'branch', 'active'],
  allowCustomId: true,
  newDefaults: { active: true, education: '12th', marital: 'any' },
  list: async () => {
    const rows = await prisma.eligibilityRule.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    return rows.map((r) => ({ ...r, failPriority: (r.failPriority as string[]).join(', ') }));
  },
  create: async (body) => {
    const id = body.id?.trim();
    if (!id) throw new Error('Id is required.');
    await prisma.eligibilityRule.create({ data: { id, ...toData(body) } });
  },
  update: async (id, body) => {
    await prisma.eligibilityRule.update({ where: { id }, data: toData(body) });
  },
  remove: async (id) => {
    await prisma.eligibilityRule.delete({ where: { id } });
  },
});
