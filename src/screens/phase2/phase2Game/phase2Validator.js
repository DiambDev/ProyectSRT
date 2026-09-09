import { PHASE2_CONTACTS } from './phase2Data.js';

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