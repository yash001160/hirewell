# Hirewell – Job Board Portal

Open `index.html` in a browser. No build step and no server needed.

## Structure
```
index.html            markup only
css/                  tokens, base, layout, components, one file per screen, responsive
js/core/              bus (events), storage (localStorage adapter), utils
js/services/          auth, job, application, stats  (data + rules, no DOM)
js/ui/                shell + one module per screen    (DOM only, calls services)
js/app.js             bootstrap
```
Services never touch the DOM and never call each other's internals except through
their public API or the event bus (`jobs:removed`, `auth:login`, `apps:changed` ...).
Everything runs in the browser. Data is kept in localStorage, so there is no backend, database or server to set up.
