import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GraficaRectangulos from '../components/GraficaRectangulos';
import ResultadoSuma from '../components/ResultadoSuma';
import useAreaBajoCurva from '../hooks/useAreaBajoCurva';
import { FUNCIONES, N_MAX, N_RIEMANN } from '../utils/areaBajoCurva';
import { COLOR, ESPACIO, RADIO } from '../utils/temaAreaCurva';

const MODOS = [
  { id: 'inferior', etiqueta: 'Inferior' },
  { id: 'superior', etiqueta: 'Superior' },
  { id: 'medio', etiqueta: 'Punto medio' },
];

// Botón tipo "chip" reutilizable dentro de esta pantalla
function Chip({ texto, activo, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, activo && styles.chipActivo]}>
      <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>{texto}</Text>
    </Pressable>
  );
}

export default function AreaCurvaScreen() {
  const { funcion, setFuncionId, a, setA, b, setB, n, setN, resultados, error } =
    useAreaBajoCurva();
  const [modo, setModo] = useState('inferior');
  const { width } = useWindowDimensions();
  const anchoGrafica = width - ESPACIO.m * 2 - 4;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Área bajo la curva</Text>
        <Text style={styles.subtitulo}>Aproximación por rectángulos de ancho fijo</Text>

        <Text style={styles.etiqueta}>Función</Text>
        <View style={styles.fila}>
          {FUNCIONES.map((item) => (
            <Chip
              key={item.id}
              texto={item.etiqueta}
              activo={item.id === funcion.id}
              onPress={() => setFuncionId(item.id)}
            />
          ))}
        </View>

        <Text style={styles.etiqueta}>Intervalo [a, b]</Text>
        <View style={styles.fila}>
          <TextInput
            style={styles.input}
            value={a}
            onChangeText={setA}
            keyboardType="numeric"
            placeholder="a"
            accessibilityLabel="Límite inferior a"
          />
          <TextInput
            style={styles.input}
            value={b}
            onChangeText={setB}
            keyboardType="numeric"
            placeholder="b"
            accessibilityLabel="Límite superior b"
          />
        </View>

        <Text style={styles.etiqueta}>Número de rectángulos (n)</Text>
        <View style={styles.stepper}>
          <Pressable style={styles.botonN} onPress={() => setN(n - 1)}>
            <Text style={styles.botonNTexto}>−</Text>
          </Pressable>
          <Text style={styles.valorN}>{n}</Text>
          <Pressable style={styles.botonN} onPress={() => setN(n + 1)}>
            <Text style={styles.botonNTexto}>+</Text>
          </Pressable>
          <Pressable style={styles.botonN} onPress={() => setN(n + 10)}>
            <Text style={styles.botonNTexto}>+10</Text>
          </Pressable>
        </View>
        <Text style={styles.ayuda}>Máximo {N_MAX}. Más rectángulos = mejor aproximación.</Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.etiqueta}>Gráfica</Text>
            <View style={styles.fila}>
              {MODOS.map((item) => (
                <Chip
                  key={item.id}
                  texto={item.etiqueta}
                  activo={item.id === modo}
                  onPress={() => setModo(item.id)}
                />
              ))}
            </View>
            <View style={styles.grafica}>
              <GraficaRectangulos
                f={funcion.f}
                a={resultados.a}
                b={resultados.b}
                n={n}
                modo={modo}
                anchoGrafica={anchoGrafica}
              />
            </View>

            <Text style={styles.etiqueta}>Resultados</Text>
            <ResultadoSuma
              titulo="Suma inferior"
              detalle="Rectángulos por debajo de la curva"
              valor={resultados.inferior}
            />
            <ResultadoSuma
              titulo="Suma superior"
              detalle="Rectángulos por encima de la curva"
              valor={resultados.superior}
            />
            <ResultadoSuma
              titulo="Suma intermedia"
              detalle="(Inferior + Superior) / 2"
              valor={resultados.intermedia}
            />
            <ResultadoSuma
              titulo="Punto medio"
              detalle="f evaluada en el centro de cada rectángulo"
              valor={resultados.puntoMedio}
            />
            <ResultadoSuma
              titulo="Suma de Riemann"
              detalle={`Aproximación con n = ${N_RIEMANN.toLocaleString('es-CO')}`}
              valor={resultados.riemann}
            />
            <ResultadoSuma
              titulo="Área exacta (integral)"
              detalle="F(b) − F(a)"
              valor={resultados.exacto}
              destacado
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.fondo },
  contenido: { padding: ESPACIO.m, paddingBottom: ESPACIO.l * 2 },
  titulo: { fontSize: 24, fontWeight: '700', color: COLOR.texto },
  subtitulo: { fontSize: 14, color: COLOR.textoSuave, marginBottom: ESPACIO.s },
  etiqueta: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.texto,
    marginTop: ESPACIO.m,
    marginBottom: ESPACIO.s,
  },
  fila: { flexDirection: 'row', flexWrap: 'wrap', gap: ESPACIO.s },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLOR.borde,
    backgroundColor: COLOR.superficie,
  },
  chipActivo: { backgroundColor: COLOR.primario, borderColor: COLOR.primario },
  chipTexto: { color: COLOR.texto, fontSize: 14 },
  chipTextoActivo: { color: '#FFFFFF', fontWeight: '600' },
  input: {
    flex: 1,
    minWidth: 100,
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.m,
    backgroundColor: COLOR.superficie,
    paddingHorizontal: ESPACIO.m,
    paddingVertical: 10,
    fontSize: 16,
    color: COLOR.texto,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: ESPACIO.m },
  botonN: {
    minWidth: 44,
    height: 44,
    paddingHorizontal: 10,
    borderRadius: RADIO.m,
    backgroundColor: COLOR.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonNTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  valorN: { fontSize: 20, fontWeight: '700', color: COLOR.texto, minWidth: 40, textAlign: 'center' },
  ayuda: { fontSize: 12, color: COLOR.textoSuave, marginTop: 6 },
  error: { color: COLOR.error, marginTop: ESPACIO.m, fontSize: 14 },
  grafica: { alignItems: 'center', paddingVertical: ESPACIO.s },
});
