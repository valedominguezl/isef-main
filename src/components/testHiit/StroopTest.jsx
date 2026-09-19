import React, { useEffect, useRef, useState } from 'react';
import styles from './StroopTest.module.scss';

/* ============== CONFIGURACIÓN CONGELADA (sección 20.3 del protocolo) ==============
   Ajustar estos valores ANTES del piloto y no modificarlos después de iniciada
   la recolección principal. */
const CONFIG = {
  practiceTrials: 8,
  trialsPerCondition: 28, // congruente, incongruente, neutra -> 84 ensayos totales
  maxConsecutiveSameAnswer: 2, // evita repetición excesiva de la misma respuesta correcta
  practiceFeedbackMs: 600, // pausa entre ensayos durante la práctica (con corrección visual)
  countdownSeconds: 3, // cuenta regresiva antes de arrancar cada bloque de ensayos
  // Cruz de fijación ("+") mostrada antes de cada estímulo (incluido el primero de cada
  // bloque): resetea la atención visual al centro de la pantalla y evita que la respuesta
  // anterior contamine el TR del siguiente ensayo. 500ms es la duración típica en protocolos
  // Stroop estandarizados (PsyToolkit, literatura clásica).
  fixationMs: 500,
};
/* =================================================================================== */

const UNDO_WINDOW_MS = 5000;
const TOAST_CLOSE_MS = 300; // duración de la animación de salida del toast de deshacer

// El amarillo puro (#ffd400) tiene un contraste de ~1.4:1 contra el fondo blanco de la tarjeta
// (los otros tres colores están entre 3:1 y 6:1) — hacía que la palabra/botón amarillo fueran
// mucho más difíciles de percibir que los demás, un sesgo perceptual ajeno al Stroop en sí que
// distorsionaría el TR de esa condición. Se usa un amarillo más oscuro (dorado) con contraste
// equivalente al resto para que ninguna condición esté en desventaja por el diseño de la página.
const COLORS = [
  { key: 'rojo', label: 'ROJO', hex: '#e6161d', cls: styles.cbRed },
  { key: 'azul', label: 'AZUL', hex: '#1257e6', cls: styles.cbBlue },
  { key: 'verde', label: 'VERDE', hex: '#0eab48', cls: styles.cbGreen },
  { key: 'amarillo', label: 'AMARILLO', hex: '#b8860b', cls: styles.cbYellow },
];

// Ensayo de ejemplo para la slide 3 del tutorial: la palabra dice "VERDE" pero está
// escrita en tinta azul -> la respuesta correcta es "azul".
const DEMO_TRIAL = { word: 'VERDE', colorKey: 'azul', hex: '#1257e6' };

const STORAGE_KEY = 'isef_stroop_sessions_v1';

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* almacenamiento no disponible */
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function enforceNoRepeatRun(list) {
  for (let attempt = 0; attempt < 40; attempt++) {
    let ok = true;
    let run = 1;
    for (let i = 1; i < list.length; i++) {
      if (list[i].colorKey === list[i - 1].colorKey) {
        run++;
        if (run > CONFIG.maxConsecutiveSameAnswer) {
          ok = false;
          break;
        }
      } else run = 1;
    }
    if (ok) return list;
    list = shuffle(list);
  }
  return list;
}

// n = ensayos totales por condición (congruente/incongruente/neutra), repartidos
// en partes iguales entre los 4 colores.
function buildTrialSet(n) {
  const perColor = Math.floor(n / COLORS.length);
  const remainder = n % COLORS.length;
  const countFor = (colorIndex) => perColor + (colorIndex < remainder ? 1 : 0);

  let list = [];
  COLORS.forEach((c, ci) => {
    for (let i = 0; i < countFor(ci); i++) list.push({ condition: 'congruente', word: c.label, colorKey: c.key });
  });
  COLORS.forEach((c, ci) => {
    const others = COLORS.filter((o) => o.key !== c.key);
    for (let i = 0; i < countFor(ci); i++) {
      const w = others[i % others.length];
      list.push({ condition: 'incongruente', word: w.label, colorKey: c.key });
    }
  });
  COLORS.forEach((c, ci) => {
    for (let i = 0; i < countFor(ci); i++) list.push({ condition: 'neutra', word: 'XXXX', colorKey: c.key });
  });
  return enforceNoRepeatRun(shuffle(list));
}

