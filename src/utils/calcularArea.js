// Toda la validación y el cálculo, en funciones puras (sin React).
// El hook solo llama a calcularArea dentro de un useMemo; así esta lógica se prueba en Node.
import { N_RIEMANN, calcularSumas, explorarFuncion, simpson } from './areaBajoCurva.js';
import { formatearCorto, formatearEntero } from './formato.js';
import { parsearFuncion, parsearNumero } from './parseFuncion.js';

// Tope de seguridad: más allá de esto el celular tardaría demasiado y la app parecería congelada.
export const N_LIMITE = 5000000;

// Valida el texto de n. Devuelve { ok: true, n } o { ok: false, error }.
export function validarN(texto) {
  const t = String(texto).trim();
  if (t === '') return { ok: false, error: 'Escribe el número de rectángulos (n).' };
  if (/^-\d+([.,]\d+)?$/.test(t)) return { ok: false, error: 'n debe ser positivo (mayor o igual a 1).' };
  if (/^\d+[.,]\d*$/.test(t)) return { ok: false, error: 'n debe ser un número entero, sin decimales.' };
  if (!/^\d+$/.test(t)) return { ok: false, error: 'n debe ser un número entero positivo (solo dígitos).' };
  const n = Number(t);
  if (n < 1) return { ok: false, error: 'n debe ser mayor o igual a 1 (0 no es válido).' };
  if (n > N_LIMITE) {
    return { ok: false, error: `n es demasiado grande: el máximo es ${formatearEntero(N_LIMITE)}.` };
  }
  return { ok: true, n };
}

// entradas: { funcion, a, b, n } (todo texto, tal como lo escribe el usuario)
// Devuelve { errores: { funcion?, a?, b?, n? }, advertencias: [texto], resultados | null }
export function calcularArea({ funcion, a, b, n }) {
  const errores = {};
  const advertencias = [];

  const pf = parsearFuncion(funcion);
  const pa = parsearNumero(a);
  const pb = parsearNumero(b);
  const pn = validarN(n);
  if (!pf.ok) errores.funcion = pf.error;
  if (!pa.ok) errores.a = pa.error;
  if (!pb.ok) errores.b = pb.error;
  if (!pn.ok) errores.n = pn.error;
  if (Object.keys(errores).length > 0) return { errores, advertencias, resultados: null };

  const f = pf.f;
  let desde = pa.valor;
  let hasta = pb.valor;
  let signo = 1;

  // Si a > b se intercambian: ∫ de a a b = −∫ de b a a
  if (desde > hasta) {
    [desde, hasta] = [hasta, desde];
    signo = -1;
    advertencias.push(
      `a es mayor que b: se intercambiaron los límites. El resultado se interpreta como el negativo de la integral de ${formatearCorto(desde)} a ${formatearCorto(hasta)}.`,
    );
  }

  // Si a = b el intervalo mide 0 y el área es 0
  if (desde === hasta) {
    advertencias.push('a es igual a b: el intervalo mide 0, así que el área es 0.');
    return {
      errores,
      advertencias,
      resultados: {
        intervaloNulo: true,
        a: desde,
        b: hasta,
        n: pn.n,
        f,
        inferior: 0,
        superior: 0,
        intermedia: 0,
        puntoMedio: 0,
        riemann: 0,
        referencia: 0,
      },
    };
  }

  // ¿La función está definida en todo el intervalo? Además obtiene el mínimo y el máximo reales.
  const exploracion = explorarFuncion(f, desde, hasta);
  if (exploracion.invalido) {
    errores.funcion = `La función no está definida en x = ${formatearCorto(exploracion.invalido.x)}: el resultado no es un número finito. Revisa el dominio o los límites.`;
    return { errores, advertencias, resultados: null };
  }
  if (exploracion.min < -1e-9) {
    advertencias.push('El resultado es área neta (con signo), no área total.');
  }

  const sumas = calcularSumas(f, desde, hasta, pn.n);
  const valores = {
    inferior: sumas.inferior,
    superior: sumas.superior,
    intermedia: (sumas.inferior + sumas.superior) / 2,
    puntoMedio: sumas.medio,
    riemann: calcularSumas(f, desde, hasta, N_RIEMANN).inferior,
    referencia: simpson(f, desde, hasta),
  };

  if (Object.values(valores).some((v) => !Number.isFinite(v))) {
    errores.funcion = 'No se pudo calcular: la función da valores no válidos dentro del intervalo.';
    return { errores, advertencias, resultados: null };
  }

  // Aplica el signo (−1 si se intercambiaron los límites). "+ 0" evita mostrar −0.
  const resultados = { intervaloNulo: false, a: desde, b: hasta, n: pn.n, f };
  Object.keys(valores).forEach((clave) => {
    resultados[clave] = valores[clave] * signo + 0;
  });
  resultados.minY = exploracion.min;
  resultados.maxY = exploracion.max;
  return { errores, advertencias, resultados };
}
