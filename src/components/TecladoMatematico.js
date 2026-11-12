import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLOR, ESPACIO, RADIO } from '../utils/temaAreaCurva';

const FUNCIONES = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'ln', 'log', 'sqrt', 'exp', 'abs', 'lim', 'd/dx'];
const CONSTANTES = ['π', 'e', '∞', 'Σ', '∫'];

const TECLADO = {
  basico: [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '−'],
    ['0', '.', ',', '+'],
    ['(', ')', '^', '⌫'],
    ['C', 'x']
  ],
  funciones: [
    ['sin', 'cos', 'tan', 'cot'],
    ['sec', 'csc', 'ln', 'log'],
    ['sqrt', 'exp', 'abs', 'π'],
    ['e', 'x', '(', ')'],
    ['⌫', 'C']
  ],
  avanzado: [
    ['lim', '∞', 'Σ', '∫'],
    ['d/dx', '!', '%', '√'],
    ['⌫', 'C']
  ]
};

export default function TecladoMatematico({ onTeclaPresionada }) {
  const [pestanaActiva, setPestanaActiva] = useState('basico');

  const renderTeclas = () => {
    const teclas = TECLADO[pestanaActiva];
    return teclas.map((fila, indexFila) => (
      <View key={`fila-${indexFila}`} style={styles.fila}>
        {fila.map((tecla) => {
          const esFuncion = FUNCIONES.includes(tecla);
          const esConstante = CONSTANTES.includes(tecla);
          return (
            <TouchableOpacity
              key={tecla}
              style={[
                styles.tecla,
                tecla === 'C' && styles.teclaBorrarTodo,
                tecla === '⌫' && styles.teclaBorrar,
                esFuncion && styles.teclaFuncion,
                esConstante && styles.teclaConstante,
              ]}
              onPress={() => onTeclaPresionada(tecla)}
              activeOpacity={0.6}
              accessibilityLabel={`Tecla ${tecla}`}
            >
              <Text style={[styles.textoTecla, esFuncion && styles.textoFuncion]}>
                {tecla}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ));
  };

  return (
    <View style={styles.contenedor}>
      <View style={styles.pestanas}>
        {['basico', 'funciones', 'avanzado'].map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.pestana, pestanaActiva === p && styles.pestanaActiva]}
            onPress={() => setPestanaActiva(p)}
          >
            <Text style={[styles.textoPestana, pestanaActiva === p && styles.textoPestanaActiva]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollTeclas}>
        <View style={styles.contenedorTeclas}>
          {renderTeclas()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: COLOR.superficie,
    borderTopWidth: 1,
    borderTopColor: COLOR.borde,
    paddingBottom: ESPACIO.s,
  },
  pestanas: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: ESPACIO.s,
    borderBottomWidth: 1,
    borderBottomColor: COLOR.borde,
  },
  pestana: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: RADIO.m,
  },
  pestanaActiva: {
    backgroundColor: COLOR.primario,
  },
  textoPestana: {
    fontSize: 14,
    fontWeight: '600',
    color: COLOR.textoSuave,
  },
  textoPestanaActiva: {
    color: '#FFFFFF',
  },
  scrollTeclas: {
    padding: ESPACIO.s,
  },
  contenedorTeclas: {
    flexDirection: 'column',
    gap: 6,
  },
  fila: {
    flexDirection: 'row',
    gap: 6,
  },
  tecla: {
    minWidth: 50,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.fondo,
    borderRadius: RADIO.m,
    borderWidth: 1,
    borderColor: COLOR.borde,
    paddingHorizontal: ESPACIO.s,
  },
  teclaFuncion: {
    backgroundColor: '#E0E7FF',
    borderColor: COLOR.primario,
  },
  teclaConstante: {
    backgroundColor: COLOR.fondoAdvertencia,
    borderColor: COLOR.advertencia,
  },
  teclaBorrar: {
    backgroundColor: '#FEE2E2',
    borderColor: COLOR.error,
  },
  teclaBorrarTodo: {
    backgroundColor: '#FECACA',
    borderColor: COLOR.error,
  },
  textoTecla: {
    fontSize: 18,
    color: COLOR.texto,
    fontWeight: '500',
  },
  textoFuncion: {
    fontSize: 13,
    fontWeight: '600',
  },
});