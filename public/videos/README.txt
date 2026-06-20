PERX benefit videos — drop files here, refresh the app.

Naming convention (filename = id, .mp4 or .webm):

  providers/   fitlife.mp4, kombi.mp4, aquaspa.mp4, …
               (see provider ids in src/lib/catalog.js)

  categories/  wellness.mp4, food.mp4, sport.mp4, …
               (fallback when a provider has no own clip)

  packages/    healthy-start.mp4, mind-body.mp4, city-commuter.mp4

Tips:
  • Keep clips short (≤10s), loopable, muted-friendly.
  • Provider clip wins over category clip over remote placeholder.
  • No code changes needed — just paste and refresh.
