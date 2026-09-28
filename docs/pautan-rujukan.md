# Pautan Rujukan Rasmi — ikut hari

[← Indeks docs](./README.md) · [Jadual](../JADUAL.md) · [Nota topikal](../nota/README.md) · [Glosari](./glosari.md)

> **Pautan disemak:** 26 Sep 2026 (`curl`, status HTTP 200). Laman dokumentasi kerap menyusun semula URL. Jika pautan rosak, cari tajuk halaman di laman induk yang sama.
> Keutamaan sumber: **dokumentasi rasmi** (MDN, Node.js, pustaka) → spesifikasi (OGC, IETF) → tutorial ([javascript.info](https://javascript.info/)).

## Umum (sepanjang kursus)

| Sumber | Pautan | Guna |
|--------|--------|------|
| MDN — JavaScript Guide | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide> | Panduan berstruktur dari asas |
| MDN — JavaScript Reference | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference> | Rujukan setiap sintaks & objek terbina |
| The Modern JavaScript Tutorial | <https://javascript.info/> | Tutorial lengkap dengan latihan |
| Chrome DevTools | <https://developer.chrome.com/docs/devtools/> | Console, Sources, Network, Application |
| VS Code | <https://code.visualstudio.com/> | Editor |
| Node.js — muat turun | <https://nodejs.org/en/download> | Pemasang LTS |
| Node.js — jadual keluaran | <https://nodejs.org/en/about/previous-releases> | Tarikh tamat sokongan setiap versi |

## Hari 1 — Modern JavaScript (ES6+) Core Syntax

| Topik | Pautan |
|-------|--------|
| Jenis data & variable | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types> |
| Kawalan aliran & error handling | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling> |
| Loop | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Loops_and_iteration> |
| Fungsi | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions> |
| Closure | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures> |
| Template literal | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals> |
| Destructuring | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring> |
| Spread | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax> |
| Optional chaining `?.` | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining> |
| Nullish coalescing `??` | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing> |
| `Array` (map/filter/reduce…) | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array> |
| `JSON` | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON> |
| Modul ES (`import`/`export`) | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules> |
| `structuredClone()` | <https://developer.mozilla.org/en-US/docs/Web/API/structuredClone> |
| Spesifikasi GeoJSON (RFC 7946) | <https://datatracker.ietf.org/doc/html/rfc7946> |
| geojson.io (lihat/lukis GeoJSON) | <https://geojson.io/> |

## Hari 2 — Asynchronous JavaScript & Web API Integration

| Topik | Pautan |
|-------|--------|
| Event loop | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop> |
| Async JavaScript (modul pembelajaran MDN) | <https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS> |
| `Promise` | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise> |
| `async function` / `await` | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function> |
| Menggunakan Fetch | <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch> |
| `AbortController` | <https://developer.mozilla.org/en-US/docs/Web/API/AbortController> |
| `AbortSignal.timeout()` | <https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static> |
| Kod status HTTP | <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status> |
| HTTP method | <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods> |
| Header HTTP | <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers> |
| CORS | <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS> |
| `URL` & `URLSearchParams` | <https://developer.mozilla.org/en-US/docs/Web/API/URL> · <https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams> |
| Node.js `http` (asas mock API) | <https://nodejs.org/docs/latest-v22.x/api/http.html> |
| Thunder Client (VS Code) | <https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client> |
| REST Client (VS Code) | <https://marketplace.visualstudio.com/items?itemName=humao.rest-client> |
| Postman | <https://www.postman.com/downloads/> |

### API awam (pilihan — perlu internet)

| API | Pautan | Nota |
|-----|--------|------|
| data.gov.my — dokumentasi pembangun | <https://developer.data.gov.my/> | API data terbuka Malaysia |
| data.gov.my — sintaks query | <https://developer.data.gov.my/request-query> | `filter`, `limit`, `sort`, … |
| data.gov.my — OpenDOSM | <https://developer.data.gov.my/static-api/opendosm> | Katalog data DOSM |
| Portal data.gov.my | <https://data.gov.my/> | Cari `id` set data |
| Nominatim — dokumentasi API | <https://nominatim.org/release-docs/latest/api/Overview/> | Geocoding |
| Nominatim — polisi penggunaan | <https://operations.osmfoundation.org/policies/nominatim/> | **≤ 1 req/s**, `User-Agent` yang jelas, tiada geocoding pukal |

Contoh yang disahkan berfungsi (26 Sep 2026; perhatikan `/` sebelum `?`, kerana tanpanya server memberi 301):

```js
const url = 'https://api.data.gov.my/data-catalogue/?id=population_state&filter=Selangor@state&limit=1';
const data = await (await fetch(url)).json();   // [{ state: 'Selangor', population: 6994.4, … }]
```

## Hari 3 — DOM Manipulation & Event Handling (+ Leaflet)

| Topik | Pautan |
|-------|--------|
| Pengenalan DOM | <https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model> |
| `querySelector` | <https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector> |
| `createElement` | <https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement> |
| `textContent` (selamat vs `innerHTML`) | <https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent> |
| `addEventListener` | <https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener> |
| `FormData` | <https://developer.mozilla.org/en-US/docs/Web/API/FormData> |
| Validasi borang | <https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation> |
| OWASP — Pencegahan XSS | <https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html> |
| Leaflet — laman utama | <https://leafletjs.com/> |
| Leaflet — Quick Start | <https://leafletjs.com/examples/quick-start/> |
| Leaflet — GeoJSON | <https://leafletjs.com/examples/geojson/> |
| Leaflet — WMS & TMS | <https://leafletjs.com/examples/wms/wms.html> |
| Leaflet — rujukan API 1.9 | <https://leafletjs.com/reference.html> |
| Leaflet — semua tutorial | <https://leafletjs.com/examples.html> |
| Leaflet — muat turun (salinan luar talian) | <https://leafletjs.com/download.html> |
| Polisi tile OSM | <https://operations.osmfoundation.org/policies/tiles/> |
| Hak cipta & atribusi OSM | <https://www.openstreetmap.org/copyright> |

## Hari 4 — Web Development Tooling & Ecosystem (+ format fail)

| Topik | Pautan |
|-------|--------|
| npm — dokumentasi | <https://docs.npmjs.com/> |
| `npm ci` | <https://docs.npmjs.com/cli/v10/commands/npm-ci> |
| Semantic versioning | <https://docs.npmjs.com/about-semantic-versioning> |
| Vite — panduan | <https://vite.dev/guide/> |
| Vite — env & mode (`import.meta.env`, `VITE_API_URL`) | <https://vite.dev/guide/env-and-mode> |
| Vite — konfigurasi | <https://vite.dev/config/> |
| ESLint — dokumentasi | <https://eslint.org/docs/latest/> |
| ESLint — fail konfigurasi (flat config) | <https://eslint.org/docs/latest/use/configure/configuration-files> |
| Prettier | <https://prettier.io/docs/> |
| Sambungan ESLint / Prettier / Live Server | <https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint> · <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode> · <https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer> |
| Web Storage API | <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API> |
| Menggunakan Web Storage | <https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API> |
| `localStorage` | <https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage> |
| IndexedDB API | <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API> |
| Menggunakan IndexedDB | <https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB> |
| Git | <https://git-scm.com/downloads> |

## Hari 5 — State Management & Modern Frontend Architecture

| Topik | Pautan |
|-------|--------|
| `URLSearchParams` (state dalam URL) | <https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams> |
| Node.js test runner (`node --test`) | <https://nodejs.org/docs/latest-v22.x/api/test.html> |
| Node.js — dokumentasi API v22 | <https://nodejs.org/docs/latest-v22.x/api/> |
| `console` API | <https://developer.mozilla.org/en-US/docs/Web/API/console> |
| DevTools — Console API | <https://developer.chrome.com/docs/devtools/console/api> |
| DevTools — debug JavaScript | <https://developer.chrome.com/docs/devtools/javascript> |
| DevTools — Network | <https://developer.chrome.com/docs/devtools/network> |
| `try…catch` | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch> |
| `Error` & custom error | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error> |
| Event `error` global | <https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event> |
| Event `unhandledrejection` | <https://developer.mozilla.org/en-US/docs/Web/API/Window/unhandledrejection_event> |
| Leaflet.markercluster | <https://github.com/Leaflet/Leaflet.markercluster> |
| Plugin Leaflet (senarai) | <https://leafletjs.com/plugins.html> |
| Turf `simplify` | <https://turfjs.org/docs/api/simplify> |
| OWASP Top 10 | <https://owasp.org/Top10/> |
| React | <https://react.dev/> |
| Vue | <https://vuejs.org/> |
| Svelte | <https://svelte.dev/> |
| Redux | <https://redux.js.org/> |
| Zustand | <https://zustand.docs.pmnd.rs/> |
| Pinia | <https://pinia.vuejs.org/> |
| Cadangan TC39 Signals | <https://github.com/tc39/proposal-signals> |

## Geospatial — pustaka JavaScript

| Pustaka | Pautan | Guna dalam kursus |
|---------|--------|-------------------|
| Leaflet 1.9 | <https://leafletjs.com/reference.html> | Peta utama |
| MapLibre GL JS | <https://maplibre.org/maplibre-gl-js/docs/> | Peta vektor WebGL (⭐) |
| OpenLayers | <https://openlayers.org/> · <https://openlayers.org/en/latest/apidoc/> | Sokongan OGC & projection paling luas |
| ArcGIS Maps SDK for JavaScript | <https://developers.arcgis.com/javascript/latest/> | Ekosistem Esri / ArcGIS Enterprise |
| Turf.js | <https://turfjs.org/> · <https://github.com/Turfjs/turf> | Analisis ruang |
| proj4js | <https://github.com/proj4js/proj4js> | Tukar projection |
| epsg.io | <https://epsg.io/> · [3375](https://epsg.io/3375) · [3376](https://epsg.io/3376) · [4742](https://epsg.io/4742) | Definisi CRS (`.proj4`, `.wkt`) |
| geotiff.js | <https://geotiffjs.github.io/> · <https://github.com/geotiffjs/geotiff.js> | Baca GeoTIFF/COG |
| loaders.gl | <https://loaders.gl/> · [LASLoader](https://loaders.gl/docs/modules/las/api-reference/las-loader) | Baca LAS/LAZ |
| shpjs (shapefile-js) | <https://github.com/calvinmetcalf/shapefile-js> | Baca Shapefile (zip) |
| @mapbox/shp-write | <https://github.com/mapbox/shp-write> | Tulis Shapefile |
| @tmcw/togeojson | <https://github.com/placemark/togeojson> | KML → GeoJSON |
| tokml | <https://github.com/mapbox/tokml> | GeoJSON → KML |
| sql.js | <https://sql.js.org/> | SQLite dalam browser (GeoPackage) |
| JSZip | <https://stuk.github.io/jszip/> | Buka KMZ / zip Shapefile |
| FlatGeobuf | <https://flatgeobuf.org/> | Format vektor boleh-strim |
| PMTiles | <https://github.com/protomaps/PMTiles> · <https://docs.protomaps.com/pmtiles/> | Tile satu-fail tanpa server |
| MBTiles (spesifikasi) | <https://github.com/mapbox/mbtiles-spec> | Tile dalam SQLite |

## Geospatial — standard, alat & server

| Sumber | Pautan | Nota |
|--------|--------|------|
| OGC WMS | <https://www.ogc.org/standards/wms/> | Peta imej |
| OGC WFS | <https://www.ogc.org/standards/wfs/> | Ciri vektor |
| OGC WMTS | <https://www.ogc.org/standards/wmts/> | Tile |
| OGC GeoPackage | <https://www.ogc.org/standards/geopackage/> · <https://www.geopackage.org/> · [spesifikasi](https://docs.ogc.org/is/12-128r19/12-128r19.html) | Format SQLite |
| OGC KML | <https://www.ogc.org/standards/kml/> | |
| GeoJSON RFC 7946 | <https://datatracker.ietf.org/doc/html/rfc7946> | |
| Cloud Optimized GeoTIFF | <https://cogeo.org/> | |
| Spesifikasi LAS (ASPRS) | <https://github.com/ASPRSorg/LAS> | |
| LASzip (LAZ) | <https://laszip.org/> | |
| PDAL (alat point cloud) | <https://pdal.io/> | `pdal info` |
| GDAL | <https://gdal.org/> | |
| `ogr2ogr` | <https://gdal.org/en/stable/programs/ogr2ogr.html> | Tukar format vektor |
| `ogrinfo` · `gdalinfo` | <https://gdal.org/en/stable/programs/ogrinfo.html> · <https://gdal.org/en/stable/programs/gdalinfo.html> | Periksa fail |
| `gdal_translate` · `gdalwarp` | <https://gdal.org/en/stable/programs/gdal_translate.html> · <https://gdal.org/en/stable/programs/gdalwarp.html> | Tukar / unjur semula raster |
| Pemacu ECW | <https://gdal.org/en/stable/drivers/raster/ecw.html> | Perlu SDK proprietari |
| Pemacu COG | <https://gdal.org/en/stable/drivers/raster/cog.html> | |
| Senarai pemacu vektor / raster | <https://gdal.org/en/stable/drivers/vector/index.html> · <https://gdal.org/en/stable/drivers/raster/index.html> | |
| QGIS | <https://qgis.org/> · <https://qgis.org/download/> | GIS desktop sumber terbuka |
| GeoServer | <https://geoserver.org/> | |
| GeoServer — manual pengguna | <https://docs.geoserver.org/stable/en/user/> | |
| GeoServer — rujukan WMS | <https://docs.geoserver.org/latest/en/user/services/wms/reference/> | |
| GeoServer — rujukan WFS | <https://docs.geoserver.org/latest/en/user/services/wfs/reference/> | |
| GeoServer — susunan paksi WFS | <https://docs.geoserver.org/latest/en/user/services/wfs/axis_order/> | Punca biasa lat/lng terbalik |
| GeoServer — konfigurasi container (termasuk CORS) | <https://docs.geoserver.org/latest/en/user/production/container/> | |
| JUPEM | <https://www.jupem.gov.my/> | Rujukan datum & projection Malaysia |

## Nota topikal kursus

Lihat [`nota/README.md`](../nota/README.md). Setiap nota mempunyai bahagian **Rujukan rasmi** tersendiri.
