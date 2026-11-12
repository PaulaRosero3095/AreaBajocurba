// Intérprete de expresiones matemáticas SIN eval ni new Function.
// Tres pasos:
//   1) tokenizar: convierte el texto en "piezas" (números, nombres, operadores, paréntesis)
//   2) parsear:   arma un árbol respetando la prioridad de los operadores (descenso recursivo)
//   3) compilar:  convierte el árbol en una función JavaScript f(x)

const FUNCIONES = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sec: (x) => 1 / Math.cos(x),
  csc: (x) => 1 / Math.sin(x),
  cot: (x) => 1 / Math.tan(x),
  ln: Math.log, // logaritmo natural
  log: Math.log10, // logaritmo en base 10
  sqrt: Math.sqrt,
  exp: Math.exp,
  abs: Math.abs,
};

const CONSTANTES = { pi: Math.PI, e: Math.E };

// "sen" es el seno en español; se trata igual que "sin".
const ALIAS = { sen: 'sin' };

// Nombres que se reconocen, del más largo al más corto (así "exp" no se confunde con "e").
const NOMBRES = ['sqrt', 'sin', 'sen', 'cos', 'tan', 'sec', 'csc', 'cot', 'exp', 'abs', 'log', 'ln', 'pi', 'e', 'x'];

// Lanza un error propio (marcado) para distinguirlo de errores de programación.
function fallar(mensaje) {
  const error = new Error(mensaje);
  error.esErrorExpresion = true;
  throw error;
}

// ---------- 1) Tokenizador ----------

function normalizar(texto) {
  return String(texto)
    .replace(/[−–—]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/\*\*/g, '^')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt');
}

function tokenizar(texto) {
  const t = normalizar(texto);
  const tokens = [];
  let i = 0;

  while (i < t.length) {
    const c = t[i];

    if (/\s/.test(c)) {
      i++;
      continue;
    }

    // Número con punto o coma decimal: 3, 3.5, 3,5, .5
    if (/[0-9.,]/.test(c)) {
      const m = /^(?:\d+(?:[.,]\d*)?|[.,]\d+)/.exec(t.slice(i));
      if (!m) fallar(`Número mal escrito cerca de "${c}"`);
      tokens.push({ tipo: 'num', valor: Number(m[0].replace(',', '.')) });
      i += m[0].length;
      continue;
    }

    // Letras: pueden venir pegadas ("3xsin(x)", "pix"), así que se separan por nombres conocidos.
    if (/[a-zA-Z]/.test(c)) {
      const corrida = /^[a-zA-Z]+/.exec(t.slice(i))[0].toLowerCase();
      const despues = t.slice(i + corrida.length).trimStart()[0];
      let j = 0;
      while (j < corrida.length) {
        const nombre = NOMBRES.find((n) => corrida.startsWith(n, j));
        if (!nombre) {
          const resto = corrida.slice(j);
          fallar(despues === '(' ? `Función desconocida: ${resto}` : `Símbolo desconocido: ${resto}`);
        }
        tokens.push({ tipo: 'id', nombre: ALIAS[nombre] ?? nombre });
        j += nombre.length;
      }
      i += corrida.length;
      continue;
    }

    if ('+-*/^'.includes(c)) {
      tokens.push({ tipo: 'op', valor: c });
      i++;
      continue;
    }
    if (c === '(') {
      tokens.push({ tipo: 'lpar' });
      i++;
      continue;
    }
    if (c === ')') {
      tokens.push({ tipo: 'rpar' });
      i++;
      continue;
    }

    fallar(`Carácter no permitido: "${c}"`);
  }
  return tokens;
}

// ---------- 2) Parser (descenso recursivo) ----------
// Prioridad, de menor a mayor:  suma/resta  <  producto/división  <  menos unario  <  potencia

class Parser {
  constructor(tokens, permitirX) {
    this.tokens = tokens;
    this.pos = 0;
    this.permitirX = permitirX;
  }

  mirar() {
    return this.tokens[this.pos];
  }

  avanzar() {
    return this.tokens[this.pos++];
  }

  esOp(token, ...valores) {
    return token !== undefined && token.tipo === 'op' && valores.includes(token.valor);
  }

  // ¿Este token puede empezar un factor? (sirve para la multiplicación implícita: 3x, 2(x+1))
  iniciaFactor(token) {
    return token !== undefined && (token.tipo === 'num' || token.tipo === 'id' || token.tipo === 'lpar');
  }

  parsear() {
    const nodo = this.suma();
    const sobrante = this.mirar();
    if (sobrante) {
      if (sobrante.tipo === 'rpar') fallar('Paréntesis de cierre sin abrir');
      fallar('Expresión no válida: revisa los operadores');
    }
    return nodo;
  }

  suma() {
    let izq = this.producto();
    while (this.esOp(this.mirar(), '+', '-')) {
      const op = this.avanzar().valor;
      izq = { t: 'bin', op, a: izq, b: this.producto() };
    }
    return izq;
  }

