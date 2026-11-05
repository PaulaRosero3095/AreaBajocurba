// Matemática pura: no depende de React ni de React Native.
// Así se puede probar sola (por ejemplo con `node`) y reutilizar en cualquier parte.

// Funciones disponibles. Cada una trae su antiderivada F para calcular el área exacta.
export const FUNCIONES = [
  {
    id: 'parabola',
    etiqueta: 'f(x) = −x² + 5',
    f: (x) => -(x ** 2) + 5,
    F: (x) => -(x ** 3) / 3 + 5 * x,
  },
  {
    id: 'cuadrada',
    etiqueta: 'f(x) = x²',
    f: (x) => x ** 2,
    F: (x) => x ** 3 / 3,
  },
  {
    id: 'lineal',
    etiqueta: 'f(x) = 2x + 1',
    f: (x) => 2 * x + 1,
    F: (x) => x ** 2 + x,
  },
];

export const N_MAX = 100; // límite de rectángulos (la gráfica usa un View por rectángulo)
export const N_RIEMANN = 10000; // "casi infinito" para aproximar la Suma de Riemann

// Ancho de cada rectángulo: Δx = (b − a) / n
export const ancho = (a, b, n) => (b - a) / n;

// Mínimo y máximo de f dentro de [x1, x2].
// Se muestrea el subintervalo para no depender de que la función sea creciente o decreciente.
function extremos(f, x1, x2, muestras = 10) {
  let min = Infinity;
  let max = -Infinity;
  for (let k = 0; k <= muestras; k++) {
    const y = f(x1 + ((x2 - x1) * k) / muestras);
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return { min, max };
}

// Altura del rectángulo número i (i = 0 … n−1) según el modo.
// La usan tanto las sumas como la gráfica, así ambas siempre coinciden.
export function alturaRectangulo(f, a, dx, i, modo) {
  const x1 = a + i * dx;
  const x2 = x1 + dx;
  if (modo === 'medio') return f((x1 + x2) / 2);
  const { min, max } = extremos(f, x1, x2);
  return modo === 'inferior' ? min : max;
}

// Σ altura * Δx  (la notación Sigma de la presentación es este ciclo for)
function sumaRectangulos(f, a, b, n, modo) {
  const dx = ancho(a, b, n);
  let suma = 0;
  for (let i = 0; i < n; i++) {
    suma += alturaRectangulo(f, a, dx, i, modo) * dx;
  }
  return suma;
}

export const sumaInferior = (f, a, b, n) => sumaRectangulos(f, a, b, n, 'inferior');
export const sumaSuperior = (f, a, b, n) => sumaRectangulos(f, a, b, n, 'superior');
export const sumaPuntoMedio = (f, a, b, n) => sumaRectangulos(f, a, b, n, 'medio');

// "Suma intermedia" tal como la define tu profesor: promedio de inferior y superior.
export const sumaIntermedia = (f, a, b, n) =>
  (sumaInferior(f, a, b, n) + sumaSuperior(f, a, b, n)) / 2;

// Aproximación de la Suma de Riemann: n muy grande (el límite n → ∞ no se puede calcular literalmente).
export const sumaRiemann = (f, a, b) => sumaRectangulos(f, a, b, N_RIEMANN, 'inferior');

// Teorema fundamental del cálculo: ∫ₐᵇ f(x) dx = F(b) − F(a)
export const areaExacta = (F, a, b) => F(b) - F(a);
