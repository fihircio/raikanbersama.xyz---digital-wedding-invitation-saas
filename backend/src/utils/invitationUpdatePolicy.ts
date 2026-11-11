import logger from './logger';

/**
 * Whitelist-based sanitizer for invitation create/update payloads.
 *
 * Why this exists:
 * The generic body validator only checks flat, top-level keys. A dotted key such as
 * `settings.is_paid` is never looked up, and the validator merges the (empty)
 * sanitized result back into the original body, so the nested `settings` object
 * reached the controller untouched. That allowed a request body like
 * `{ settings: { is_paid: true, package_plan: 'elite' } }` to self-grant paid
 * entitlement and then open every paid gate (custom URL, publish, Elite uploads).
 *
 * Rules enforced here:
 *  - Only whitelisted top-level invitation fields may be written.
 *  - Server-owned fields (`user_id`, `id`, `views`, timestamps) are never accepted.
 *  - `settings.is_paid` is server-owned (payment webhook only) and is always dropped.
 *  - Only whitelisted settings keys are accepted, each with a type/range check.
 *  - Settings are merged over the existing row, never replaced wholesale, so a
 *    partial payload cannot wipe unrelated settings.
 *
 * Adding a new setting? Add its key to the matching group below, otherwise writes
 * to it will be dropped as unknown.
 */

type Rule =
  | { kind: 'string'; max: number; enum?: readonly string[] }
  | { kind: 'hexColor' }
  | { kind: 'numeric'; min: number; max: number; allowString: boolean }
  | { kind: 'boolean' }
  | { kind: 'url'; max: number }
  | { kind: 'scalarObject'; maxBytes: number };

const HEX_COLOR_KEYS = [
  'greeting_color',
  'hero_color',
  'invitation_color',
  'groom_color',
  'bride_color',
  'host_color',
  'date_color',
  'location_color',
  'hashtag_color',
  'primary_color',
  'secondary_theme_color',
  'background_color',
  'effect_color',
  'opening_color',
  'opening_button_color',
  'opening_button_bg_color',
  'cover_hero_color',
  'cover_title_color',
  'cover_date_color',
  'cover_location_color',
  'cover_symbol_color',
] as const;

const FONT_KEYS = [
  'greeting_font',
  'hero_font',
  'invitation_font',
  'groom_font',
  'bride_font',
  'host_font',
  'date_font',
  'location_font',
  'hashtag_font',
  'opening_button_font',
  'cover_hero_font',
  'cover_title_font',
  'cover_date_font',
  'cover_location_font',
  'cover_symbol_font',
  'section_title_font',
] as const;

// Font/heading sizes are stored as strings by the editor ("38", "12.5").
const SIZE_KEYS = [
  'greeting_size',
  'hero_size',
  'invitation_size',
  'groom_size',
  'bride_size',
  'host_size',
  'date_size',
  'location_size',
  'hashtag_size',
  'cover_hero_size',
  'cover_title_size',
  'cover_date_size',
  'cover_location_size',
  'cover_symbol_size',
  'section_title_size',
  'content_margin_x',
  'youtube_start_time',
] as const;

const OPTIONAL_NUMERIC_KEYS = ['background_opacity', 'opening_button_bg_opacity', 'auto_scroll_delay'] as const;

const BOOLEAN_KEYS = [
  'show_countdown',
  'show_gallery',
  'show_hashtag',
  'show_day',
  'show_hijri',
  'show_footer_credit',
  'youtube_show',
  'pdf_export_enabled',
  'is_published',
] as const;

const URL_KEYS = [
  'background_image',
  'invitation_background_image',
  'opening_button_bg_image',
  'footer_logo_url',
  'music_url',
  'youtube_url',
] as const;

const SHORT_TEXT_KEYS: Record<string, number> = {
  greeting_text: 2000,
  hero_title: 200,
  story_title: 100,
  hashtag_text: 200,
  cover_title: 200,
  cover_hero_title: 200,
  cover_location: 200,
  cover_date: 40,
  cover_symbol: 10,
  opening_type: 40,
  effect_style: 40,
  language_mode: 20,
  footer_credit_text: 200,
  custom_background_key: 400,
  // Preview/intent selection written by the editor's package picker. Entitlement
  // itself is server-owned (`is_paid`); this only records which plan the user is
  // previewing or intends to buy.
  package_plan: 20,
};

