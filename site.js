/* © 2026 Furkan Koç. Tüm hakları saklıdır. BioLab Nexus sitesi.
   Yalnız küçük işler: giriş sahnesini aralıklarla baştan oynatma, “Ne işe yarar?” bölümünde kaydırdıkça ekran görüntüsünü
   değiştirme ve açılır kutuları dışarı tıklanınca kapatma. Hiçbir veri toplamaz, hiçbir yere istek göndermez. Betik çalışmazsa sayfa yine eksiksiz görünür (sahne bir kez oynar). */
'use strict';
(() => {
  document.documentElement.classList.add('js');
  // Sayfa yenilenince en başa dönülür (tarayıcılar varsayılan olarak eski kaydırma yerine geri döner;
  // giriş sahnesi de görünmeden oynamış olurdu). Adreste #bölüm varsa tarayıcı oraya gider.
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (_) { /* eski tarayıcı */ }
  if (!location.hash) window.scrollTo(0, 0);
  const BEKLE_MS = 4500;   // sahne bittikten sonra son hâli ekranda kalma süresi
  const SONDUR_MS = 650;   // söndürme geçişi (stil.css → .sahne transition)
  const ready = fn => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn());

  // Giriş sahnesi: bitince bir süre durur, söner ve baştan oynar. Sekme arkadaysa ya da sahne ekranda değilse
  // beklenir; görününce devam eder. “Hareketi azalt” açıksa sahne yalnız son hâliyle durur, döngü kurulmaz.
  const sahneyiKur = sahne => {
    const azalt = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (azalt) return;
    let gorunur = true, bekliyor = false, zaman = 0;
    const oynat = () => {
      bekliyor = false;
      sahne.classList.remove('oyna', 'bekle');
      void sahne.offsetWidth;                       // animasyonların baştan başlaması için
      sahne.classList.remove('sondur');
      sahne.classList.add('oyna');
    };
    const tekrarla = () => {
      clearTimeout(zaman);
      if (!gorunur || document.hidden) { bekliyor = true; return; }
      if (sahne.classList.contains('bekle')) { oynat(); return; }   // hiç oynamadıysa söndürmeye gerek yok
      sahne.classList.add('sondur');
      zaman = setTimeout(oynat, SONDUR_MS);
    };
    const devam = () => { if (bekliyor && gorunur && !document.hidden) tekrarla(); };
    sahne.addEventListener('animationend', e => {
      if (e.target.classList && e.target.classList.contains('sahne-sonuc')) {
        clearTimeout(zaman);
        zaman = setTimeout(tekrarla, BEKLE_MS);
      }
    });
    document.addEventListener('visibilitychange', devam);
    if ('IntersectionObserver' in window) {
      // Sahne ilk açılışta ekranın altında kaldıysa (telefonda) görününce oynar; yoksa kimse görmeden biterdi.
      if (sahne.getBoundingClientRect().top > window.innerHeight * 0.6) {
        sahne.classList.remove('oyna'); sahne.classList.add('bekle');
        gorunur = false; bekliyor = true;
      }
      new IntersectionObserver(es => { gorunur = es[es.length - 1].isIntersecting; devam(); }, { threshold: 0.3 }).observe(sahne);
    }
  };

  // Açılır kutular (dil seçici, telefon menüsü): dışarı tıklanınca ya da Esc'e basılınca kapanır; biri açılınca öbürü kapanır.
  const acilirlariKur = () => {
    const kutular = [...document.querySelectorAll('.dil-secici, .nav-tel')];
    for (const k of kutular) k.addEventListener('toggle', () => { if (k.open) kutular.forEach(o => { if (o !== k) o.open = false; }); });
    document.addEventListener('click', e => { for (const k of kutular) if (k.open && !k.contains(e.target)) k.open = false; });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      for (const k of kutular) if (k.open) { k.open = false; k.querySelector('summary').focus(); }
    });
    // Kurulum seçenekleri: aynı anda tek kart açık (tarayıcı name="" özelliğini bilmiyorsa)
    const kartlar = [...document.querySelectorAll('details.secenek')];
    for (const k of kartlar) k.addEventListener('toggle', () => { if (k.open) kartlar.forEach(o => { if (o !== k && o.open) o.open = false; }); });
  };

  ready(() => {
    acilirlariKur();
    const sahne = document.querySelector('.sahne');
    if (sahne) sahneyiKur(sahne);
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
