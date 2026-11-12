// ÚNICO archivo de esta funcionalidad que importa tu tema.
// Si las claves de tu src/theme/index.js se llaman distinto, ajústalas aquí
// (los valores después de "??" son respaldos por si la clave no existe).
import * as tema from '../theme';

const colors = tema.colors ?? tema.default?.colors ?? {};
const spacing = tema.spacing ?? tema.default?.spacing ?? {};
const radius = tema.radius ?? tema.default?.radius ?? {};

export const COLOR = {
  primario: colors.primary ?? '#4F46E5',
  fondo: colors.background ?? '#F8FAFC',
  superficie: colors.surface ?? '#FFFFFF',
  texto: colors.text ?? '#0F172A',
  textoSuave: colors.textSecondary ?? '#64748B',
  borde: colors.border ?? '#E2E8F0',
  error: colors.danger ?? colors.error ?? '#DC2626',
  advertencia: colors.warning ?? '#B45309',
  fondoAdvertencia: colors.warningBackground ?? '#FEF3C7',
};

export const ESPACIO = {
  s: spacing.sm ?? 8,
  m: spacing.md ?? 16,
  l: spacing.lg ?? 24,
};

export const RADIO = {
  m: radius.md ?? 12,
};