const LONG_TEXT_KEYS: Record<string, number> = {
  our_story: 10000,
  invitation_text: 5000,
  pantun: 5000,
  note: 5000,
};

const ENUM_SETTINGS: Record<string, readonly string[]> = {
  package_plan: ['free', 'lite', 'pro', 'elite'],
  language_mode: ['melayu', 'english', 'bilingual'],
};

const SERVER_OWNED_SETTINGS = ['is_paid'] as const;

function buildSettingsPolicy(): Record<string, Rule> {
  const policy: Record<string, Rule> = {};

  for (const key of HEX_COLOR_KEYS) policy[key] = { kind: 'hexColor' };
  for (const key of FONT_KEYS) policy[key] = { kind: 'string', max: 60 };
  for (const key of SIZE_KEYS) policy[key] = { kind: 'numeric', min: 0, max: 1000, allowString: true };
  for (const key of OPTIONAL_NUMERIC_KEYS) policy[key] = { kind: 'numeric', min: 0, max: 120000, allowString: true };
  for (const key of BOOLEAN_KEYS) policy[key] = { kind: 'boolean' };
  for (const key of URL_KEYS) policy[key] = { kind: 'url', max: 1000 };

  for (const [key, max] of Object.entries(SHORT_TEXT_KEYS)) {
    policy[key] = { kind: 'string', max, enum: ENUM_SETTINGS[key] };
  }
  for (const [key, max] of Object.entries(LONG_TEXT_KEYS)) {
    policy[key] = { kind: 'string', max };
  }

  policy.layout_settings = { kind: 'scalarObject', maxBytes: 2000 };
  return policy;
}

const SETTINGS_POLICY = buildSettingsPolicy();

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isHttpUrl(value: string): boolean {
  if (value.startsWith('/')) return true; // relative asset path
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

interface FieldResult {
  ok: boolean;
  value?: unknown;
  reason?: string;
}

function validateSettingsValue(key: string, value: unknown, rule: Rule): FieldResult {
  switch (rule.kind) {
    case 'hexColor': {
      if (typeof value !== 'string') return { ok: false, reason: 'must be a string' };
      if (value === '') return { ok: true, value };
      if (!HEX_COLOR.test(value)) return { ok: false, reason: 'must be a hex colour' };
      return { ok: true, value };
    }
    case 'boolean': {
      if (typeof value !== 'boolean') return { ok: false, reason: 'must be a boolean' };
      return { ok: true, value };
    }
    case 'string': {
      if (typeof value !== 'string') return { ok: false, reason: 'must be a string' };
      if (value.length > rule.max) return { ok: false, reason: `must be at most ${rule.max} characters` };
      if (rule.enum && !rule.enum.includes(value)) {
        return { ok: false, reason: `must be one of: ${rule.enum.join(', ')}` };
      }
      return { ok: true, value };
    }
    case 'numeric': {
      let numeric: number;
      if (typeof value === 'number') {
        numeric = value;
      } else if (rule.allowString && typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
        numeric = Number(value);
      } else {
        return { ok: false, reason: 'must be a number or numeric string' };
      }
      if (!Number.isFinite(numeric)) return { ok: false, reason: 'must be finite' };
      if (numeric < rule.min || numeric > rule.max) {
        return { ok: false, reason: `must be between ${rule.min} and ${rule.max}` };
      }
      return { ok: true, value: typeof value === 'string' ? value : numeric };
    }
    case 'url': {
      if (typeof value !== 'string') return { ok: false, reason: 'must be a string' };
      if (value === '') return { ok: true, value };
      if (value.length > rule.max) return { ok: false, reason: `must be at most ${rule.max} characters` };
      if (!isHttpUrl(value)) return { ok: false, reason: 'must be an http(s) URL or a relative asset path' };
      return { ok: true, value };
    }
    case 'scalarObject': {
      if (!isPlainObject(value)) return { ok: false, reason: 'must be an object' };
      const serialized = JSON.stringify(value);
      if (serialized.length > rule.maxBytes) return { ok: false, reason: `must be at most ${rule.maxBytes} bytes` };
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedKey.length > 40) return { ok: false, reason: `nested key too long: ${nestedKey.slice(0, 20)}...` };
        if (
          typeof nestedValue !== 'string' &&
          typeof nestedValue !== 'number' &&
          typeof nestedValue !== 'boolean' &&
          nestedValue !== null
        ) {
          return { ok: false, reason: `nested value for ${nestedKey} must be scalar` };
        }
        if (typeof nestedValue === 'string' && nestedValue.length > 200) {
          return { ok: false, reason: `nested value for ${nestedKey} too long` };
        }
      }
      return { ok: true, value };
    }
    default:
      return { ok: false, reason: 'unsupported rule' };
  }
}

