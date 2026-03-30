# 🏠 Richiesta Casa Scout

Generatore di messaggi per richiedere una casa scout. Compila i campi, genera il testo e invialo direttamente via WhatsApp o qualsiasi altra app.

**[Prova la demo →](https://br1brown.github.io/msg-casa-scout/)**

## Come funziona

1. Inserisci nome, ruolo, gruppo e casa scout
2. Seleziona il periodo di soggiorno
3. (Opzionale) Aggiungi il numero di partecipanti
4. Genera il messaggio e condividilo o copialo

Il tuo nome, ruolo e gruppo vengono salvati nel browser per le volte successive.

## Struttura

```
├── index.html       # Pagina principale
├── style.css        # Override tema Flatpickr + toggle UI
├── script.js        # Logica form, generazione testo, condivisione
├── icon.svg         # Favicon e icona PWA
├── manifest.json    # Manifest PWA (installabile su telefono)
└── sw.js            # Service Worker (funziona anche offline)
```

## Stack

- [Bootstrap 5.3](https://getbootstrap.com/) — layout e componenti
- [Bootstrap Icons](https://icons.getbootstrap.com/) — icone
- [Flatpickr](https://flatpickr.js.org/) — date range picker
- [SweetAlert2](https://sweetalert2.github.io/) — feedback utente

Tutto caricato da CDN, nessun build step. Installabile come PWA e funzionante offline.

## Licenza

MIT

---

Made with ❤️ by [Br1Brown](https://github.com/br1brown)
