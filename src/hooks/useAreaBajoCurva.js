import { useMemo, useState } from 'react';
import { EJEMPLOS } from '../data/ejemplosAreaCurva';
import { calcularArea } from '../utils/calcularArea';

const INICIAL = {
  funcion: EJEMPLOS[0].funcion,
  a: EJEMPLOS[0].a,
  b: EJEMPLOS[0].b,
  n: EJEMPLOS[0].n,
};

// Espera un instante para que React alcance a pintar "Calculando…" antes de un cálculo pesado.
const PAUSA_MS = 30;

export default function useAreaBajoCurva() {
  // "borrador" = lo que el usuario está escribiendo (todo texto).
  // "aplicado" = lo último que se calculó. Se separan para no recalcular con cada tecla
  // (con n = 1.000.000 eso congelaría la app mientras se escribe).
  const [borrador, setBorrador] = useState(INICIAL);
  const [aplicado, setAplicado] = useState(INICIAL);
  const [calculando, setCalculando] = useState(false);

  const cambiarCampo = (campo, valor) => setBorrador((anterior) => ({ ...anterior, [campo]: valor }));

  const aplicar = (entradas) => {
    setCalculando(true);
    setTimeout(() => {
      setAplicado(entradas);
      setCalculando(false);
    }, PAUSA_MS);
  };

  const calcular = () => aplicar(borrador);

  // Llena los campos con un ejemplo y calcula de inmediato
  const usarEjemplo = (ejemplo) => {
    const entradas = { funcion: ejemplo.funcion, a: ejemplo.a, b: ejemplo.b, n: ejemplo.n };
    setBorrador(entradas);
    aplicar(entradas);
  };

  // Valor derivado: la validación y el cálculo viven en utils/calcularArea.js (función pura).
  // useMemo evita repetirlo si no cambió lo aplicado.
  const { errores, advertencias, resultados } = useMemo(() => calcularArea(aplicado), [aplicado]);

  return {
    borrador,
    cambiarCampo,
    calcular,
    usarEjemplo,
    calculando,
    hayCambiosSinCalcular: borrador !== aplicado,
    errores,
    advertencias,
    resultados,
  };
}
