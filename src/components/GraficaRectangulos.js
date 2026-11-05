import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { alturaRectangulo, ancho } from '../utils/areaBajoCurva';
import { COLOR } from '../utils/temaAreaCurva';

const PUNTOS_CURVA = 60;
const TAM_PUNTO = 4;

// Dibuja los rectángulos con View absolutos (sin react-native-svg) y la curva con puntos pequeños.
export default function GraficaRectangulos({ f, a, b, n, modo, anchoGrafica, altoGrafica = 220 }) {
  const { rectangulos, curva } = useMemo(() => {
    const dx = ancho(a, b, n);

    // Valor máximo de f para escalar la gráfica al alto disponible
    let maxY = 0;
    for (let k = 0; k <= 100; k++) maxY = Math.max(maxY, f(a + ((b - a) * k) / 100));
    if (maxY <= 0) maxY = 1;

    const rects = Array.from({ length: n }, (_, i) => {
      const altura = Math.max(0, alturaRectangulo(f, a, dx, i, modo));
      return {
        key: `r${i}`,
        left: (i / n) * anchoGrafica,
        width: anchoGrafica / n,
        height: (altura / maxY) * altoGrafica,
      };
    });

    const puntos = Array.from({ length: PUNTOS_CURVA + 1 }, (_, k) => {
      const x = a + ((b - a) * k) / PUNTOS_CURVA;
      return {
        key: `p${k}`,
        left: (k / PUNTOS_CURVA) * anchoGrafica - TAM_PUNTO / 2,
        bottom: (Math.max(0, f(x)) / maxY) * altoGrafica - TAM_PUNTO / 2,
      };
    });

    return { rectangulos: rects, curva: puntos };
  }, [f, a, b, n, modo, anchoGrafica, altoGrafica]);

  return (
    <View style={[styles.contenedor, { width: anchoGrafica, height: altoGrafica }]}>
      {rectangulos.map((r) => (
        <View
          key={r.key}
          style={[styles.rectangulo, { left: r.left, width: r.width, height: r.height }]}
        />
      ))}
      {curva.map((p) => (
        <View key={p.key} style={[styles.punto, { left: p.left, bottom: p.bottom }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLOR.texto,
  },
  rectangulo: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: COLOR.primario,
    opacity: 0.35,
    borderWidth: 1,
    borderColor: COLOR.primario,
  },
  punto: {
    position: 'absolute',
    width: TAM_PUNTO,
    height: TAM_PUNTO,
    borderRadius: TAM_PUNTO / 2,
    backgroundColor: COLOR.texto,
  },
});
