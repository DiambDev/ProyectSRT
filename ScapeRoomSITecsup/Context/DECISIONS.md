# Decisiones técnicas

## Vanilla JavaScript + ES Modules sin framework ni bundler

- Decisión: Todo el proyecto usa JavaScript vanilla con import/export de ES Modules. No hay React, Vue, Angular ni ningún framework. No hay webpack, Vite, Rollup ni bundler. Los módulos se cargan directamente en el navegador desde `index.html` con `<script type="module">`.
- Motivo: Eliminar dependencias externas, mantener el proyecto autocontenido y ejecutable sin paso de build.
- Consecuencia: Cada archivo JS es un módulo ES que importa/exporta directamente. No hay JSX, no hay sistema de componentes reactivos, no hay hot reload. Todo el DOM se genera programáticamente con `document.createElement`.
- Estado: Confirmada — ver `index.html:30`, todos los archivos `src/**/*.js` usan `import`/`export`.

## Arquitectura SPA con Router centralizado

- Decisión: La aplicación es un SPA de una sola página (`index.html`). Todas las pantallas se renderizan dentro de `#screen-container`. El `Router` gestiona la navegación entre pantallas destruyendo y recreando el contenedor cada vez.
- Motivo: Mantener una experiencia continua sin recargas de página. La destrucción del contenedor evita bugs de estado residual al reiniciar.
- Consecuencia: Solo hay un `index.html`. Las pantallas se apilan como hermanos dentro de `#screen-container`. El Router controla el ciclo de vida completo (render → enter → exit).
- Estado: Confirmada — ver `src/core/router.js:81-98` (`_enterScreen` destruye y recrea).

## Patrón de pantalla: objeto con interfaz fija

- Decisión: Cada pantalla es un objeto que exporta `{ id, render(container), async enter(), async exit() }`. El Router solo interactúa con pantallas a través de esta interfaz.
- Motivo: Estandarizar la estructura para que nuevas pantallas segreguen lógica estática (render, listeners) de lógica por entrada/salida (enter, exit).
- Consecuencia: `render()` se ejecuta una vez al crear el DOM. `enter()` se ejecuta cada vez que se navega a la pantalla. `exit()` se ejecuta al salir. Los listeners estáticos van en `render()`, la lógica dinámica en `enter()`.
- Estado: Confirmada — ver `src/core/router.js:89,97` y todos los archivos `src/screens/**/*.js`.

## Estado global con store plano y suscripciones

- Decisión: El estado global se maneja con un objeto plano `state` y un sistema de suscripciones por clave. No hay Redux, no hay MobX, no hay Proxy. `State.get()` retorna copias, `State.set()` emite eventos.
- Motivo: Simplificar la gestión de estado sin dependencias externas. El patrón de eventos nativos (`CustomEvent`) permite desacoplamiento entre módulos.
- Consecuencia: Cada `set()` dispara un `CustomEvent` en `window`. Los suscriptores se registran con `State.subscribe(key, callback)`. No hay actualización selectiva profunda — cada suscriptor recibe el valor completo de la clave.
- Estado: Confirmada — ver `src/core/state.js:52-86`.

## Volumen y muted se preservan entre reinicios

- Decisión: `State.resetGame()` reinicia todo el estado del juego pero preserva `volume` y `muted` del estado anterior.
- Motivo: Que el jugador no pierda su configuración de audio al reiniciar la simulación.
- Consecuencia: `resetGame()` hace `state = { ...initialState, volume: state.volume, muted: state.muted }`. `reset()` (sin "Game") sí reinicia todo incluido audio.
- Estado: Confirmada — ver `src/core/state.js:75-79`.

## Audio con síntesis WebAudio como fallback

- Decisión: El `AudioManager` intenta cargar archivos de audio. Si no existen (o fallan), usa síntesis WebAudio para generar sonidos programáticamente (osciladores + ruido). No hay archivos de audio reales en el proyecto.
- Motivo: Permitir que los SFX funcionen sin necesidad de assets externos. Facilita desarrollo y testing sin depender de archivos de sonido.
- Consecuencia: `audioConfig.js` tiene rutas vacías para todos los SFX y música. Al intentar reproducir, el AudioManager detecta que el asset no existe y usa `synthPatches` para generar el sonido. El sonido es funcional pero sintético.
- Estado: Confirmada — ver `src/audio/audioManager.js:56-97,140-167`.

