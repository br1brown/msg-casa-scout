/* ================================================================
 *  CONFIGURAZIONE
 * ================================================================ */
const TIPO_CAPO = [
  "capo branco",
  "capo reparto",
  "capo clan",
  "capo scout",
];

/* ================================================================
 *  STATO GLOBALE
 * ================================================================ */
let datiSalvati = {};
let fp = null;

/* ================================================================
 *  LOCALSTORAGE
 * ================================================================ */
const LS_KEY = "scoutMessaggio_identita";

function salvaIdentita(dati) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      nome: dati.nome,
      ruolo: dati.ruolo,
      gruppo: dati.gruppo,
    }));
  } catch { /* storage non disponibile: ignoriamo */ }
}

function caricaIdentita() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) datiSalvati = JSON.parse(raw);
  } catch { /* JSON corrotto o storage assente: ignoriamo */ }
}

/* ================================================================
 *  INIT
 * ================================================================ */
function init() {
  // Popola select ruolo
  const selRuolo = document.getElementById("inp-ruolo");
  TIPO_CAPO.forEach((r) => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    selRuolo.appendChild(opt);
  });

  // Carica identita salvata nel localStorage
  caricaIdentita();

  // Ripristina i campi se ci sono dati salvati
  if (datiSalvati) {
    if (datiSalvati.nome) document.getElementById("inp-nome").value = datiSalvati.nome;
    if (datiSalvati.ruolo) document.getElementById("inp-ruolo").value = datiSalvati.ruolo;
    if (datiSalvati.gruppo) document.getElementById("inp-gruppo").value = datiSalvati.gruppo;
  }

  // Mostra "Invia" solo se Web Share API disponibile
  document.getElementById("btnCondividi").style.display = navigator.share ? "" : "none";

  // Inizializza flatpickr range picker
  fp = flatpickr("#inp-date-range", {
    mode: "range",
    locale: "it",
    minDate: "today",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "j F Y",
    disableMobile: true,
    onChange(selectedDates) {
      const [d1, d2] = selectedDates;
      const fmt = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const g = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${g}`;
      };
      document.getElementById("inp-data1").value = d1 ? fmt(d1) : "";
      document.getElementById("inp-data2").value = d2 ? fmt(d2) : "";
      if (d1 && d2) {
        if (fp.altInput) fp.altInput.classList.remove("is-invalid");
        document.getElementById("feedback-date-range").style.display = "none";
      }
    },
  });

  // Toggle partecipanti con conferma SweetAlert se c'è un valore
  const btnToggle = document.getElementById("btn-toggle-partecipanti");
  const collapseEl = document.getElementById("collapse-partecipanti");
  const bsCollapse = new bootstrap.Collapse(collapseEl, { toggle: false });

  collapseEl.addEventListener("show.bs.collapse", () => {
    btnToggle.setAttribute("aria-expanded", "true");
  });
  collapseEl.addEventListener("hide.bs.collapse", () => {
    btnToggle.setAttribute("aria-expanded", "false");
  });

  btnToggle.addEventListener("click", async () => {
    const isOpen = btnToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      const valore = document.getElementById("inp-partecipanti").value.trim();
      if (valore !== "") {
        const { isConfirmed } = await Swal.fire({
          icon: "question",
          title: "Rimuovere i partecipanti?",
          text: `Hai inserito ${valore} partecipanti. Vuoi davvero rimuoverli dal messaggio?`,
          showCancelButton: true,
          confirmButtonText: "Sì, rimuovi",
          cancelButtonText: "No, tieni",
          confirmButtonColor: "#dc3545",
          cancelButtonColor: "#198754",
        });
        if (!isConfirmed) return;
        document.getElementById("inp-partecipanti").value = "";
      }
      bsCollapse.hide();
    } else {
      bsCollapse.show();
    }
  });

  // Listener submit del form
  document.getElementById("formDati").addEventListener("submit", (e) => {
    e.preventDefault();
    generaMessaggio();
  });
}

document.addEventListener("DOMContentLoaded", init);

/* ================================================================
 *  CAROUSEL
 * ================================================================ */
function getCarousel() {
  return bootstrap.Carousel.getOrCreateInstance(
    document.getElementById("mainCarousel"),
    { touch: false }
  );
}

function aggiornaDot(slideIndex) {
  document.getElementById("dot1").classList.toggle("bg-success", slideIndex === 0);
  document.getElementById("dot1").classList.toggle("bg-secondary", slideIndex !== 0);
  document.getElementById("dot1").classList.toggle("opacity-25", slideIndex !== 0);

  document.getElementById("dot2").classList.toggle("bg-success", slideIndex === 1);
  document.getElementById("dot2").classList.toggle("bg-secondary", slideIndex !== 1);
  document.getElementById("dot2").classList.toggle("opacity-25", slideIndex !== 1);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("mainCarousel").addEventListener("slid.bs.carousel", (e) => {
    aggiornaDot(e.to);
  });
});

/* ================================================================
 *  recuperaDati()
 * ================================================================ */
function recuperaDati() {
  const form = document.getElementById("formDati");
  const nome = document.getElementById("inp-nome").value.trim();
  const ruolo = document.getElementById("inp-ruolo").value;
  const gruppo = document.getElementById("inp-gruppo").value.trim();
  const casa = document.getElementById("inp-casa").value.trim();
  const data1 = document.getElementById("inp-data1").value;
  const data2 = document.getElementById("inp-data2").value;

  const partecipantiRaw = document.getElementById("inp-partecipanti").value.trim();
  const partecipanti = partecipantiRaw !== "" ? parseInt(partecipantiRaw, 10) : null;

  if (partecipanti !== null && (isNaN(partecipanti) || partecipanti < 1 || partecipanti > 999)) {
    const inpP = document.getElementById("inp-partecipanti");
    inpP.classList.add("is-invalid");
    inpP.focus();
    return null;
  } else {
    document.getElementById("inp-partecipanti").classList.remove("is-invalid");
  }

  const feedbackRange = document.getElementById("feedback-date-range");

  if (!data1 || !data2) {
    if (fp.altInput) fp.altInput.classList.add("is-invalid");
    feedbackRange.style.display = "block";
    feedbackRange.textContent = "Seleziona un periodo (data inizio e fine).";
    form.classList.add("was-validated");
    if (!form.checkValidity()) return null;
    return null;
  } else {
    if (fp.altInput) { fp.altInput.classList.remove("is-invalid"); fp.altInput.classList.add("is-valid"); }
    feedbackRange.style.display = "none";
  }

  form.classList.add("was-validated");
  if (!form.checkValidity()) return null;

  return { nome, ruolo, gruppo, nomeCasa: casa, data1, data2, partecipanti };
}

/* ================================================================
 *  UTILITA: parseDateParts
 * ================================================================ */
function parseDateParts(isoString) {
  const [year, month, day] = isoString.split("-").map(Number);
  return { year, month, day };
}

/* ================================================================
 *  UTILITA: nomeMese
 * ================================================================ */
const MESI = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];
function nomeMese(n) { return MESI[n - 1]; }

/* ================================================================
 *  descrivePeriodo(data1, data2)
 * ================================================================ */
function descrivePeriodo(data1, data2) {
  let d1 = parseDateParts(data1);
  let d2 = parseDateParts(data2);

  let t1 = Date.UTC(d1.year, d1.month - 1, d1.day);
  let t2 = Date.UTC(d2.year, d2.month - 1, d2.day);

  // --- Safety Check: Gestione date invertite ---
  if (t1 > t2) {
    [d1, d2] = [d2, d1];
    [t1, t2] = [t2, t1];
  }

  const diffGiorni = Math.round((t2 - t1) / 86400000);
  const annoCorrente = new Date().getFullYear();

  const fmt = (d, { mese = false, anno = false } = {}) => {
    let out = `${d.day}`;
    if (mese) out += ` ${nomeMese(d.month)}`;
    if (anno) out += ` ${d.year}`;
    return out;
  };

  const cambiaMese = d1.month !== d2.month;
  const cambiaAnno = d1.year !== d2.year;
  const mostraAnnoD2 = d2.year !== annoCorrente;
  const mostraAnnoD1 = cambiaAnno && d1.year !== annoCorrente;

  // 1) Stesso giorno
  if (diffGiorni === 0) {
    return `per il giorno ${fmt(d2, { mese: true, anno: mostraAnnoD2 })}`;
  }

  // 2) Notte singola o Weekend
  if (diffGiorni === 1) {
    const dow1 = new Date(t1).getUTCDay();
    const dow2 = new Date(t2).getUTCDay();
    const isWeekend = (dow1 === 6 && dow2 === 0);

    if (isWeekend) {
      return `per il weekend del ${fmt(d1, { mese: cambiaMese || cambiaAnno, anno: mostraAnnoD1 })} e ${fmt(d2, { mese: true, anno: mostraAnnoD2 })}`;
    }

    return `per la notte del ${fmt(d1, { mese: true, anno: d1.year !== annoCorrente })}`;
  }

  // 3) Range di più giorni
  return `dal ${fmt(d1, { mese: cambiaMese || cambiaAnno, anno: mostraAnnoD1 })} al ${fmt(d2, { mese: true, anno: mostraAnnoD2 })}`;
}

/* ================================================================
 *  costruisciTesto(dati)
 * ================================================================ */
function costruisciTesto(dati) {
  const parola = dati.ruolo.toLowerCase().includes("scout") ? "" : " scout";

  let testo =
  `Buongiorno, sono ${dati.nome}, ${dati.ruolo} del gruppo${parola} ${dati.gruppo}.
Volevo chiedere se ${dati.nomeCasa} fosse disponibile ${descrivePeriodo(dati.data1, dati.data2)}.`;

  if (dati.partecipanti)
    testo += ` Saremmo circa ${dati.partecipanti} persone.`;

  testo += ` Grazie mille e buona giornata!`;

  return testo;
}

/* ================================================================
 *  aggiornaUI(testo)
 * ================================================================ */
function aggiornaUI(testo) {
  document.getElementById("testoMessaggio").value = testo;
}

/* ================================================================
 *  generaMessaggio()
 * ================================================================ */
function generaMessaggio() {
  const dati = recuperaDati();
  if (!dati) return;

  datiSalvati = dati;
  salvaIdentita(dati);

  aggiornaUI(costruisciTesto(dati));
  getCarousel().next();
}

/* ================================================================
 *  torna()
 * ================================================================ */
function torna() {
  document.getElementById("formDati").classList.remove("was-validated");
  document.getElementById("inp-nome").focus();
  getCarousel().prev();
}

/* ================================================================
 *  copiaMessaggio()
 * ================================================================ */
async function copiaMessaggio() {
  const testo = document.getElementById("testoMessaggio").value;
  try {
    await navigator.clipboard.writeText(testo);
    await Swal.fire({
      icon: "success",
      title: "Copiato!",
      text: "Incolla il messaggio dove vuoi.",
      confirmButtonColor: "#198754",
      timer: 2000,
      timerProgressBar: true,
    });
  } catch {
    Swal.fire({
      icon: "warning",
      title: "Ops",
      text: "Seleziona il testo e copialo a mano.",
      confirmButtonColor: "#198754",
    });
  }
}

/* ================================================================
 *  condividiMessaggio()
 * ================================================================ */
async function condividiMessaggio() {
  const testo = document.getElementById("testoMessaggio").value;
  try {
    await navigator.share({ title: "Richiesta casa scout", text: testo });
  } catch (err) {
    if (err.name !== "AbortError") {
      Swal.fire({
        icon: "error",
        title: "Condivisione non riuscita",
        text: "Prova a copiare il testo e incollarlo tu stesso.",
        confirmButtonColor: "#198754",
      });
    }
  }
}
