// Matemática pura: no depende de React ni de React Native.
// Así se puede probar sola con `node` y reutilizar en cualquier parte.

export const N_RIEMANN = 10000; // "casi infinito" para aproximar la Suma de Riemann
export const N_SIMPSON = 10000; // subintervalos de Simpson (debe ser par)
export const MAX_RECTANGULOS_GRAFICA = 100; // máximo de rectángulos que dibuja la gráfica

// Ancho de cada rectángulo: Δx = (b − a) / n
export const ancho = (a, b, n) => (b - a) / n;

// Cuántos puntos se muestrean dentro de cada rectángulo para hallar su mínimo y máximo.
// Con n pequeño se muestrea mucho (más exacto). Con n enorme los rectángulos son diminutos
// y basta con pocos puntos, así el cálculo sigue siendo rápido (hasta n = 1.000.000 y más).
function muestrasPorRectangulo(n) {
  if (n <= 1000) return 10;
  if (n <= 100000) return 3;
  return 1;
}

// Altura del rectángulo número i (i = 0 … n−1) según el modo.
// La usa la gráfica; las sumas usan calcularSumas, que hace lo mismo en un solo ciclo.
export function alturaRectangulo(f, a, dx, i, modo, muestras = 10) {
  const x1 = a + i * dx;
  if (modo === 'medio') return f(x1 + dx / 2);
  let min = Infinity;
  let max = -Infinity;
  for (let k = 0; k <= muestras; k++) {
    const y = f(x1 + (dx * k) / muestras);
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return modo === 'inferior' ? min : max;
}

// Calcula en UN solo ciclo for las tres sumas (inferior, superior y punto medio).
// No crea arreglos, por eso es eficiente aunque n sea muy grande.
// Σ altura * Δx  (la notación Sigma de la presentación es este ciclo for)
export function calcularSumas(f, a, b, n) {
  const dx = (b - a) / n;
  const k = muestrasPorRectangulo(n);
  let sumaMin = 0;
  let sumaMax = 0;
  let sumaMedio = 0;
  let yIzq = f(a); // altura en el borde izquierdo del primer rectángulo

  for (let i = 0; i < n; i++) {
    const x1 = a + i * dx;
    const yDer = f(i === n - 1 ? b : a + (i + 1) * dx);
    let min = yIzq < yDer ? yIzq : yDer;
    let max = yIzq > yDer ? yIzq : yDer;
    if (Number.isNaN(yIzq) || Number.isNaN(yDer)) {
      min = NaN;
      max = NaN;
    }
    // Puntos interiores (solo si k > 1): sirven para funciones que suben y bajan dentro del rectángulo
    for (let j = 1; j < k; j++) {
      const y = f(x1 + (dx * j) / k);
      if (y < min) min = y;
      if (y > max) max = y;
    }
    sumaMin += min;
    sumaMax += max;
    sumaMedio += f(x1 + dx / 2);
    yIzq = yDer; // el borde derecho de este rectángulo es el izquierdo del siguiente
  }

  return { inferior: sumaMin * dx, superior: sumaMax * dx, medio: sumaMedio * dx };
}

export const sumaInferior = (f, a, b, n) => calcularSumas(f, a, b, n).inferior;
export const sumaSuperior = (f, a, b, n) => calcularSumas(f, a, b, n).superior;
export const sumaPuntoMedio = (f, a, b, n) => calcularSumas(f, a, b, n).medio;

// "Suma intermedia" tal como la define tu profesor: promedio de inferior y superior.
export const sumaIntermedia = (f, a, b, n) => {
  const s = calcularSumas(f, a, b, n);
  return (s.inferior + s.superior) / 2;
};

// Aproximación de la Suma de Riemann: n muy grande (el límite n → ∞ no se puede calcular literalmente).
export const sumaRiemann = (f, a, b) => calcularSumas(f, a, b, N_RIEMANN).inferior;

// Regla de Simpson: valor de referencia sin necesitar la antiderivada.
// h/3 · [ f(x0) + 4·f(x1) + 2·f(x2) + 4·f(x3) + … + f(xn) ]   (n par)
export function simpson(f, a, b, n = N_SIMPSON) {
  const m = n % 2 === 0 ? n : n + 1;
  const h = (b - a) / m;
  let impares = 0;
  let pares = 0;
  for (let i = 1; i < m; i++) {
    const y = f(a + i * h);
    if (i % 2 === 1) impares += y;
    else pares += y;
  }
  return (h / 3) * (f(a) + 4 * impares + 2 * pares + f(b));
}

// Recorre [a, b] y devuelve el mínimo y el máximo reales de f.
// Si f no está definida en algún punto (NaN o Infinity) devuelve { invalido: { x, y } }.
export function explorarFuncion(f, a, b, puntos = 1000) {
  let min = Infinity;
  let max = -Infinity;
  for (let k = 0; k <= puntos; k++) {
    const x = a + ((b - a) * k) / puntos;
    const y = f(x);
    if (!Number.isFinite(y)) return { invalido: { x, y } };
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return { min, max };
}

// Se conserva por compatibilidad: ∫ₐᵇ f(x) dx = F(b) − F(a), si se conoce la antiderivada F.
// La pantalla ya no la usa: ahora el valor de referencia sale de Simpson.
export const areaExacta = (F, a, b) => F(b) - F(a);