function buildPracticeSet() {
  const list = [];
  for (let i = 0; i < CONFIG.practiceTrials; i++) {
    const c = COLORS[i % COLORS.length];
    const cond = i % 3 === 0 ? 'congruente' : i % 3 === 1 ? 'incongruente' : 'neutra';
    if (cond === 'congruente') list.push({ condition: cond, word: c.label, colorKey: c.key });
    else if (cond === 'incongruente') {
      const others = COLORS.filter((o) => o.key !== c.key);
      const w = others[i % others.length];
      list.push({ condition: cond, word: w.label, colorKey: c.key });
    } else list.push({ condition: cond, word: 'XXXX', colorKey: c.key });
  }
  return enforceNoRepeatRun(shuffle(list));
}

// Por debajo de esto, una respuesta es demasiado rápida para reflejar un procesamiento real
// del estímulo (probablemente anticipatoria o un toque accidental) y se excluye del promedio
// de TR — sigue contando para la precisión y los errores, solo no distorsiona el TR.
const MIN_VALID_RT_MS = 150;

function meanRT(arr) {
  const c = arr.filter((r) => r.correct && r.rt >= MIN_VALID_RT_MS);
  return c.length ? Math.round(c.reduce((a, b) => a + b.rt, 0) / c.length) : null;
}
function accuracy(arr) {
  return arr.length ? Math.round((100 * arr.filter((r) => r.correct).length) / arr.length) : null;
}
function errorCount(arr) {
  return arr.filter((r) => !r.correct).length;
}

function buildSession({ code, brazo, results }) {
  const byCond = { congruente: [], incongruente: [], neutra: [] };
  results.forEach((r) => byCond[r.condition].push(r));

  const rtCong = meanRT(byCond.congruente);
  const rtInc = meanRT(byCond.incongruente);
  const interference = rtCong != null && rtInc != null ? Math.round(rtInc - rtCong) : null;

  return {
    code,
    brazo,
    timestamp: new Date().toISOString(),
    nTrials: results.length,
    accuracyOverall: accuracy(results),
    accuracyCongruente: accuracy(byCond.congruente),
    accuracyIncongruente: accuracy(byCond.incongruente),
    accuracyNeutra: accuracy(byCond.neutra),
    rtCongruente: rtCong,
    rtIncongruente: rtInc,
    rtNeutra: meanRT(byCond.neutra),
    erroresCongruente: errorCount(byCond.congruente),
    erroresIncongruente: errorCount(byCond.incongruente),
    erroresNeutra: errorCount(byCond.neutra),
    interferenceIndex: interference,
    trials: results,
  };
}