## Click SFX global delegado en UIManager

- Decisión: El `UIManager` registra un listener global de `click` en `document`. Cuando el click es en un elemento `.btn` (que no esté disabled ni sea control de volumen), reproduce el SFX `CLICK`. No es necesario agregar listeners de audio a cada botón individualmente.
- Motivo: Evitar repetir `AudioManager.playSFX(AUDIO_SFX.CLICK)` en cada botón del proyecto.
- Consecuencia: Todos los botones con clase `.btn` obtienen sonido de click automáticamente. Los botones de volumen (`data-vol`) se excluyen para evitar doble sonido. Algunos botones agregan su propio SFX adicional (como `DELETE` o `SUCCESS`).
- Estado: Confirmada — ver `src/ui/uiManager.js:11-16`.

## Transiciones fade de 400ms entre pantallas

- Decisión: Todas las transiciones entre pantallas usan fade out / fade in con duración de 400ms. El tipo de transición está definido en `DEFAULT_TRANSITION` y se aplica en el Router.
- Motivo: Transición suave y consistente entre pantallas sin efectos complejos.
- Consecuencia: `_exitScreen` pone `opacity: 0` y espera 400ms. `_enterScreen` crea el DOM con `opacity: 0`, lo agrega al DOM, y usa `requestAnimationFrame` para poner `opacity: 1`. La pantalla tiene `overflow: auto` para permitir scroll si el contenido es mayor al viewport.
- Estado: Confirmada — ver `src/core/constants.js:51-54`, `src/core/router.js:66-98`.

## El Router destruye y recrea el contenedor al entrar

- Decisión: `_enterScreen` siempre elimina el contenedor anterior del DOM y crea uno nuevo (`document.createElement('div')`). No reutiliza el contenedor entre navegaciones.
- Motivo: Fix para un bug donde al reiniciar el juego, el contenedor anterior mantenía estado visual residual (clases, estilos inline, contenido).
- Consecuencia: Cada pantalla empieza con un DOM limpio. No hay riesgo de contaminación entre pantallas. El `render()` se ejecuta sobre un contenedor nuevo cada vez.
- Estado: Confirmada — ver `src/core/router.js:83-88`.

## Fases independientes con estado aislado

- Decisión: Cada fase tiene su propio objeto de estado (`phase1State`, `phase2State`, `phase3State`) en el store global. Las fases no comparten datos de estado entre sí.
- Motivo: Permitir que cada fase se modifique independientemente sin afectar a las demás.
- Consecuencia: Los datos de la Fase 1 no se pasan a la Fase 2, y así sucesivamente. El único dato compartido es el `gameProgress` (para controlar desbloqueo) y los puntajes finales (para la pantalla de achievement).
- Estado: Confirmada — ver `src/core/state.js:14-42`.

## Puntaje total: 20 puntos (4 + 14 + 2)

- Decisión: El puntaje total del juego es 20 puntos. Fase 1 = 4 puntos (MC), Fase 2 = 14 puntos (explotor de archivos, clamp [0,14]), Fase 3 = 2 puntos (MC). Fase 2 no tiene puntaje numérico — solo victoria/derrota.
- Motivo: Distribuir el peso evaluativo principalmente en la Fase 3 (análisis de archivos), que es la más compleja.
- Consecuencia: `computeFinalScore(a1, a2, a3)` suma los tres puntajes y hace clamp a [0, 20]. Los mensajes de resultado se basan en umbrales: ≥14 Excelente, ≥11 Muy Bueno, ≥8 Bueno, ≥5 Aprobado, <5 Completada.
- Estado: Confirmada — ver `src/screens/phase3/phase3Game/phase3Data.js:7-63,115-120`.

## Opciones MC en Fase 1 y Fase 3 se aleatorizan visualmente

