import { Router } from 'express';
import { renderAdminPage, escapeHtml } from './adminLayout.js';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select';
  options?: string[]; // required when type is 'select'
  required?: boolean;
  help?: string;
}

export interface ResourceConfig<Row extends Record<string, unknown>> {
  // e.g. '/admin/experts' — used to build every link/form action on this resource's pages.
  basePath: string;
  title: string;
  fields: FieldDef[];
  // Field names (subset of `fields`, plus any row key like 'id') shown as table columns.
  listColumns: string[];
  // If true, the create form includes an editable `id` text field (for
  // human-meaningful slugs like EligibilityRule's "nda-army") instead of
  // relying on an auto-generated one.
  allowCustomId?: boolean;
  // Pre-filled values for the "add new" form only (e.g. { active: true }).
  newDefaults?: Record<string, unknown>;
  list: () => Promise<Row[]>;
  create: (data: Record<string, string>) => Promise<void>;
  update: (id: string, data: Record<string, string>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

function renderFieldInput(field: FieldDef, value: unknown): string {
  const v = escapeHtml(value ?? '');
  if (field.type === 'checkbox') {
    return `<div class="checkbox-row"><input type="checkbox" name="${field.name}" id="f_${field.name}" ${value ? 'checked' : ''}><label for="f_${field.name}">${escapeHtml(field.label)}</label></div>`;
  }
  const req = field.required ? 'required' : '';
  let input: string;
  if (field.type === 'textarea') {
    input = `<textarea name="${field.name}" ${req}>${v}</textarea>`;
  } else if (field.type === 'number') {
    input = `<input type="number" step="any" name="${field.name}" ${req} value="${v}">`;
  } else if (field.type === 'select') {
    const opts = (field.options ?? [])
      .map((o) => `<option value="${escapeHtml(o)}" ${String(value) === o ? 'selected' : ''}>${escapeHtml(o)}</option>`)
      .join('');
    input = `<select name="${field.name}" ${req}>${opts}</select>`;
  } else {
    input = `<input type="text" name="${field.name}" ${req} value="${v}">`;
  }
  const help = field.help ? `<div class="muted" style="font-size:0.8rem;margin-top:0.25rem">${escapeHtml(field.help)}</div>` : '';
  return `<label>${escapeHtml(field.label)}</label>${input}${help}`;
}

function renderForm(config: ResourceConfig<Record<string, unknown>>, values: Record<string, unknown>, formAction: string, isEdit: boolean): string {
  let html = `<form method="post" action="${formAction}" class="card">`;
  if (config.allowCustomId && !isEdit) {
    html += `<label>Id (slug — lowercase, hyphenated, e.g. nda-army)</label><input type="text" name="id" required value="${escapeHtml(values.id)}">`;
  }
  for (const field of config.fields) {
    html += renderFieldInput(field, values[field.name]);
  }
  html += `<div><button type="submit">Save</button> <a class="btn secondary" href="${config.basePath}">Cancel</a></div>`;
  html += '</form>';
  return html;
}

export function registerResource<Row extends Record<string, unknown>>(config: ResourceConfig<Row>): Router {
  const router = Router();
  const activePath = config.basePath;

  router.get('/', async (_req, res) => {
    const rows = await config.list();
    const header = config.listColumns.map((c) => `<th>${escapeHtml(c)}</th>`).join('') + '<th></th>';
    const body = rows
      .map((row) => {
        const id = String(row.id);
        const cells = config.listColumns
          .map((c) => {
            const val = row[c];
            const display = typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val ?? '');
            return `<td>${escapeHtml(display.length > 80 ? display.slice(0, 80) + '…' : display)}</td>`;
          })
          .join('');
        return `<tr>${cells}<td class="row-actions"><a href="${config.basePath}/${encodeURIComponent(id)}/edit">Edit</a><form method="post" action="${config.basePath}/${encodeURIComponent(id)}/delete" style="display:inline" onsubmit="return confirm('Delete this row?')"><button type="submit" class="danger" style="margin:0;padding:0.2rem 0.6rem;font-size:0.75rem">Delete</button></form></td></tr>`;
      })
      .join('');
    const html = `
      <div class="toolbar"><h1>${escapeHtml(config.title)}</h1><a class="btn" href="${config.basePath}/new">+ Add new</a></div>
      <table><thead><tr>${header}</tr></thead><tbody>${body || `<tr><td colspan="${config.listColumns.length + 1}" class="muted">No rows yet</td></tr>`}</tbody></table>
    `;
    res.send(renderAdminPage({ title: config.title, activePath, body: html }));
  });

  router.get('/new', (_req, res) => {
    const html = `<h1>Add ${escapeHtml(config.title)}</h1>${renderForm(config, config.newDefaults ?? {}, `${config.basePath}/new`, false)}`;
    res.send(renderAdminPage({ title: `New ${config.title}`, activePath, body: html }));
  });

  router.post('/new', async (req, res) => {
    try {
      await config.create(req.body);
      res.redirect(config.basePath);
    } catch (err) {
      const html = `<h1>Add ${escapeHtml(config.title)}</h1><div class="error">${escapeHtml(err instanceof Error ? err.message : 'Could not save.')}</div>${renderForm(config, req.body, `${config.basePath}/new`, false)}`;
      res.status(400).send(renderAdminPage({ title: `New ${config.title}`, activePath, body: html }));
    }
  });

  router.get('/:id/edit', async (req, res) => {
    const rows = await config.list();
    const row = rows.find((r) => String(r.id) === req.params.id);
    if (!row) {
      res.status(404).send(renderAdminPage({ title: config.title, activePath, body: '<p>Not found.</p>' }));
      return;
    }
    const html = `<h1>Edit ${escapeHtml(config.title)}</h1>${renderForm(config, row, `${config.basePath}/${encodeURIComponent(req.params.id)}/edit`, true)}`;
    res.send(renderAdminPage({ title: `Edit ${config.title}`, activePath, body: html }));
  });

  router.post('/:id/edit', async (req, res) => {
    try {
      await config.update(req.params.id, req.body);
      res.redirect(config.basePath);
    } catch (err) {
      const html = `<h1>Edit ${escapeHtml(config.title)}</h1><div class="error">${escapeHtml(err instanceof Error ? err.message : 'Could not save.')}</div>${renderForm(config, req.body, `${config.basePath}/${encodeURIComponent(req.params.id)}/edit`, true)}`;
      res.status(400).send(renderAdminPage({ title: `Edit ${config.title}`, activePath, body: html }));
    }
  });

  router.post('/:id/delete', async (req, res) => {
    try {
      await config.remove(req.params.id);
    } catch (err) {
      console.error(`Failed to delete ${config.title} row`, err);
    }
    res.redirect(config.basePath);
  });

  return router;
}