  producto() {
    let izq = this.unario();
    for (;;) {
      const sig = this.mirar();
      if (this.esOp(sig, '*', '/')) {
        this.avanzar();
        izq = { t: 'bin', op: sig.valor, a: izq, b: this.unario() };
      } else if (this.iniciaFactor(sig)) {
        // Multiplicación implícita: 3x, 2(x+1), (x+1)(x-1), sin(x)cos(x)
        const previo = this.tokens[this.pos - 1];
        if (previo.tipo === 'num' && sig.tipo === 'num') fallar('Falta un operador entre dos números');
        izq = { t: 'bin', op: '*', a: izq, b: this.potencia() };
      } else {
        break;
      }
    }
    return izq;
  }

  unario() {
    const t = this.mirar();
    if (this.esOp(t, '-', '+')) {
      this.avanzar();
      const a = this.unario();
      return t.valor === '-' ? { t: 'neg', a } : a;
    }
    return this.potencia();
  }

  potencia() {
    const base = this.atomo();
    if (this.esOp(this.mirar(), '^')) {
      this.avanzar();
      return { t: 'bin', op: '^', a: base, b: this.exponente() };
    }
    return base;
  }

  // Exponente: acepta signo (e^-3x) y, si empieza con un número, absorbe la x que le sigue:
  // e^-3x significa e^(-3x), y 2^3x significa 2^(3x). Para otros casos usa paréntesis.
  exponente() {
    const t = this.mirar();
    if (this.esOp(t, '-', '+')) {
      this.avanzar();
      const a = this.exponente();
      return t.valor === '-' ? { t: 'neg', a } : a;
    }
    let valor = this.potencia();
    const sig = this.mirar();
    if (t && t.tipo === 'num' && valor.t === 'num' && sig && sig.tipo === 'id' && sig.nombre === 'x') {
      valor = { t: 'bin', op: '*', a: valor, b: this.potencia() };
    }
    return valor;
  }

  atomo() {
    const t = this.avanzar();
    if (!t) fallar('La expresión está incompleta');

    if (t.tipo === 'num') return { t: 'num', v: t.valor };

    if (t.tipo === 'lpar') {
      const dentro = this.suma();
      if (!this.mirar() || this.mirar().tipo !== 'rpar') fallar('Paréntesis sin cerrar');
      this.avanzar();
      return dentro;
    }

    if (t.tipo === 'id') {
      if (t.nombre in CONSTANTES) return { t: 'num', v: CONSTANTES[t.nombre] };
      if (t.nombre === 'x') {
        if (!this.permitirX) fallar('Los límites no pueden usar la variable x');
        return { t: 'x' };
      }
      // Es una función: debe ir con paréntesis
      if (!this.mirar() || this.mirar().tipo !== 'lpar') {
        fallar(`Escribe ${t.nombre} con paréntesis, por ejemplo ${t.nombre}(x)`);
      }
      this.avanzar();
      const arg = this.suma();
      if (!this.mirar() || this.mirar().tipo !== 'rpar') fallar('Paréntesis sin cerrar');
      this.avanzar();
      return { t: 'fn', nombre: t.nombre, a: arg };
    }

    if (t.tipo === 'rpar') fallar('Hay un paréntesis vacío o falta algo antes de ")"');
    fallar(`Falta un número o variable antes de "${t.valor}"`);
    return null;
  }
}

// ---------- 3) Compilador: árbol → función ----------

function compilar(nodo) {
  switch (nodo.t) {
    case 'num': {
      const valor = nodo.v;
      return () => valor;
    }
    case 'x':
      return (x) => x;
    case 'neg': {
      const a = compilar(nodo.a);
      return (x) => -a(x);
    }
    case 'fn': {
      const a = compilar(nodo.a);
      const fn = FUNCIONES[nodo.nombre];
      return (x) => fn(a(x));
    }
    default: {
      const a = compilar(nodo.a);
      const b = compilar(nodo.b);
      if (nodo.op === '+') return (x) => a(x) + b(x);
      if (nodo.op === '-') return (x) => a(x) - b(x);
      if (nodo.op === '*') return (x) => a(x) * b(x);
      if (nodo.op === '/') return (x) => a(x) / b(x);
      return (x) => Math.pow(a(x), b(x)); // '^'
    }
  }
}

// ---------- API pública ----------

function analizar(texto, permitirX) {
  const tokens = tokenizar(texto);
  return new Parser(tokens, permitirX).parsear();
}

// Devuelve { ok: true, f } o { ok: false, error }
export function parsearFuncion(texto) {
  if (String(texto).trim() === '') {
    return { ok: false, error: 'Escribe la función f(x), por ejemplo x^2 + 1.' };
  }
  try {
    return { ok: true, f: compilar(analizar(texto, true)) };
  } catch (e) {
    if (e.esErrorExpresion) return { ok: false, error: e.message };
    throw e;
  }
}

// Para los límites: acepta números y expresiones sin x (pi/6, 1/2, 3/2...).
// Devuelve { ok: true, valor } o { ok: false, error }
export function parsearNumero(texto) {
  if (String(texto).trim() === '') {
    return { ok: false, error: 'Escribe un valor (por ejemplo 0, 1/2 o pi/6).' };
  }
  try {
    const valor = compilar(analizar(texto, false))(0);
    if (!Number.isFinite(valor)) return { ok: false, error: 'El valor no es un número finito.' };
    return { ok: true, valor };
  } catch (e) {
    if (e.esErrorExpresion) return { ok: false, error: e.message };
    throw e;
  }
}
