# Privacy

Urban Farm Year v1 has no analytics.

Garden profiles, crop plans, care logs, soil tests, and harvest records are stored in the user's browser with IndexedDB. They are not sent to this project, GitHub, or a project-owned server.

Weather is fetched directly from Open-Meteo when the user has a location configured:

https://open-meteo.com/

Optional local assistant features may call user-configured local endpoints, such as an Ollama server on the user's machine. Those endpoints are never configured by default.