export interface SettingsSanitizeResult {
  settings: Record<string, unknown>;
  droppedKeys: string[];
  rejected: Array<{ key: string; reason: string }>;
}

/**
 * Sanitize an incoming `settings` object and merge it over the existing settings.
 * Unknown keys and server-owned keys are dropped; invalid values are reported.
 */
export function sanitizeSettings(incoming: unknown, existing: unknown): SettingsSanitizeResult {
  const droppedKeys: string[] = [];
  const rejected: Array<{ key: string; reason: string }> = [];
  const base: Record<string, unknown> = isPlainObject(existing) ? { ...existing } : {};

  if (incoming === undefined || incoming === null) {
    return { settings: base, droppedKeys, rejected };
  }
  if (!isPlainObject(incoming)) {
    rejected.push({ key: 'settings', reason: 'must be an object' });
    return { settings: base, droppedKeys, rejected };
  }

  for (const [key, value] of Object.entries(incoming)) {
    if ((SERVER_OWNED_SETTINGS as readonly string[]).includes(key)) {
      droppedKeys.push(key);
      continue;
    }
    const rule = SETTINGS_POLICY[key];
    if (!rule) {
      droppedKeys.push(key);
      continue;
    }
    // Allow an explicit null to clear an optional field.
    if (value === null) {
      delete base[key];
      continue;
    }
    const result = validateSettingsValue(key, value, rule);
    if (!result.ok) {
      rejected.push({ key, reason: result.reason || 'invalid' });
      continue;
    }
    base[key] = result.value;
  }

  if (droppedKeys.length > 0) {
    logger.warn(`Dropped non-whitelisted invitation settings keys: ${droppedKeys.join(', ')}`);
  }

  return { settings: base, droppedKeys, rejected };
}

/**
 * Top-level invitation field policy. Keys that are not listed here are dropped.
 * `slug` is intentionally absent: it is validated by the route schema and gated
 * separately in the controller.
 */
const TOP_LEVEL_STRING_KEYS: Record<string, number> = {
  template_id: 100,
  bride_name: 100,
  groom_name: 100,
  host_names: 200,
  location_name: 200,
  address: 500,
  start_time: 20,
  end_time: 20,
  event_date: 40,
};

const TOP_LEVEL_URL_KEYS: Record<string, number> = {
  google_maps_url: 1000,
  waze_url: 1000,
};

const EVENT_TYPES = ['Walimatulurus', 'Majlis Tunang', 'Majlis Persandingan', 'Others'] as const;

export interface InvitationSanitizeResult {
  fields: Record<string, unknown>;
  settings: Record<string, unknown>;
  droppedFields: string[];
  droppedSettingsKeys: string[];
  rejected: Array<{ field: string; reason: string }>;
}

function sanitizeUrlList(value: unknown, maxItems: number, maxLength: number): FieldResult {
  if (!Array.isArray(value)) return { ok: false, reason: 'must be an array' };
  if (value.length > maxItems) return { ok: false, reason: `must have at most ${maxItems} items` };
  const out: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') return { ok: false, reason: 'items must be strings' };
    if (item.length > maxLength) return { ok: false, reason: 'item too long' };
    if (!isHttpUrl(item)) return { ok: false, reason: 'items must be http(s) URLs or relative paths' };
    out.push(item);
  }
  return { ok: true, value: out };
}

