import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatear } from '../utils/formato';
import { COLOR, ESPACIO, RADIO } from '../utils/temaAreaCurva';

// diferencia: (valor − referencia), opcional. Sirve para comparar cada suma con Simpson.
export default function ResultadoSuma({ titulo, valor, detalle, diferencia, destacado = false }) {
  return (
    <View style={[styles.tarjeta, destacado && styles.destacada]}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {detalle ? <Text style={styles.detalle}>{detalle}</Text> : null}
        {diferencia !== undefined ? (
          <Text style={styles.detalle}>Diferencia con la referencia: {formatear(diferencia)}</Text>
        ) : null}
      </View>
      <Text style={[styles.valor, destacado && { color: COLOR.primario }]}>{formatear(valor)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLOR.superficie,
    borderRadius: RADIO.m,
    borderWidth: 1,
    borderColor: COLOR.borde,
    padding: ESPACIO.m,
    marginBottom: ESPACIO.s,
  },
  destacada: { borderColor: COLOR.primario, borderWidth: 2 },
  textos: { flex: 1, paddingRight: ESPACIO.s },
  titulo: { fontSize: 15, fontWeight: '600', color: COLOR.texto },
  detalle: { fontSize: 12, color: COLOR.textoSuave, marginTop: 2 },
  valor: { fontSize: 18, fontWeight: '700', color: COLOR.texto },
});
