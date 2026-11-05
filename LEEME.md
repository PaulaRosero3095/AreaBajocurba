# Área bajo la curva — ReservaClasesIngles

## Dependencias
**No se instala nada.** Solo usa React Native y `react-native-safe-area-context`,
que ya tienes en tu package.json.

## Cómo agregarlo
1. Copia la carpeta `src/` de este zip dentro de tu proyecto (se mezcla con la tuya;
   son 6 archivos nuevos y no pisa ninguno existente).
2. Registra la pantalla en tu navegación. Mira cómo lo hiciste con PerfilScreen
   en `src/navigation/InicioTabs.js` y repite el patrón:

   ```js
   import AreaCurvaScreen from '../screens/AreaCurvaScreen';
   // ...
   <Tab.Screen
     name="AreaCurva"
     component={AreaCurvaScreen}
     options={{ title: 'Área bajo la curva' }}
   />
   ```
   (Si tu navegador es un Stack, usa `<Stack.Screen ... />` igual.)
3. Si no se ven tus colores, abre `src/utils/temaAreaCurva.js` y ajusta los nombres
   de las claves a las de tu `src/theme/index.js`. Es el único archivo que toca el tema.

## Archivos
- utils/areaBajoCurva.js     matemática pura (sumas, exacto, funciones disponibles)
- utils/temaAreaCurva.js     puente hacia tu tema
- hooks/useAreaBajoCurva.js  estado (función, a, b, n) + resultados derivados con useMemo
- components/GraficaRectangulos.js   rectángulos y curva con View
- components/ResultadoSuma.js        tarjeta de resultado
- screens/AreaCurvaScreen.js         pantalla que une todo

## Prueba rápida (con f(x) = −x² + 5, [0, 2], n = 5)
Inferior 6,4800 · Superior 8,0800 · Intermedia 7,2800 · Exacto 7,3333