function sessionsToExcelXML(sessions) {
  const headers = [
    'Código',
    'Brazo',
    'Fecha',
    'N° ensayos',
    'Precisión total (%)',
    'Precisión congruente (%)',
    'Precisión incongruente (%)',
    'Precisión neutra (%)',
    'TR congruente (ms)',
    'TR incongruente (ms)',
    'TR neutra (ms)',
    'Errores congruente',
    'Errores incongruente',
    'Errores neutra',
    'Índice de interferencia (ms)',
  ];
  const rows = sessions.map((s) => [
    s.code,
    s.brazo || '',
    s.timestamp,
    s.nTrials,
    s.accuracyOverall,
    s.accuracyCongruente,
    s.accuracyIncongruente,
    s.accuracyNeutra,
    s.rtCongruente,
    s.rtIncongruente,
    s.rtNeutra,
    s.erroresCongruente,
    s.erroresIncongruente,
    s.erroresNeutra,
    s.interferenceIndex,
  ]);

  const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cell = (v) => {
    const isNum = typeof v === 'number' && v !== null;
    return `<Cell><Data ss:Type="${isNum ? 'Number' : 'String'}">${v == null ? '' : esc(v)}</Data></Cell>`;
  };
  const row = (values) => `<Row>${values.map(cell).join('')}</Row>`;

  // Hoja aparte con los parámetros del protocolo, para que quede documentado junto con los
  // datos qué configuración se usó.
  const protocolRows = [
    ['Parámetro', 'Valor', 'Nota'],
    ['Ensayos de práctica', CONFIG.practiceTrials, 'Con corrección visual'],
    [
      'Ensayos de evaluación real',
      CONFIG.trialsPerCondition * 3,
      `${CONFIG.trialsPerCondition} por condición (congruente/incongruente/neutra) × 3`,
    ],
    ['Cuenta regresiva antes de cada bloque', `${CONFIG.countdownSeconds} s`, ''],
    ['Límite de tiempo por respuesta', 'Ninguno (autopautado)', 'Como en el Stroop clásico: cada ensayo espera la respuesta sin un plazo máximo'],
    ['Cruz de fijación antes de cada estímulo', `${CONFIG.fixationMs} ms`, 'Incluido el primer ensayo de cada bloque'],
    ['TR mínimo válido para el promedio', `${MIN_VALID_RT_MS} ms`, 'Respuestas más rápidas se consideran anticipatorias y se excluyen solo del cálculo de TR'],
  ];

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Resultados">
<Table>
${row(headers)}
${rows.map(row).join('\n')}
</Table>
</Worksheet>
<Worksheet ss:Name="Protocolo">
<Table>
${protocolRows.map(row).join('\n')}
</Table>
</Worksheet>
</Workbook>`;
}

function downloadExcel(sessions) {
  const xml = sessionsToExcelXML(sessions);
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stroop_resultados_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const ArrowBackIcon = () => <span className={styles.arrowGlyph} />;
const CloseXIcon = () => <span className={styles.closeGlyph} />;

const ExcelIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="2" width="18" height="20" rx="2" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="6.5" width="18" height="4" fill="currentColor" fillOpacity="0.4" />
    <path d="M9 6.5v16M15 6.5v16M3 14.5h18M3 18.5h18" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const TrashIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ScreenHeader = ({ onBack, counter, onClose, progressPct }) => (
  <div className={styles.screenHeader}>
    <div className={styles.topBar}>
      <div className={styles.topBarLeft}>
        {onBack && (
          <button className={styles.iconBtn} aria-label="Atrás" onClick={onBack}>
            <ArrowBackIcon />
          </button>
        )}
      </div>
      <div className={styles.topBarCenter}>{counter && <span className={styles.counter}>{counter}</span>}</div>
      <div className={styles.topBarRight}>
        {onClose && (
          <button className={styles.iconBtn} aria-label="Cancelar evaluación" onClick={onClose}>
            <CloseXIcon />
          </button>
        )}
      </div>
    </div>
    {progressPct != null && (
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>
    )}
  </div>
);

const StroopTest = () => {
  const [screen, setScreen] = useState('start');
  const [code, setCode] = useState('');
  const [brazo, setBrazo] = useState('');
  const [practice, setPractice] = useState(true);
  const [trials, setTrials] = useState([]);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [sessions, setSessions] = useState(() => loadSessions());
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [countdownNum, setCountdownNum] = useState(CONFIG.countdownSeconds);
  // true solo cuando se llega a la evaluación real habiendo pasado por la práctica (block-done).
  // Si se entró directo con "Empezar la prueba" no hay pantalla previa a la que volver.
  const [mainFromPractice, setMainFromPractice] = useState(false);
  const [demoFlash, setDemoFlash] = useState(null);
  const [demoSolved, setDemoSolved] = useState(false);

  const resultsRef = useRef([]);
  const t0Ref = useRef(0);
  const answeredRef = useRef(false);
  const toastTimerRef = useRef(null);
  const undoTimerRef = useRef(null);
  const undoCloseTimerRef = useRef(null);
  const pendingDeleteRef = useRef(null);

  const lastSession = sessions.length ? sessions[sessions.length - 1] : null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastShow(false), 1800);
  };

  useEffect(() => {
    pendingDeleteRef.current = pendingDelete;
  }, [pendingDelete]);

  // Al desmontar, si había una eliminación pendiente de confirmar, se hace efectiva
  useEffect(
    () => () => {
      toastTimerRef.current && clearTimeout(toastTimerRef.current);
      undoTimerRef.current && clearTimeout(undoTimerRef.current);
      undoCloseTimerRef.current && clearTimeout(undoCloseTimerRef.current);
      if (pendingDeleteRef.current) persistSessions(pendingDeleteRef.current.remaining);
    },
    []
  );

  // Cuenta regresiva antes de arrancar cada bloque de ensayos (práctica o evaluación real).
  // El fondo oscuro empieza a aparecer apenas arranca esta pantalla y llega a su opacidad
  // máxima justo cuando termina la cuenta, sincronizado con la transición CSS del dimLayer.
  useEffect(() => {
    if (screen !== 'countdown') return;
    setCountdownNum(CONFIG.countdownSeconds);
    const timers = [];
    for (let s = CONFIG.countdownSeconds - 1; s >= 1; s--) {
      timers.push(setTimeout(() => setCountdownNum(s), (CONFIG.countdownSeconds - s) * 1000));
    }
    timers.push(setTimeout(() => setScreen('fixation'), CONFIG.countdownSeconds * 1000));
    return () => timers.forEach(clearTimeout);
  }, [screen]);

  // Cruz de fijación antes de cada estímulo (incluido el primero de cada bloque).
  useEffect(() => {
    if (screen !== 'fixation') return;
    const t = setTimeout(() => setScreen('stimulus'), CONFIG.fixationMs);
    return () => clearTimeout(t);
  }, [screen, idx]);

  // Al mostrar un nuevo estímulo, limpiar el feedback anterior y arrancar el cronómetro de
  // reacción recién cuando el navegador ya pintó el estímulo en pantalla (doble
  // requestAnimationFrame: el primero corre antes del próximo pintado, el segundo ya después),
  // en vez de medir desde que React confirma el render (que puede ir unos ms antes del pintado real).
  // El ensayo es autopautado (sin límite de tiempo por respuesta), como el Stroop clásico.
  useEffect(() => {
    if (screen !== 'stimulus') return;
    answeredRef.current = false;
    setFeedback(null);

    let rafId2 = null;

    const rafId1 = requestAnimationFrame(() => {
      rafId2 = requestAnimationFrame(() => {
        t0Ref.current = performance.now();
      });
    });

    return () => {
      cancelAnimationFrame(rafId1);
      if (rafId2 != null) cancelAnimationFrame(rafId2);
    };
  }, [screen, idx]);

  const resetToStart = () => {
    setScreen('start');
    setTrials([]);
    setIdx(0);
    setPractice(true);
    setFeedback(null);
    setShowCancelConfirm(false);
    setDemoSolved(false);
    setDemoFlash(null);
    setMainFromPractice(false);
    resultsRef.current = [];
  };

  const requireCode = () => {
    if (!code.trim()) {
      setCodeError(true);
      showToast('Ingresá el código del estudiante');
      return false;
    }
    setCodeError(false);
    return true;
  };

  const startPracticeFlow = () => {
    if (!requireCode()) return;
    resultsRef.current = [];
    setPractice(true);
    setTrials(buildPracticeSet());
    setIdx(0);
    setScreen('instructions-1');
  };

  const beginPracticeTrials = () => setScreen('countdown');

  const startMainEvaluation = () => {
    resultsRef.current = [];
    setPractice(false);
    setTrials(buildTrialSet(CONFIG.trialsPerCondition));
    setIdx(0);
    setScreen('countdown');
  };

  // Salta el tutorial y la práctica, y va directo a la evaluación real
  const skipToRealTest = () => {
    if (!requireCode()) return;
    setMainFromPractice(false);
    startMainEvaluation();
  };

  const advance = (isPractice, trialList) => {
    const nextIdx = idx + 1;
    if (nextIdx >= trialList.length) {
      setFeedback(null); // evita que el flash de color quede pegado en la siguiente pantalla
      if (isPractice) {
        setScreen('block-done');
      } else {
        const session = buildSession({ code, brazo, results: resultsRef.current });
        const next = [...sessions, session];
        setSessions(next);
        persistSessions(next);
        setScreen('summary');
      }
    } else {
      setIdx(nextIdx);
      setScreen('fixation');
    }
  };

  const onAnswer = (key) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    const rt = performance.now() - t0Ref.current;
    const t = trials[idx];
    const correct = key === t.colorKey;
    resultsRef.current = [...resultsRef.current, { ...t, response: key, rt: Math.round(rt), correct }];

    if (practice) {
      setFeedback({ good: correct });
      setTimeout(() => advance(true, trials), CONFIG.practiceFeedbackMs);
    } else {
      advance(false, trials);
    }
  };

  const handleDemoAnswer = (key) => {
    const correct = key === DEMO_TRIAL.colorKey;
    setDemoFlash({ good: correct });
    if (correct) setDemoSolved(true);
    setTimeout(() => setDemoFlash(null), CONFIG.practiceFeedbackMs);
  };

  // --- Eliminar resultados guardados, con ventana para deshacer ---

  const commitPendingDelete = () => {
    if (!pendingDelete) return;
    persistSessions(pendingDelete.remaining);
    setPendingDelete(null);
  };

  const startPendingDelete = (removed, remaining) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoCloseTimerRef.current) clearTimeout(undoCloseTimerRef.current);
    commitPendingDelete();
    setSessions(remaining);
    setPendingDelete({ removed, remaining, closing: false });
    undoTimerRef.current = setTimeout(() => {
      setPendingDelete((pd) => (pd ? { ...pd, closing: true } : pd));
      undoCloseTimerRef.current = setTimeout(() => {
        persistSessions(remaining);
        setPendingDelete(null);
      }, TOAST_CLOSE_MS);
    }, UNDO_WINDOW_MS - TOAST_CLOSE_MS);
  };

  const handleDeleteOne = (index) => {
    const removed = [sessions[index]];
    const remaining = sessions.filter((_, i) => i !== index);
    startPendingDelete(removed, remaining);
  };

  const handleDeleteAll = () => {
    startPendingDelete(sessions, []);
  };

  const handleUndoDelete = () => {
    if (!pendingDelete || pendingDelete.closing) return;
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    const restored = [...sessions, ...pendingDelete.removed];
    setPendingDelete((pd) => (pd ? { ...pd, closing: true } : pd));
    undoCloseTimerRef.current = setTimeout(() => {
      setSessions(restored);
      setPendingDelete(null);
    }, TOAST_CLOSE_MS);
  };

  const counterLabel = trials.length ? `${idx + 1}/${trials.length}` : '';
  const trialProgressPct = trials.length ? Math.min(100, (idx / trials.length) * 100) : 0;
  const isDimmed = screen === 'countdown' || screen === 'stimulus' || screen === 'fixation';
  const currentColor = trials[idx] ? COLORS.find((c) => c.key === trials[idx].colorKey) : null;

  const activeFlash = screen === 'instructions-3' ? demoFlash : feedback;
  const cardFlashClass = activeFlash ? (activeFlash.good ? styles.flashGood : `${styles.flashBad} ${styles.shake}`) : '';

  return (
    <div className={styles.container}>
      <div className={`${styles.dimLayer} ${isDimmed ? styles.active : ''}`} />

      <div className={`${styles.card} ${cardFlashClass}`}>
        {showCancelConfirm && (
          <div className={styles.confirmOverlay}>
            <div className={styles.confirmBox}>
              <p className={styles.text}>Se va a perder el progreso de esta evaluación. ¿Querés salir?</p>
              <div className={styles.btnRow}>
                <button className={styles.btnPrimary} onClick={resetToStart}>
                  Salir
                </button>
                <button className={styles.btnGhost} onClick={() => setShowCancelConfirm(false)}>
                  Seguir con el test
                </button>
              </div>
            </div>
          </div>
        )}

        {screen === 'start' && (
          <>
            <h2 className={styles.heading}>Nueva evaluación</h2>
            <div className={styles.field}>
              <label htmlFor="inpCode">Código del estudiante</label>
              <input
                id="inpCode"
                type="text"
                className={`${styles.input} ${codeError ? styles.inputError : ''}`}
                placeholder="Ej: SL-014-023"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (codeError) setCodeError(false);
                }}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="inpBrazo">Brazo asignado (opcional, solo referencia)</label>
              <select id="inpBrazo" className={styles.select} value={brazo} onChange={(e) => setBrazo(e.target.value)}>
                <option value="">Sin especificar</option>
                <option value="HIIT">HIIT</option>
                <option value="Control">Control</option>
              </select>
            </div>
            <div className={styles.spacer} />
            <div className={styles.btnRow}>
              <button className={styles.btnPrimary} onClick={skipToRealTest}>
                Empezar la prueba
              </button>
              <button className={styles.btnGhost} onClick={startPracticeFlow}>
                Ver tutorial
              </button>
              <button className={styles.linkBtn} onClick={() => setScreen('results-all')}>
                Ver resultados guardados
              </button>
            </div>
          </>
        )}

        {screen === 'instructions-1' && (
          <>
            <ScreenHeader onBack={() => setScreen('start')} counter="1/3" progressPct={33} />
            <p className={styles.text}>
              Va a ver una palabra en el centro de la pantalla. Tiene que indicar <strong>el color con el
              que está escrita la palabra</strong>, no lo que dice la palabra.
            </p>
            <div className={styles.example}>
              <div className={styles.exampleStim} style={{ color: '#1257e6' }}>
                ROJO
              </div>
              <div className={styles.exampleButtons}>
                <div className={styles.exampleButtonCol}>
                  <div className={`${styles.exampleSwatch} ${styles.exampleSwatchBlue}`} />
                  <span className={`${styles.exampleArrow} ${styles.exampleArrowGood}`} />
                  <span className={styles.exampleLabelGood}>Correcto</span>
                </div>
                <div className={styles.exampleButtonCol}>
                  <div className={`${styles.exampleSwatch} ${styles.exampleSwatchRed}`} />
                  <span className={`${styles.exampleArrow} ${styles.exampleArrowBad}`} />
                  <span className={styles.exampleLabelBad}>Incorrecto</span>
                </div>
              </div>
            </div>
            <div className={styles.spacer} />
            <button className={styles.btnPrimary} onClick={() => setScreen('instructions-2')}>
              Continuar
            </button>
          </>
        )}

        {screen === 'instructions-2' && (
          <>
            <ScreenHeader onBack={() => setScreen('instructions-1')} counter="2/3" progressPct={67} />
            <p className={styles.text}>
              Toque el botón del color correspondiente lo más rápido y preciso que pueda. Primero hay <strong> {CONFIG.practiceTrials}{' '}
              ensayos de práctica</strong> donde se le dirá si eligió correctamente o no. Después empieza la evaluación real, sin corrección.
            </p>
            <div className={styles.spacer} />
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setDemoSolved(false);
                setDemoFlash(null);
                setScreen('instructions-3');
              }}
            >
              Continuar
            </button>
          </>
        )}

        {screen === 'instructions-3' && (
          <>
            <ScreenHeader onBack={() => setScreen('instructions-2')} counter="3/3" progressPct={100} />
            <p className={styles.text}>
              Antes de empezar, probemos con un ejemplo. Tocá el botón <strong>del color de la tinta</strong> con la que está
              escrita esta palabra (acá no hay límite de tiempo).
            </p>
            <div className={styles.stimzone}>
              <div className={styles.stimword} style={{ color: DEMO_TRIAL.hex }}>
                {DEMO_TRIAL.word}
              </div>
            </div>
            <div className={styles.grid4}>
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  className={`${styles.colorbtn} ${c.cls}`}
                  aria-label={c.label}
                  onPointerDown={() => handleDemoAnswer(c.key)}
                />
              ))}
            </div>
            <div className={styles.spacer} />
            {demoSolved ? (
              <button className={styles.btnPrimary} onClick={beginPracticeTrials}>
                Comenzar práctica
              </button>
            ) : (
              <p></p>
            )}
          </>
        )}

        {screen === 'countdown' && (
          <>
            <ScreenHeader
              onBack={
                practice
                  ? () => setScreen('instructions-3')
                  : mainFromPractice
                  ? () => setScreen('block-done')
                  : undefined
              }
              onClose={() => setShowCancelConfirm(true)}
            />
            <div className={styles.countdownArea}>
              <span className={styles.countdownNum}>{countdownNum}</span>
            </div>
          </>
        )}

        {(screen === 'stimulus' || screen === 'fixation') && trials[idx] && (
          <div className={styles.testArea}>
            <ScreenHeader counter={counterLabel} onClose={() => setShowCancelConfirm(true)} progressPct={trialProgressPct} />

            <div className={styles.stimzone}>
              {screen === 'stimulus' ? (
                <div className={styles.stimword} style={{ color: currentColor.hex }}>
                  {trials[idx].word}
                </div>
              ) : (
                <div className={styles.fixationCross}>+</div>
              )}
            </div>

            <div className={styles.grid4}>
              {COLORS.map((c) => (
                <button
                  key={c.key}
                  className={`${styles.colorbtn} ${c.cls}`}
                  aria-label={c.label}
                  disabled={screen !== 'stimulus'}
                  onPointerDown={() => onAnswer(c.key)}
                />
              ))}
            </div>
          </div>
        )}

        {screen === 'block-done' && (
          <>
            <ScreenHeader onBack={() => setScreen('instructions-3')} onClose={() => setShowCancelConfirm(true)} />
            <h2 className={styles.heading}>Práctica completa</h2>
            <p className={styles.text}>
              Ahora comienza la evaluación real. No va a recibir corrección durante esta parte — responda lo más <strong>rápido y
              preciso posible</strong>.
            </p>
            <div className={styles.spacer} />
            <button
              className={styles.btnPrimary}
              onClick={() => {
                setMainFromPractice(true);
                startMainEvaluation();
              }}
            >
              Comenzar evaluación
            </button>
          </>
        )}

        {screen === 'summary' && lastSession && (
          <>
            <SummaryView s={lastSession} />
            <div className={styles.spacer} />
            <div className={styles.btnRow}>
              <button className={styles.btnPrimary} onClick={resetToStart}>
                Guardar e intentar otra vez
              </button>
              <button className={styles.btnGhost} onClick={() => setScreen('results-all')}>
                Ver todos los resultados guardados
              </button>
            </div>
          </>
        )}

        {screen === 'results-all' && (
          <>
            <ScreenHeader onBack={() => setScreen('start')} />
            <h2 className={styles.heading}>Resultados guardados</h2>
            <p className={styles.text}>
              {sessions.length} estudiante(s) evaluado(s). Los datos quedan guardados solo en este dispositivo.
            </p>
            <div className={styles.tableWrap}>
              {sessions.length ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Brazo</th>
                      <th>Precisión</th>
                      <th className={styles.num}>Interferencia (ms)</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((s, i) => (
                      <tr key={`${s.code}-${s.timestamp}-${i}`}>
                        <td>{s.code}</td>
                        <td>{s.brazo || '—'}</td>
                        <td>{s.accuracyOverall}%</td>
                        <td className={styles.num}>{s.interferenceIndex}</td>
                        <td>
                          <button
                            className={styles.rowDeleteBtn}
                            aria-label={`Eliminar resultado de ${s.code}`}
                            onClick={() => handleDeleteOne(i)}
                          >
                            <TrashIcon size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyBox} />
              )}
            </div>
            <div className={styles.iconBtnRow}>
              <button
                className={`${styles.iconActionBtn} ${styles.excelBtn}`}
                disabled={!sessions.length}
                onClick={() => downloadExcel(sessions)}
              >
                <ExcelIcon /> Descargar Excel
              </button>
              <button
                className={`${styles.iconActionBtn} ${styles.deleteAllBtn}`}
                disabled={!sessions.length}
                onClick={handleDeleteAll}
              >
                <TrashIcon /> Borrar todo
              </button>
            </div>
          </>
        )}
      </div>

      <div className={`${styles.toast} ${toastShow ? styles.show : ''}`}>{toastMsg}</div>

      {pendingDelete && (
        <div className={`${styles.undoToast} ${pendingDelete.closing ? styles.toastOut : ''}`}>
          <span>
            {pendingDelete.removed.length > 1
              ? `Se eliminaron ${pendingDelete.removed.length} resultados.`
              : 'Resultado eliminado.'}
          </span>
          <button onClick={handleUndoDelete}>Deshacer</button>
        </div>
      )}
    </div>
  );
};

const SummaryView = ({ s }) => (
  <>
    <h2 className={styles.heading}>Resultado — {s.code}</h2>

    <div className={styles.highlightRow}>
      <div className={styles.highlightBox}>
        <span className={styles.highlightNum}>{s.accuracyOverall}%</span>
        <span className={styles.highlightLabel}>Precisión general</span>
      </div>
      <div className={styles.highlightBox}>
        <span className={styles.highlightNum}>{s.interferenceIndex ?? '—'}</span>
        <span className={styles.highlightLabel}>Interferencia (ms)</span>
      </div>
    </div>

    <div className={styles.statsGrid}>
      {[
        { label: 'Congruente', acc: s.accuracyCongruente, rt: s.rtCongruente, err: s.erroresCongruente },
        { label: 'Incongruente', acc: s.accuracyIncongruente, rt: s.rtIncongruente, err: s.erroresIncongruente },
        { label: 'Neutra', acc: s.accuracyNeutra, rt: s.rtNeutra, err: s.erroresNeutra },
      ].map((c) => (
        <div className={styles.statCard} key={c.label}>
          <span className={styles.statLabel}>{c.label}</span>
          <span className={styles.statBig}>{c.acc}%</span>
          <span className={styles.statSub}>
            {c.rt ?? '—'} ms · {c.err} err.
          </span>
        </div>
      ))}
    </div>
  </>
);

export default StroopTest;
