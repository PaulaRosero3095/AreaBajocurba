import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import useAreaBajoCurva from '../hooks/useAreaBajoCurva';
import TecladoMatematico from '../components/TecladoMatematico';
import GraficaRectangulos from '../components/GraficaRectangulos';
import ResultadoSuma from '../components/ResultadoSuma';
import { EJEMPLOS } from '../data/ejemplosAreaCurva';
import { COLOR, ESPACIO, RADIO } from '../utils/temaAreaCurva';

const FUNCIONES_CON_PARENTESIS = [
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'ln', 'log', 'sqrt', 'exp', 'abs'
];

export default function AreaCurvaScreen() {
  const {
    borrador,
    cambiarCampo,
    calcular,
    usarEjemplo,
    calculando,
    hayCambiosSinCalcular,
    errores,
    advertencias,
    resultados,
  } = useAreaBajoCurva();

  const [inputActivo, setInputActivo] = useState(null);
  const [seleccion, setSeleccion] = useState({ start: 0, end: 0 });

  const refFuncion = useRef(null);
  const refA = useRef(null);
  const refB = useRef(null);
  const refN = useRef(null);

  const obtenerConfig = (key) => {
    switch (key) {
      case 'funcion':
        return { valor: borrador.funcion, ref: refFuncion, campo: 'funcion' };
      case 'a':
        return { valor: borrador.a, ref: refA, campo: 'a' };
      case 'b':
        return { valor: borrador.b, ref: refB, campo: 'b' };
      case 'n':
        return { valor: borrador.n, ref: refN, campo: 'n' };
      default:
        return null;
    }
  };

  const insertarTexto = useCallback((tecla) => {
    if (!inputActivo) return;
    const config = obtenerConfig(inputActivo);
    if (!config) return;

    const { valor: valorActual, ref: refInput, campo } = config;

    // 1. MANEJO DE BORRAR (El símbolo que envía el teclado es '⌫')
    if (tecla === '⌫') {
      let nuevoValor;
      let nuevaPos;
      if (seleccion.start !== seleccion.end) {
        nuevoValor = valorActual.slice(0, seleccion.start) + valorActual.slice(seleccion.end);
        nuevaPos = seleccion.start;
      } else if (seleccion.start > 0) {
        nuevoValor = valorActual.slice(0, seleccion.start - 1) + valorActual.slice(seleccion.start);
        nuevaPos = seleccion.start - 1;
      } else {
        return;
      }
      cambiarCampo(campo, nuevoValor);
      setSeleccion({ start: nuevaPos, end: nuevaPos });
      return;
    }

    // 2. MANEJO DE LIMPIAR TODO (El símbolo es 'C')
    if (tecla === 'C') {
      cambiarCampo(campo, '');
      setSeleccion({ start: 0, end: 0 });
      return;
    }

    // 3. INSERCIÓN DE TEXTO NORMAL
    const MAPEO_SIMBOLOS = {
      '×': '*',
      '÷': '/',
      '−': '-',
      ',': '.',
      'π': 'pi',
      '√': 'sqrt',
    };

    let textoInsertar = MAPEO_SIMBOLOS[tecla] || tecla;

    if (FUNCIONES_CON_PARENTESIS.includes(tecla)) {
      textoInsertar = tecla + '(';
    }

    const textoAntes = valorActual.slice(0, seleccion.start);
    const textoDespues = valorActual.slice(seleccion.end);
    const nuevoValor = textoAntes + textoInsertar + textoDespues;

    cambiarCampo(campo, nuevoValor);

    const nuevaPosicion = seleccion.start + textoInsertar.length;
    setSeleccion({ start: nuevaPosicion, end: nuevaPosicion });

    if (refInput.current) refInput.current.focus();
  }, [inputActivo, borrador, seleccion, cambiarCampo]);

  const manejarFoco = (input) => {
    setInputActivo(input);
    const config = obtenerConfig(input);
    if (config) {
      const len = config.valor.length;
      setSeleccion({ start: len, end: len });
    }
  };

  const manejarSeleccion = (event, input) => {
    if (input === inputActivo) {
      setSeleccion(event.nativeEvent.selection);
    }
  };

  const renderInput = (label, campo, ref, keyboardType = 'default', placeholder = '') => {
    const valor = borrador[campo];
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          ref={ref}
          style={[styles.input, inputActivo === campo && styles.inputActivo]}
          value={valor}
          onChangeText={(texto) => cambiarCampo(campo, texto)}
          onFocus={() => manejarFoco(campo)}
          onSelectionChange={(e) => manejarSeleccion(e, campo)}
          showSoftInputOnFocus={campo === 'n'} // Solo n usa teclado nativo
          keyboardType={keyboardType}
          placeholder={placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          selection={inputActivo === campo ? seleccion : undefined}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Área bajo la curva</Text>
        <Text style={styles.subtitulo}>Aproximación por rectángulos y Suma de Riemann</Text>

        {/* Chips de ejemplos */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ejemplosScroll}>
          {EJEMPLOS.map((ej) => (
            <TouchableOpacity
              key={ej.id}
              style={styles.chip}
              onPress={() => usarEjemplo(ej)}
            >
              <Text style={styles.chipTexto}>{ej.etiqueta}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Inputs */}
        {renderInput('Función f(x)', 'funcion', refFuncion, 'default', 'Ej: -x^2 + 5')}
        <View style={styles.filaInputs}>
          {renderInput('Límite inferior (a)', 'a', refA, 'default', '0')}
          {renderInput('Límite superior (b)', 'b', refB, 'default', '2')}
        </View>
        {renderInput('Número de rectángulos (n)', 'n', refN, 'numeric', '5')}

        {/* Botón Calcular */}
        <TouchableOpacity
          style={[styles.botonCalcular, (!hayCambiosSinCalcular || calculando) && styles.botonDeshabilitado]}
          onPress={calcular}
          disabled={!hayCambiosSinCalcular || calculando}
        >
          <Text style={styles.botonTexto}>
            {calculando ? 'Calculando…' : hayCambiosSinCalcular ? 'Calcular' : 'Resultados actualizados'}
          </Text>
        </TouchableOpacity>

        {/* Errores y advertencias */}
        {errores && Object.keys(errores).length > 0 && (
          <View style={styles.errorBox}>
            {Object.entries(errores).map(([campo, msg]) => (
              <Text key={campo} style={styles.errorTexto}>• {msg}</Text>
            ))}
          </View>
        )}
        {advertencias && advertencias.length > 0 && (
          <View style={styles.advertenciaBox}>
            {advertencias.map((msg, i) => (
              <Text key={i} style={styles.advertenciaTexto}>• {msg}</Text>
            ))}
          </View>
        )}

        {/* Resultados y gráfica */}
        {resultados && !resultados.intervaloNulo && (
          <>
            <View style={styles.resultadosContainer}>
              <ResultadoSuma titulo="Suma Inferior" valor={resultados.inferior} />
              <ResultadoSuma titulo="Suma Superior" valor={resultados.superior} />
              <ResultadoSuma titulo="Suma Intermedia" valor={resultados.intermedia} />
              <ResultadoSuma titulo="Punto Medio" valor={resultados.puntoMedio} />
              <ResultadoSuma titulo="Riemann (n grande)" valor={resultados.riemann} />
              <ResultadoSuma titulo="Valor de referencia (Simpson)" valor={resultados.referencia} destacado />
            </View>

            <GraficaRectangulos
              f={resultados.f}
              a={resultados.a}
              b={resultados.b}
              n={resultados.n}
              modo="inferior"
              minY={resultados.minY}
              maxY={resultados.maxY}
              anchoGrafica={300}
            />
          </>
        )}
        {resultados && resultados.intervaloNulo && (
          <Text style={styles.advertenciaTexto}>
            El intervalo mide 0: el área es 0.
          </Text>
        )}
      </ScrollView>

      {inputActivo && inputActivo !== 'n' && (
        <TecladoMatematico onTeclaPresionada={insertarTexto} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLOR.fondo },
  scrollContent: { padding: ESPACIO.m, paddingBottom: 220 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: COLOR.texto, marginBottom: 4 },
  subtitulo: { fontSize: 14, color: COLOR.textoSuave, marginBottom: ESPACIO.m },
  ejemplosScroll: { marginBottom: ESPACIO.m },
  chip: {
    backgroundColor: COLOR.superficie,
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.m,
    paddingVertical: ESPACIO.s,
    paddingHorizontal: ESPACIO.m,
    marginRight: ESPACIO.s,
  },
  chipTexto: { fontSize: 13, color: COLOR.primario, fontWeight: '600' },
  inputContainer: { marginBottom: ESPACIO.s, flex: 1 },
  filaInputs: { flexDirection: 'row', gap: ESPACIO.s },
  label: { fontSize: 14, fontWeight: '600', color: COLOR.texto, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: COLOR.borde,
    borderRadius: RADIO.m,
    padding: ESPACIO.s,
    fontSize: 16,
    backgroundColor: COLOR.superficie,
    color: COLOR.texto,
  },
  inputActivo: { borderColor: COLOR.primario, borderWidth: 2 },
  botonCalcular: {
    backgroundColor: COLOR.primario,
    borderRadius: RADIO.m,
    padding: ESPACIO.m,
    alignItems: 'center',
    marginVertical: ESPACIO.m,
  },
  botonDeshabilitado: { backgroundColor: COLOR.textoSuave },
  botonTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: RADIO.m,
    padding: ESPACIO.s,
    marginBottom: ESPACIO.s,
  },
  errorTexto: { color: COLOR.error, fontSize: 13, fontWeight: '500' },
  advertenciaBox: {
    backgroundColor: COLOR.fondoAdvertencia,
    borderRadius: RADIO.m,
    padding: ESPACIO.s,
    marginBottom: ESPACIO.s,
  },
  advertenciaTexto: { color: COLOR.advertencia, fontSize: 13, fontWeight: '500' },
  resultadosContainer: { marginTop: ESPACIO.m },
});