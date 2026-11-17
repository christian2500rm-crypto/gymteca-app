/* Gymteca · service worker de retirada
 *
 * La app ya no se ofrece en esta dirección. Este fichero sustituye al sw.js de la app para que las copias instaladas
 * dejen de abrirla desde su caché: al instalarse toma el control enseguida, borra las cachés de Gymteca, se da de baja
 * y recarga las ventanas abiertas, que ya reciben de la red la página de cierre.
 *
 * La recarga va DESPUÉS de activarse, nunca dentro de waitUntil: una navegación espera a que el service worker termine
 * de activarse, así que esperarla ahí dentro las deja a las dos bloqueadas.
 *
 * No tiene «fetch»: nada se sirve desde aquí. No toca localStorage: los datos que cada persona apuntó se quedan en su
 * dispositivo.
 */
'use strict';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  const listo = (async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith('gymteca-')).map(k => caches.delete(k)));
    } catch (err) { /* sin cachés */ }
    let wins = [];
    try { await self.clients.claim(); wins = await self.clients.matchAll({ type: 'window' }); } catch (err) {}
    try { await self.registration.unregister(); } catch (err) {}
    return wins;
  })();
  e.waitUntil(listo);
  listo.then(wins => { wins.forEach(c => { try { c.navigate(c.url).catch(() => {}); } catch (err) {} }); });
});
