/* © 2026 Furkan Koç. Tüm hakları saklıdır. BioLab Nexus sitesi.
   Yalnız iki küçük iş: giriş sahnesini yeniden oynatma ve “Ne işe yarar?” bölümünde kaydırdıkça ekran görüntüsünü değiştirme.
   Hiçbir veri toplamaz, hiçbir yere istek göndermez. Betik çalışmazsa sayfa yine eksiksiz görünür. */
'use strict';
(() => {
  document.documentElement.classList.add('js');
  // Sayfa yenilenince en başa dönülür (tarayıcılar varsayılan olarak eski kaydırma yerine geri döner;
  // giriş sahnesi de görünmeden oynamış olurdu). Adreste #bölüm varsa tarayıcı oraya gider.
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) { /* eski tarayıcı */ }
  if (!location.hash) window.scrollTo(0, 0);
  const ready = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());
  ready(() => {
    const sahne = document.querySelector('.sahne'), tekrar = document.querySelector('.sahne-tekrar');
    const oynat = () => { sahne.classList.remove('oyna'); void sahne.offsetWidth; sahne.classList.add('oyna'); };
    if (sahne && tekrar) {
      tekrar.hidden = false;
      tekrar.addEventListener('click', oynat);
      // Sahne ekranın altında kaldıysa (telefonda) görününce oynar; yoksa kimse görmeden biterdi.
      const r = sahne.getBoundingClientRect();
      const azalt = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!azalt && 'IntersectionObserver' in window && r.top > window.innerHeight * 0.6) {
        sahne.classList.remove('oyna'); sahne.classList.add('bekle');
        const g = new IntersectionObserver(es => {
          if (es.some(e => e.isIntersecting)) { g.disconnect(); sahne.classList.remove('bekle'); oynat(); }
        }, { threshold: 0.3 });
        g.observe(sahne);
      }
    }
    const hikaye = document.querySelector('.hikaye');
    if (!hikaye || !('IntersectionObserver' in window)) return;
    const adimlar = [...hikaye.querySelectorAll('[data-gorsel]')], resimler = [...hikaye.querySelectorAll('.pencere-ekran img')];
    const sec = i => {
      adimlar.forEach((a, k) => a.classList.toggle('aktif', k === i));
      resimler.forEach((r, k) => r.classList.toggle('aktif', k === i));
    };
    sec(0);
    const io = new IntersectionObserver(es => { for (const e of es) if (e.isIntersecting) sec(Number(e.target.dataset.gorsel)); },
      { rootMargin: '-45% 0px -45% 0px' });
    adimlar.forEach(a => io.observe(a));
  });
})();