- Decisión: En la Actividad 1 y Actividad 3 de la Fase 3, las opciones de opción múltiple se muestran en orden aleatorio (shuffle). El `correctIndex` se mantiene como referencia lógica interna.
- Motivo: Evitar que el jugador memorice la posición de la respuesta correcta entre intentos.
- Consecuencia: El array de opciones se copia y se baraja antes de renderizar. El `correctIndex` original se usa para evaluar la respuesta, no la posición visual.
- Estado: Confirmada — ver `src/screens/phase3/phase3Game/activity1.js` (shuffle de `indices`), `activity3.js` (mismo patrón).

## Opciones de Fase 2 también se aleatorizan

- Decisión: En cada contacto de la Fase 2, las 4 opciones de respuesta se muestran en orden aleatorio. El matching de respuestas se hace por contenido (`label`), no por posición.
- Motivo: Misma razón que Fase 3 — evitar memorización de posiciones.
- Consecuencia: `_refopts` copia y baraja `contact.options` antes de renderizar. `phase2Validator.js` compara la respuesta del jugador contra todos los `options[].label` para determinar si es safe, risk o critical.
- Estado: Confirmada — ver `src/screens/phase2/phase2Game/phase2Game.js` (shuffle en `_refopts`), `src/screens/phase2/phase2Game/phase2Validator.js`.

## Fase 3 sin derrota — solo afecta puntaje

- Decisión: La Fase 3 no tiene pantalla de derrota. Las decisiones del jugador solo afectan el puntaje final. No hay forma de "perder" en esta fase.
- Motivo: Enfocar la Fase 3 en evaluación formativa, no en penalización. El jugador completa las 3 actividades sin importar sus respuestas.
- Consecuencia: No hay `PHASE_3_DEFEAT` en el flujo real (aunque la pantalla existe en el enum por si se necesita en el futuro). El juego siempre avanza hasta `ACHIEVEMENT_LOADING`.
- Estado: Confirmada — ver `README.md:70`, flujo de pantallas.

## Layout de pantalla final: overflow scroll sin flex centering vertical

- Decisión: La pantalla de achievement usa `overflow-y: auto` en el contenedor y `margin: 0 auto` en la tarjeta. No usa `display: flex; align-items: center` para centrar verticalmente.
- Motivo: El flex centering vertical causaba que el contenido se desplazara fuera del viewport cuando era más alto que la pantalla (el logo quedaba invisible a 100% de zoom).
- Consecuencia: La tarjeta se centra horizontalmente con `margin: 0 auto`. Cuando el contenido cabe, se centra verticalmente por el padding. Cuando no cabe, aparece scroll vertical. La pantalla debe ser 100% usable a 100% de zoom en cualquier resolución.
- Estado: Confirmada — ver `styles/screens/achievement.css:1-5,7-10`.

## Identidad visual dual: oscura (fases 1-2) y clara (final)

- Decisión: Las fases 1 y 2 usan estética oscura de terminal hacker (verde sobre negro). La Fase 3 usa azul TECSUP sobre fondo oscuro. La pantalla final usa identidad clara TECSUP (blanco + azul `#00aeef`).
- Motivo: Diferenciar visualmente las fases de juego (inmersión en terminal) del resultado institucional (identidad TECSUP).
- Consecuencia: Dos conjuntos de variables CSS: `--system-*` para fases 1-2, `--p3-*` para Fase 3, `--tecsup-*` para pantalla final. Los estilos de la pantalla final están scoped bajo `.screen--achievement` para no afectar otras pantallas.
- Estado: Confirmada — ver `styles/variables.css:1-44`.

## Managers como objetos singleton exportados

- Decisión: `AudioManager`, `AnimationManager`, `VFXManager` y `UIManager` son objetos singleton exportados directamente (no clases instanciadas). Se inicializan una vez en `App.init()`.
- Motivo: Simplificar el uso — no necesitan instanciación, solo importar y llamar métodos.
- Consecuencia: No hay múltiples instancias de estos managers. El estado interno (como `currentMusic` en AudioManager) se comparte a través del closure del módulo.
- Estado: Confirmada — ver `src/core/app.js:27-30`, todos los archivos `src/*/`.
## Contexto del proyecto

- [[PROJECT]]
