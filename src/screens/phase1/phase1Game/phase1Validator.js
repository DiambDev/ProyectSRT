import { PHASE1_ANSWER_VARIANTS, PHASE1_SEQUENCE_ORDER } from './phase1Data.js';

/**
 * Normaliza el texto de entrada: minúsculas, sin acentos, sin puntuación
 * y con espacios colapsados. Esto tolera diferencias razonables de
 * mayúsculas, acentos y espaciado, pero la comparación sigue siendo
 * exacta contra variantes controladas (no se aceptan respuestas
 * semánticamente diferentes).
 */
export function normalizeText(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[.,;:¿?¡!()\[\]/\\'"«»-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCorrectAnswer(text) {
  const normalized = normalizeText(text);
  if (!normalized) return false;
  return PHASE1_ANSWER_VARIANTS.some((variant) => normalizeText(variant) === normalized);
}

export function isCorrectSequence(ids) {
  if (!Array.isArray(ids) || ids.length !== PHASE1_SEQUENCE_ORDER.length) return false;
  return PHASE1_SEQUENCE_ORDER.every((id, i) => ids[i] === id);
}