function sanitizeScalarObject(value: unknown, maxBytes: number, allowedKeys?: Record<string, number>): FieldResult {
  if (!isPlainObject(value)) return { ok: false, reason: 'must be an object' };
  if (JSON.stringify(value).length > maxBytes) return { ok: false, reason: `must be at most ${maxBytes} bytes` };
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (allowedKeys && !(key in allowedKeys)) {
      return { ok: false, reason: `unknown key: ${key}` };
    }
    if (typeof nested === 'string') {
      const max = allowedKeys?.[key] ?? 500;
      if (nested.length > max) return { ok: false, reason: `${key} too long` };
      out[key] = nested;
    } else if (typeof nested === 'number' || typeof nested === 'boolean' || nested === null) {
      out[key] = nested;
    } else {
      return { ok: false, reason: `${key} must be a scalar value` };
    }
  }
  return { ok: true, value: out };
}

function sanitizeMoneyGift(value: unknown): FieldResult {
  return sanitizeScalarObject(value, 2000, {
    enabled: 10,
    bank_name: 100,
    account_no: 60,
    account_holder: 100,
    qr_url: 1000,
    gift_title: 100,
    gift_subtitle: 100,
  });
}

function sanitizeWishlist(value: unknown): FieldResult {
  if (!isPlainObject(value)) return { ok: false, reason: 'must be an object' };
  if (JSON.stringify(value).length > 12000) return { ok: false, reason: 'must be at most 12000 bytes' };
  const out: Record<string, unknown> = {};
  for (const key of ['enabled', 'receiver_phone', 'receiver_address', 'wishlist_title', 'wishlist_subtitle']) {
    if (value[key] === undefined) continue;
    const nested = value[key];
    if (key === 'enabled') {
      if (typeof nested !== 'boolean') return { ok: false, reason: 'enabled must be a boolean' };
    } else if (typeof nested !== 'string' || nested.length > 500) {
      return { ok: false, reason: `${key} must be a string under 500 characters` };
    }
    out[key] = nested;
  }
  if (value.items !== undefined) {
    if (!Array.isArray(value.items)) return { ok: false, reason: 'items must be an array' };
    if (value.items.length > 50) return { ok: false, reason: 'must have at most 50 items' };
    const items: Record<string, unknown>[] = [];
    for (const raw of value.items) {
      if (!isPlainObject(raw)) return { ok: false, reason: 'items must be objects' };
      const item: Record<string, unknown> = {};
      for (const [key, nested] of Object.entries(raw)) {
        if (key === 'id' && (typeof nested === 'string' || nested === null)) {
          item[key] = nested;
          continue;
        }
        if (typeof nested === 'string' && nested.length <= 500) {
          item[key] = nested;
          continue;
        }
        if (typeof nested === 'number' || typeof nested === 'boolean') {
          item[key] = nested;
          continue;
        }
        return { ok: false, reason: `unsupported wishlist item field: ${key}` };
      }
      items.push(item);
    }
    out.items = items;
  }
  return { ok: true, value: out };
}

function sanitizeItinerary(value: unknown): FieldResult {
  if (!Array.isArray(value)) return { ok: false, reason: 'must be an array' };
  if (value.length > 40) return { ok: false, reason: 'must have at most 40 items' };
  const out: Record<string, unknown>[] = [];
  for (const raw of value) {
    if (!isPlainObject(raw)) return { ok: false, reason: 'items must be objects' };
    const item: Record<string, unknown> = {};
    for (const key of ['id', 'time', 'activity']) {
      const nested = raw[key];
      if (nested === undefined) continue;
      if (typeof nested !== 'string') return { ok: false, reason: `${key} must be a string` };
      if (nested.length > 200) return { ok: false, reason: `${key} too long` };
      item[key] = nested;
    }
    out.push(item);
  }
  return { ok: true, value: out };
}

