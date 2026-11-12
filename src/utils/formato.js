// Funciones de formato para mostrar números en pantalla (coma decimal, como en tu presentación).

// 6.48 -> "6,4800"  (los valores diminutos se muestran como 0 para evitar "-0,0000")
export const formatear = (valor) => {
  const v = Math.abs(valor) < 0.00005 ? 0 : valor;
  return v.toFixed(4).replace('.', ',');
};

// 10000 -> "10.000"
export const formatearEntero = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

// 0.5236 -> "0,524"  (para mostrar límites y ejes)
export const formatearCorto = (v) => String(Math.round(v * 1000) / 1000).replace('.', ',');
