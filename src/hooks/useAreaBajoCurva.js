import { useMemo, useState } from 'react';
import {
  FUNCIONES,
  N_MAX,
  areaExacta,
  sumaInferior,
  sumaIntermedia,
  sumaPuntoMedio,
  sumaRiemann,
  sumaSuperior,
} from '../utils/areaBajoCurva';

// Acepta "1,5" y "1.5"
const aNumero = (texto) => Number(String(texto).trim().replace(',', '.'));

export default function useAreaBajoCurva() {
  const [funcionId, setFuncionId] = useState(FUNCIONES[0].id);
  // a y b se guardan como texto para que el TextInput no "pelee" con lo que se escribe
  const [a, setA] = useState('0');
  const [b, setB] = useState('2');
  const [n, setNState] = useState(5);

  const funcion = FUNCIONES.find((item) => item.id === funcionId);

  const setN = (valor) => setNState(Math.min(N_MAX, Math.max(1, Math.round(valor))));

  // Valores derivados: se recalculan solo cuando cambia algo de la lista de dependencias.
  const { resultados, error } = useMemo(() => {
    const ai = aNumero(a);
    const bi = aNumero(b);

    if (a.trim() === '' || b.trim() === '' || !Number.isFinite(ai) || !Number.isFinite(bi)) {
      return { resultados: null, error: 'Escribe valores numéricos para a y b.' };
    }
    if (ai >= bi) {
      return { resultados: null, error: 'Debe cumplirse a < b.' };
    }

    // La gráfica y el área solo están pensadas para f(x) ≥ 0 en [a, b]
    for (let k = 0; k <= 100; k++) {
      if (funcion.f(ai + ((bi - ai) * k) / 100) < 0) {
        return {
          resultados: null,
          error: 'La función es negativa en ese intervalo. Prueba con otro [a, b].',
        };
      }
    }

    const { f, F } = funcion;
    return {
      error: null,
      resultados: {
        a: ai,
        b: bi,
        inferior: sumaInferior(f, ai, bi, n),
        superior: sumaSuperior(f, ai, bi, n),
        intermedia: sumaIntermedia(f, ai, bi, n),
        puntoMedio: sumaPuntoMedio(f, ai, bi, n),
        riemann: sumaRiemann(f, ai, bi),
        exacto: areaExacta(F, ai, bi),
      },
    };
  }, [funcion, a, b, n]);

  return { funcion, setFuncionId, a, setA, b, setB, n, setN, resultados, error };
}