function sanitizeContacts(value: unknown): FieldResult {
  if (!Array.isArray(value)) return { ok: false, reason: 'must be an array' };
  if (value.length > 24) return { ok: false, reason: 'must have at most 24 items' };
  const out: Record<string, unknown>[] = [];
  for (const raw of value) {
    if (!isPlainObject(raw)) return { ok: false, reason: 'items must be objects' };
    const item: Record<string, unknown> = {};
    for (const key of ['id', 'name', 'relation', 'phone']) {
      const nested = raw[key];
      if (nested === undefined) continue;
      if (typeof nested !== 'string') return { ok: false, reason: `${key} must be a string` };
      const max = key === 'id' ? 100 : key === 'phone' ? 40 : 120;
      if (nested.length > max) return { ok: false, reason: `${key} too long` };
      item[key] = nested;
    }
    out.push(item);
  }
  return { ok: true, value: out };
}

const RSVP_RESPONSE_MODES = ['rsvp_and_wish', 'wish_only', 'external', 'none'] as const;
const RSVP_FIELD_KEYS = [
  'name',
  'phone',
  'email',
  'address',
  'company',
  'job_title',
  'car_plate',
  'remarks',
  'wish',
] as const;

function sanitizeRsvpSettings(value: unknown): FieldResult {
  if (!isPlainObject(value)) return { ok: false, reason: 'must be an object' };
  if (JSON.stringify(value).length > 4000) return { ok: false, reason: 'must be at most 4000 bytes' };

  const out: Record<string, unknown> = {};

  if (value.response_mode !== undefined) {
    if (typeof value.response_mode !== 'string' || !RSVP_RESPONSE_MODES.includes(value.response_mode as any)) {
      return { ok: false, reason: `response_mode must be one of: ${RSVP_RESPONSE_MODES.join(', ')}` };
    }
    out.response_mode = value.response_mode;
  }

  for (const key of ['external_url', 'note', 'closing_date']) {
    if (value[key] === undefined) continue;
    const nested = value[key];
    if (nested === null) {
      out[key] = null;
      continue;
    }
    if (typeof nested !== 'string') return { ok: false, reason: `${key} must be a string` };
    if (nested.length > (key === 'external_url' ? 1000 : 200)) return { ok: false, reason: `${key} too long` };
    if (key === 'external_url' && nested !== '' && !isHttpUrl(nested)) {
      return { ok: false, reason: 'external_url must be an http(s) URL' };
    }
    out[key] = nested;
  }

  for (const key of ['has_children_policy', 'has_slots']) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== 'boolean') return { ok: false, reason: `${key} must be a boolean` };
    out[key] = value[key];
  }

  for (const key of ['pax_limit_per_rsvp', 'total_guest_limit']) {
    if (value[key] === undefined) continue;
    const nested = value[key];
    if (typeof nested !== 'number' || !Number.isFinite(nested) || nested < 0 || nested > 100000) {
      return { ok: false, reason: `${key} must be a number between 0 and 100000` };
    }
    out[key] = nested;
  }

  if (value.fields !== undefined) {
    if (!isPlainObject(value.fields)) return { ok: false, reason: 'fields must be an object' };
    const fields: Record<string, boolean> = {};
    for (const [key, nested] of Object.entries(value.fields)) {
      if (!(RSVP_FIELD_KEYS as readonly string[]).includes(key)) {
        return { ok: false, reason: `unknown rsvp field: ${key}` };
      }
      if (typeof nested !== 'boolean') return { ok: false, reason: `fields.${key} must be a boolean` };
      fields[key] = nested;
    }
    out.fields = fields;
  }

  if (value.slots_options !== undefined) {
    if (!Array.isArray(value.slots_options)) return { ok: false, reason: 'slots_options must be an array' };
    if (value.slots_options.length > 50) return { ok: false, reason: 'too many slots_options' };
    const slots: string[] = [];
    for (const nested of value.slots_options) {
      if (typeof nested !== 'string' || nested.length > 100) {
        return { ok: false, reason: 'slots_options items must be short strings' };
      }
      slots.push(nested);
    }
    out.slots_options = slots;
  }

  return { ok: true, value: out };
}

/**
 * Sanitize a create/update payload.
 *
 * @param body raw request body
 * @param existingSettings current settings row (update) or {} (create)
 */
