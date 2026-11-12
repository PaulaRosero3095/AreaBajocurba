import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MAX_RECTANGULOS_GRAFICA, alturaRectangulo } from '../utils/areaBajoCurva';
import { formatearCorto, formatearEntero } from '../utils/formato';
import { COLOR } from '../utils/temaAreaCurva';

const PUNTOS_CURVA = 60;
const TAM_PUNTO = 4;

// Dibuja rectángulos con View absolutos (sin react-native-svg) y la curva con puntos pequeños.
// minY y maxY son el mínimo y el máximo reales de f en [a, b]; el eje se escala con ellos
// e incluye siempre el 0, así los valores negativos quedan por debajo del eje x.
export default function GraficaRectangulos({
  f,
  a,
  b,
  n,
  modo,
  minY,
  maxY,
  anchoGrafica,
  altoGrafica = 220,
}) {
  const nDibujo = Math.min(n, MAX_RECTANGULOS_GRAFICA);
  const simplificada = n > MAX_RECTANGULOS_GRAFICA;

  const { rectangulos, curva, base } = useMemo(() => {
    const yMin = Math.min(0, minY);
    const yMax = Math.max(0, maxY);
    const rango = yMax - yMin || 1;
    const escala = altoGrafica / rango;
    const distanciaAlCero = -yMin * escala; // distancia desde el borde inferior hasta y = 0
    const dx = (b - a) / nDibujo;

    const rects = Array.from({ length: nDibujo }, (_, i) => {
      const altura = alturaRectangulo(f, a, dx, i, modo);
      const alto = Math.abs(altura) * escala;
      return {
        key: `r${i}`,
        left: (i / nDibujo) * anchoGrafica,
        width: anchoGrafica / nDibujo,
        height: alto,
        bottom: altura >= 0 ? distanciaAlCero : distanciaAlCero - alto,
        negativo: altura < 0,
      };
    });

    const puntos = Array.from({ length: PUNTOS_CURVA + 1 }, (_, k) => {
      const x = a + ((b - a) * k) / PUNTOS_CURVA;
      return {
        key: `p${k}`,
        left: (k / PUNTOS_CURVA) * anchoGrafica - TAM_PUNTO / 2,
        bottom: (f(x) - yMin) * escala - TAM_PUNTO / 2,
      };
    });

    return { rectangulos: rects, curva: puntos, base: distanciaAlCero };
  }, [f, a, b, nDibujo, modo, minY, maxY, anchoGrafica, altoGrafica]);

  return (
    <View>
      <View style={[styles.contenedor, { width: anchoGrafica, height: altoGrafica }]}>
        {rectangulos.map((r) => (
          <View
            key={r.key}
            style={[
              styles.rectangulo,
              r.negativo && styles.rectanguloNegativo,
              { left: r.left, width: r.width, height: r.height, bottom: r.bottom },
            ]}
          />
        ))}
        <View style={[styles.ejeX, { bottom: base, width: anchoGrafica }]} />
        <View style={styles.ejeY} />
        {curva.map((p) => (
          <View key={p.key} style={[styles.punto, { left: p.left, bottom: p.bottom }]} />
        ))}
      </View>
      <View style={[styles.etiquetas, { width: anchoGrafica }]}>
        <Text style={styles.etiqueta}>x = {formatearCorto(a)}</Text>
        <Text style={styles.etiqueta}>x = {formatearCorto(b)}</Text>
      </View>
      {simplificada ? (
        <Text style={[styles.nota, { width: anchoGrafica }]}>
          Gráfica simplificada: se muestran {MAX_RECTANGULOS_GRAFICA} de {formatearEntero(n)} rectángulos. Los
          resultados usan los n completos.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { overflow: 'hidden' },
  rectangulo: {
    position: 'absolute',
    backgroundColor: COLOR.primario,
    opacity: 0.35,
    borderWidth: 1,
    borderColor: COLOR.primario,
  },
  rectanguloNegativo: { backgroundColor: COLOR.error, borderColor: COLOR.error },
  ejeX: { position: 'absolute', left: 0, height: 2, backgroundColor: COLOR.texto },
  ejeY: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, backgroundColor: COLOR.texto },
  punto: {
    position: 'absolute',
    width: TAM_PUNTO,
    height: TAM_PUNTO,
    borderRadius: TAM_PUNTO / 2,
    backgroundColor: COLOR.texto,
  },
  etiquetas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  etiqueta: { fontSize: 12, color: COLOR.textoSuave },
  nota: { fontSize: 12, color: COLOR.textoSuave, marginTop: 6 },
});
