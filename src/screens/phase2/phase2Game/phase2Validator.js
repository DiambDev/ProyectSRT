import { PHASE2_CONTACTS } from './phase2Data.js';

const stripAccents = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function normalizeResponse(text) {
  return stripAccents(String(text || ''))
    .toLowerCase()
    .replace(/[.,;:!?¿¡\-_]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findContact(contactId) {
  return PHASE2_CONTACTS.find((c) => c.id === contactId) || null;
}

export function getTurn(contact, turnId) {
  if (!contact || !contact.turns) return null;
  return contact.turns[turnId] || null;
}

export function getChoice(contact, turnId, choiceId) {
  const turn = getTurn(contact, turnId);
  if (!turn || !turn.options) return null;
  return turn.options.find((o) => o.id === choiceId) || null;
}

export function isSafeChoice(choice) {
  return !!(choice && choice.safe);
}

export function resolveChoice(contact, turnId, choiceId) {
  const choice = getChoice(contact, turnId, choiceId);
  if (!choice) return null;
  return {
    contactId: contact.id,
    turnId,
    choiceId,
    safe: !!choice.safe,
    critical: !!choice.critical,
    next: choice.next,
  };
}

export function matchResponse(contact, text) {
  if (!contact || !Array.isArray(contact.options)) return null;
  const target = normalizeResponse(text);
  if (!target) return null;
  return contact.options.find((o) => normalizeResponse(o.label) === target) || null;
}