export function sanitizeInvitationPayload(body: unknown, existingSettings: unknown = {}): InvitationSanitizeResult {
  const droppedFields: string[] = [];
  const rejected: Array<{ field: string; reason: string }> = [];
  const fields: Record<string, unknown> = {};

  if (!isPlainObject(body)) {
    return {
      fields,
      settings: isPlainObject(existingSettings) ? { ...existingSettings } : {},
      droppedFields,
      droppedSettingsKeys: [],
      rejected: [{ field: 'body', reason: 'must be an object' }],
    };
  }

  for (const [key, value] of Object.entries(body)) {
    switch (key) {
      case 'template_id':
      case 'bride_name':
      case 'groom_name':
      case 'host_names':
      case 'location_name':
      case 'address':
      case 'start_time':
      case 'end_time':
      case 'event_date': {
        const max = TOP_LEVEL_STRING_KEYS[key];
        if (typeof value !== 'string') {
          rejected.push({ field: key, reason: 'must be a string' });
        } else if (value.length > max) {
          rejected.push({ field: key, reason: `must be at most ${max} characters` });
        } else {
          fields[key] = value;
        }
        break;
      }
      case 'event_type': {
        if (typeof value !== 'string' || !EVENT_TYPES.includes(value as (typeof EVENT_TYPES)[number])) {
          rejected.push({ field: key, reason: `must be one of: ${EVENT_TYPES.join(', ')}` });
        } else {
          fields[key] = value;
        }
        break;
      }
      case 'google_maps_url':
      case 'waze_url': {
        if (typeof value === 'undefined') break;
        if (value === null) {
          fields[key] = null;
          break;
        }
        if (typeof value !== 'string') {
          rejected.push({ field: key, reason: 'must be a string' });
        } else if (value === '') {
          fields[key] = value;
        } else if (value.length > TOP_LEVEL_URL_KEYS[key]) {
          rejected.push({ field: key, reason: 'URL too long' });
        } else if (!isHttpUrl(value)) {
          rejected.push({ field: key, reason: 'must be an http(s) URL' });
        } else {
          fields[key] = value;
        }
        break;
      }
      case 'gallery': {
        const result = sanitizeUrlList(value, 60, 1000);
        if (!result.ok) rejected.push({ field: key, reason: result.reason || 'invalid' });
        else fields[key] = result.value;
        break;
      }
      case 'itinerary': {
        const result = sanitizeItinerary(value);
        if (!result.ok) rejected.push({ field: key, reason: result.reason || 'invalid' });
        else fields[key] = result.value;
        break;
      }
      case 'contacts': {
        const result = sanitizeContacts(value);
        if (!result.ok) rejected.push({ field: key, reason: result.reason || 'invalid' });
        else fields[key] = result.value;
        break;
      }
      case 'rsvp_settings': {
        const result = sanitizeRsvpSettings(value);
        if (!result.ok) rejected.push({ field: key, reason: result.reason || 'invalid' });
        else fields[key] = result.value;
        break;
      }
      case 'money_gift_details': {
        const result = sanitizeMoneyGift(value);
        if (!result.ok) rejected.push({ field: key, reason: result.reason || 'invalid' });
        else fields[key] = result.value;
        break;
      }
      case 'wishlist_details': {
        const result = sanitizeWishlist(value);
        if (!result.ok) rejected.push({ field: key, reason: result.reason || 'invalid' });
        else fields[key] = result.value;
        break;
      }
      case 'slug':
        // Validated by the route schema; the paid-Elite gate is enforced in the controller.
        if (typeof value === 'string') fields[key] = value;
        break;
      default:
        droppedFields.push(key);
        break;
    }
  }

  const settingsResult = sanitizeSettings((body as Record<string, unknown>).settings, existingSettings);
  rejected.push(...settingsResult.rejected.map(item => ({ field: `settings.${item.key}`, reason: item.reason })));

  if (droppedFields.length > 0) {
    logger.warn(`Dropped non-whitelisted invitation fields: ${droppedFields.join(', ')}`);
  }

  return {
    fields,
    settings: settingsResult.settings,
    droppedFields,
    droppedSettingsKeys: settingsResult.droppedKeys,
    rejected,
  };
}
