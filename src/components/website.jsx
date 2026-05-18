import { useState, useEffect, useRef, Fragment } from 'react';
import { t, useLang, LANG_LIST, MENU_I18N, ITEM_I18N } from '../i18n.js';
import { Inabel } from './system.jsx';
import { DualGlyph } from './marks.jsx';

const JUST_EAT_URL = 'https://www.just-eat.ch/en/menu/hiraya-asian-fusion-sushi';

const useIsMobile = () => {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
};

const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, on];
};

const MENU = {
  rolls: {
    items: [
      { id: 'roll-dyn',  name: 'Dynamite Roll',         ingredients: 'salmon · mango · surimi · caviar · onion · sauce',                                                        price: 10.50, priceFrom: true, kind: 'maki', tags: ['spicy', 'bestseller'], teaser: true, img: '/hiraya/menu/roll-dyn.png' },
      { id: 'roll-spl',  name: 'Spicy Lachs',           ingredients: 'salmon · onion · cucumber',                                                                                price: 10.00, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/hiraya/menu/roll-spl.png' },
      { id: 'roll-spt',  name: 'Spicy Tuna',            ingredients: 'tuna · onion · cucumber',                                                                                  price: 10.00, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/hiraya/menu/roll-spt.png' },
      { id: 'roll-tmp',  name: 'Tempura Roll',          ingredients: 'shrimp tempura · avocado · sesame · onion · mayo · sauce',                                                  price:  9.50, priceFrom: true, kind: 'maki', tags: [],                                    img: '/hiraya/menu/roll-tmp.png' },
      { id: 'roll-cat',  name: 'Caterpillar Roll',      ingredients: 'shrimp tempura · cucumber · avocado · sesame · sauce',                                                      price: 10.50, priceFrom: true, kind: 'maki', tags: [],                                    img: '/hiraya/menu/roll-cat.png' },
      { id: 'roll-tbl',  name: 'Tuna Blast',            ingredients: 'tuna · cucumber · avocado · mango · spicy sauce',                                                           price: 10.50, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/hiraya/menu/roll-tbl.png' },
      { id: 'roll-swi',  name: 'Swish Roll',            ingredients: 'flambéed salmon · avocado · mango · surimi · jalapeño · sesame · sauce',                                    price: 10.50, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/hiraya/menu/roll-swi.png' },
      { id: 'roll-kru',  name: 'Kiwi Rainbow Uramaki',  ingredients: 'apple · avocado · carrot · pistachio · kiwi · cucumber · sauce',                                            price: 10.00, priceFrom: true, kind: 'maki', tags: ['veg'],                               img: '/hiraya/menu/roll-kru.png' },
      { id: 'roll-vip',  name: 'Vip Roll',              ingredients: 'scallops · carrot · avocado · cucumber · sauce',                                                            price: 11.00, priceFrom: true, kind: 'maki', tags: ['veg'],                               img: '/hiraya/menu/roll-vip.png' },
      { id: 'roll-mix',  name: 'Mix Big Roll',          ingredients: 'salmon · tuna · mango · avocado · sesame · sauce',                                                          price: 10.00, priceFrom: true, kind: 'maki', tags: [] },
      { id: 'roll-una',  name: 'Unagi Rainbow Roll',    ingredients: 'eel · avocado · cucumber · surimi · sesame · sauce',                                                        price: 10.50, priceFrom: true, kind: 'maki', tags: [] },
      { id: 'roll-vfm',  name: 'Veggie Fotomaki',       ingredients: 'avocado · cucumber · mango · radish · apple · kampyo',                                                      price: 10.00, priceFrom: true, kind: 'maki', tags: ['veg'] },
    ],
  },
  poke: {
    items: [
      { id: 'poke-sal',  name: 'Lachs Poke Bowl',   ingredients: 'salmon · avocado · cucumber · radish · edamame · mango · poke sauce',                  price: 20.00, kind: 'bowl',  tags: ['bestseller'], teaser: true, img: '/hiraya/menu/poke-sal.png' },
      { id: 'poke-tu',   name: 'Tuna Poke Bowl',    ingredients: 'tuna · avocado · cucumber · radish · edamame · mango · poke sauce',                    price: 20.50, kind: 'bowl',  tags: [],                              img: '/hiraya/menu/poke-tu.png'  },
      { id: 'poke-shr',  name: 'Shrimp Poke Bowl',  ingredients: 'shrimp · avocado · cucumber · radish · edamame · mango · poke sauce',                  price: 20.00, kind: 'bowl',  tags: [],                              img: '/hiraya/menu/poke-shr.png' },
      { id: 'poke-veg',  name: 'Veggie Poke Bowl',  ingredients: 'avocado · mango · cucumber · edamame · wakame salad · takuan · tamago',                price: 20.00, kind: 'bowl',  tags: ['veg'],                         img: '/hiraya/menu/poke-veg.png' },
      { id: 'bento-lac', name: 'Lachs Bento Box',   ingredients: 'sushi rice · flambéed salmon · market salad · 4 nigiri · wakame salad · sauce',        price: 20.00, kind: 'bento', tags: [] },
      { id: 'bento-tu',  name: 'Tuna Bento Box',    ingredients: 'sushi rice · flambéed tuna · 4 nigiri · market salad · wakame salad · sauce',          price: 20.00, kind: 'bento', tags: [] },
    ],
  },
  sets: {
    items: [
      { id: 'set-mix1',  name: 'Mix Sushi 1',             ingredients: '11 pcs · 4 uramaki (california, rainbow lachs) · 3 nigiri (lachs, ebi, thon) · 4 hosomaki (lachs, avo)',           price: 22, kind: 'set', tags: [],                              img: '/hiraya/menu/set-mix1.png' },
      { id: 'set-mix2',  name: 'Mix Sushi 2',             ingredients: '14 pcs · 4 uramaki (california, rainbow lachs) · 4 nigiri (2 lachs, ebi, thon) · 6 hosomaki (lachs, avo)',         price: 24, kind: 'set', tags: [],           teaser: true,        img: '/hiraya/menu/set-mix2.png' },
      { id: 'set-mix3',  name: 'Mix Sushi Nr. 3',         ingredients: '18 pcs · 8 uramaki (california, rainbow lachs) · 4 sashimi lachs · 6 hosomaki (avo, lachs)',                       price: 30, kind: 'set', tags: [],                              img: '/hiraya/menu/set-mix3.png' },
      { id: 'set-vegi',  name: 'Mix Vegi',                ingredients: '11 pcs · 4 veggi roll · 4 vegi maki · 3 vegi nigiri · avo · mango · cucumber · inari',                             price: 20, kind: 'set', tags: ['veg'],                         img: '/hiraya/menu/set-vegi.png' },
      { id: 'set-vhoso', name: '24 Stück Veggie Hosomaki',ingredients: '24 pcs · 6 avocado maki · 6 mango maki · 6 cucumber maki · 6 pickled radish maki',                                price: 25, kind: 'set', tags: ['vegan'],                       img: '/hiraya/menu/set-vhoso.png' },
      { id: 'set-hana',  name: 'Hana Mix',                ingredients: '14 pcs · 4 california · 4 tuna-mousse · 2 cucumber maki · 2 avo maki · 1 inari nigiri · 1 tamago nigiri',         price: 24, kind: 'set', tags: [] },
      { id: 'set-sho',   name: 'Shohuko Teller',          ingredients: '18 pcs · 4 rainbow lachs · 4 rainbow tuna · 3 salmon maki · 3 tuna maki · 4 nigiri',                              price: 32, kind: 'set', tags: [] },
      { id: 'set-nig',   name: 'Nigiri Supreme',          ingredients: '8 pcs · 4 nigiri lachs · 4 nigiri thon',                                                                           price: 24, kind: 'set', tags: [] },
      { id: 'set-party', name: 'Sushi Party Platter',     ingredients: 'uramaki · hosomaki · nigiri · sashimi or gunkan — chef\'s mixed selection',                                        price: 105, priceFrom: true, kind: 'set', tags: [],            img: '/hiraya/menu/set-party.png' },
    ],
  },
  starters: {
    items: [
      { id: 'start-edm', name: 'Edamame',       ingredients: 'steamed soybeans · sea salt',                                                                                   price: 7,  kind: 'side', tags: ['vegan'] },
      { id: 'start-wak', name: 'Wakame Salad',  ingredients: 'seaweed salad · sesame',                                                                                         price: 5,  kind: 'side', tags: ['vegan'] },
      { id: 'start-mis', name: 'Miso Soup',     ingredients: 'traditional japanese miso · tofu · wakame',                                                                      price: 6,  kind: 'side', tags: ['veg'] },
      { id: 'start-gun', name: 'Gunkan',        ingredients: 'spicy salmon · spicy tuna · red caviar · wakame · crab or shellfish',                                            price: 8,  kind: 'side', tags: ['spicy'] },
      { id: 'start-tem', name: 'Temaki',        ingredients: 'hand roll · salmon · tuna · crab or veggie',                                                                     price: 10, kind: 'side', tags: [] },
      { id: 'start-tat', name: 'Fish Tataki',   ingredients: 'seared fish · ponzu dressing',                                                                                   price: 16, kind: 'side', tags: [], teaser: true },
      { id: 'start-tar', name: 'Fish Tartare',  ingredients: 'raw fish · house seasoning · dressing',                                                                          price: 16, kind: 'side', tags: [] },
    ],
  },
};

const TAG_DEFS = {
  bestseller: { prefix: '★',  bg: 'var(--ink)',       fg: 'var(--paper)' },
  spicy:      { prefix: '🌶', bg: 'var(--clay-deep)', fg: 'var(--linen)' },
  veg:        { prefix: 'V',  bg: 'var(--moss)',      fg: 'var(--linen)' },
  vegan:      { prefix: 'VG', bg: 'var(--moss)',      fg: 'var(--linen)' },
};

const TagChip = ({ tag, lang, small = false }) => {
  const d = TAG_DEFS[tag];
  if (!d) return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: d.bg, color: d.fg, padding: small ? '3px 8px' : '4px 10px',
      borderRadius: 999, fontFamily: 'var(--f-mono)', fontSize: small ? 9 : 10,
      letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500,
    }}>
      <span>{d.prefix}</span>
      <span>{t(lang, 'tag.' + tag)}</span>
    </span>
  );
};

const Rich = ({ html, color = 'var(--clay)', as: As = 'span', style = {}, className = '' }) => (
  <As
    className={('rich ' + className).trim()}
    style={{ ['--rich-color']: color, ...style }}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

const FoodPlaceholder = ({ label = 'food photo', shape = 'square', size, ratio = '1/1', cornerNote }) => {
  const stripeId = 'fp-' + label.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 12);
  const radius = shape === 'circle' ? '50%' : 14;
  return (
    <div style={{
      width: size || '100%', aspectRatio: shape === 'circle' ? '1/1' : ratio,
      borderRadius: radius, overflow: 'hidden', position: 'relative',
      background: 'var(--paper-soft)', border: '1px dashed rgba(26,20,16,0.22)',
    }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <pattern id={stripeId} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="10" fill="var(--paper-soft)" />
            <rect width="4" height="10" fill="var(--bone)" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#${stripeId})`} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 6, padding: 12, textAlign: 'center', color: 'var(--ink-mute)',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="11" r="1.6" />
          <path d="M21 17 L15 11 L8 18" />
        </svg>
        <div className="mono" style={{ fontSize: 9 }}>{label}</div>
      </div>
      {cornerNote && (
        <div className="mono" style={{
          position: 'absolute', top: 8, left: 8, fontSize: 8,
          background: 'var(--ink)', color: 'var(--paper)', padding: '3px 6px', borderRadius: 4,
        }}>{cornerNote}</div>
      )}
    </div>
  );
};

// ── Splash Intro ──
const SplashIntro = ({ onDone }) => {
  const [fading, setFading] = useState(false);
  const dismiss = () => { setFading(true); setTimeout(onDone, 600); };
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1500);
    const t2 = setTimeout(onDone, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);
  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.6s ease',
        pointerEvents: fading ? 'none' : 'all',
        cursor: 'pointer',
      }}
    >
      <div style={{ textAlign: 'center', animation: 'splashFadeIn 0.8s ease both' }}>
        <DualGlyph size={56} color="var(--ember)" />
        <div style={{
          fontFamily: 'var(--f-display)',
          fontSize: 'clamp(64px, 10vw, 120px)',
          lineHeight: 0.9, color: 'var(--paper)', marginTop: 20,
        }}>
          Hira<span style={{ fontStyle: 'italic', color: 'var(--ember)' }}>ya</span>
        </div>
        <div className="mono" style={{
          color: 'rgba(244,234,214,0.45)', marginTop: 14,
          letterSpacing: '0.2em', fontSize: 11,
        }}>
          FUSION SUSHI & POKE · BINNINGEN
        </div>
      </div>
    </div>
  );
};

// ── Marquee Strip ──
const MARQUEE_ITEMS = [
  'FUSION SUSHI', 'POKE BOWLS', 'BINNINGEN', 'CHEF GERWIN',
  'HAND-ROLLED DAILY', 'FILIPINO × JAPANESE', 'THE HIRAYA BOWL', 'SINCE 2024',
];
const MarqueeStrip = () => {
  const text = MARQUEE_ITEMS.join('  ·  ') + '  ·  ';
  return (
    <div style={{ overflow: 'hidden', background: 'var(--clay)', padding: '10px 0' }}>
      <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'marquee 32s linear infinite' }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--linen)', flexShrink: 0 }}>{text}</span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.12em', color: 'var(--linen)', flexShrink: 0 }}>{text}</span>
      </div>
    </div>
  );
};

const Wordmark = ({ size = 28, withGlyph = true, ink = 'var(--ink)', accent = 'var(--clay)', tagline = 'fusion sushi & poke' }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    {withGlyph && <DualGlyph size={size * 1.0} color={accent} />}
    <div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: size * 1.6, lineHeight: 0.95, color: ink }}>
        Hira<span style={{ fontStyle: 'italic', color: accent }}>ya</span>
      </div>
      {tagline && (
        <div className="mono" style={{ color: accent, fontSize: size * 0.32, marginTop: 2 }}>
          {tagline}
        </div>
      )}
    </div>
  </div>
);

const InabelHairline = ({ height = 6 }) => (
  <div style={{ display: 'flex', height, width: '100%' }}>
    {['#b03a22', '#221912', '#d99425', '#efe2c7', '#b03a22', '#221912'].map((c, i) => (
      <div key={i} style={{ flex: i === 3 ? 4 : 1, background: c }} />
    ))}
  </div>
);

const LangPills = ({ lang, onLang, tone = 'light' }) => {
  const dark = tone === 'dark';
  const baseFg = dark ? 'rgba(244,234,214,0.55)' : 'var(--ink-mute)';
  const activeFg = dark ? 'var(--paper)' : 'var(--ink)';
  const activeBg = dark ? 'rgba(244,234,214,0.14)' : 'rgba(26,20,16,0.07)';
  return (
    <div role="group" aria-label="Language" style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em',
    }}>
      {LANG_LIST.map((l, i) => (
        <Fragment key={l.code}>
          {i > 0 && <span aria-hidden style={{ color: baseFg, opacity: 0.4 }}>·</span>}
          <button
            type="button"
            onClick={() => onLang(l.code)}
            aria-pressed={lang === l.code}
            title={l.long}
            style={{
              background: lang === l.code ? activeBg : 'transparent',
              color: lang === l.code ? activeFg : baseFg,
              border: 'none', cursor: 'pointer',
              padding: '4px 7px', borderRadius: 6,
              fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit',
              fontWeight: lang === l.code ? 600 : 400,
              textTransform: 'uppercase',
            }}>
            {l.label}
          </button>
        </Fragment>
      ))}
    </div>
  );
};

const JustEatLink = ({ size = 'md', tone = 'solid', lang = 'de' }) => {
  const sizes = {
    sm: { padX: 14, padY: 9,  font: 12, gap: 8,  logoSize: 18 },
    md: { padX: 18, padY: 12, font: 13, gap: 10, logoSize: 20 },
    lg: { padX: 28, padY: 18, font: 16, gap: 12, logoSize: 24 },
  }[size];
  const bg = tone === 'solid' ? 'var(--clay)'  : 'transparent';
  const fg = tone === 'solid' ? 'var(--linen)' : 'var(--ink)';
  const br = tone === 'solid' ? 'none'         : '1.5px solid var(--ink)';
  const label = size === 'sm' ? t(lang, 'cta.orderShort') : t(lang, 'cta.order');
  return (
    <a href={JUST_EAT_URL} target="_blank" rel="noopener noreferrer" style={{
      background: bg, color: fg, border: br,
      padding: `${sizes.padY}px ${sizes.padX}px`, borderRadius: 999,
      fontFamily: 'var(--f-sans)', fontSize: sizes.font, fontWeight: 700,
      letterSpacing: '0.04em', textDecoration: 'none',
      display: 'inline-flex', alignItems: 'center', gap: sizes.gap,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: sizes.logoSize, height: sizes.logoSize, borderRadius: '50%',
        background: '#ff8000', color: '#fff', fontSize: sizes.logoSize * 0.45,
        fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif', flexShrink: 0,
      }}>JE</span>
      {label}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M7 17 L17 7 M9 7 H17 V15" />
      </svg>
    </a>
  );
};

// ── Navigation ──
const Nav = ({ lang, onLang }) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const px = isMobile ? '20px' : '56px';
  const links = [
    { id: 'menu',     key: 'nav.menu' },
    { id: 'about',    key: 'nav.about' },
    { id: 'catering', key: 'nav.catering' },
    { id: 'find',     key: 'nav.find' },
  ];
  const closeDrawer = () => setDrawerOpen(false);
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--paper)' }}>
      <div style={{
        background: 'var(--ink)', color: 'var(--paper)', padding: `8px ${px}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 12,
      }}>
        <span className="mono" style={{ color: 'var(--ember)' }}>
          {t(lang, 'bar.openToday')} · {t(lang, 'bar.viaJustEat')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {!isMobile && (
            <span className="mono" style={{ color: 'rgba(244,234,214,0.6)' }}>
              Paradiesstrasse 2 · 4102 Binningen · +41 61 421 0024
            </span>
          )}
          <LangPills lang={lang} onLang={onLang} tone="dark" />
        </div>
      </div>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: `14px ${px}`, borderBottom: '1px solid rgba(26,20,16,0.08)', gap: 16,
      }}>
        <a href="#top"><Wordmark size={isMobile ? 15 : 18} /></a>
        {!isMobile && (
          <div style={{ display: 'flex', gap: 36, fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink)', fontWeight: 500 }}>
            {links.map(l => (
              <a key={l.id} href={`#${l.id}`} style={{ color: 'var(--ink)', paddingBottom: 4 }}>
                {t(lang, l.key)}
              </a>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <JustEatLink size="sm" lang={lang} />
          {isMobile && (
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', flexDirection: 'column', gap: 5 }}
            >
              {[0,1,2].map(i => <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'var(--ink)', borderRadius: 2 }} />)}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile drawer */}
      {isMobile && (
        <>
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(26,20,16,0.5)',
              opacity: drawerOpen ? 1 : 0,
              pointerEvents: drawerOpen ? 'all' : 'none',
              transition: 'opacity 0.25s ease',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 201,
            width: 280, background: 'var(--paper)',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
            display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 32px rgba(26,20,16,0.18)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid rgba(26,20,16,0.08)' }}>
              <Wordmark size={14} />
              <button onClick={closeDrawer} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, lineHeight: 1, color: 'var(--ink)', padding: 4 }}>×</button>
            </div>
            <div style={{ flex: 1, padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {links.map(l => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  onClick={closeDrawer}
                  style={{
                    display: 'block', padding: '14px 0',
                    fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 28, lineHeight: 1.1,
                    color: 'var(--ink)', textDecoration: 'none',
                    borderBottom: '1px solid rgba(26,20,16,0.07)',
                  }}
                >
                  {t(lang, l.key)}
                </a>
              ))}
            </div>
            <div style={{ padding: '24px', borderTop: '1px solid rgba(26,20,16,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <LangPills lang={lang} onLang={(l) => { onLang(l); closeDrawer(); }} tone="light" />
              <JustEatLink size="md" lang={lang} />
            </div>
          </div>
        </>
      )}
    </header>
  );
};

// ── Hero ──
const Hero = ({ lang }) => {
  const isMobile = useIsMobile();
  const px = isMobile ? '20px' : '56px';
  return (
    <section id="top" style={{
      position: 'relative', padding: `0 ${px}`, background: 'var(--paper)', overflow: 'hidden',
      minHeight: isMobile ? 'auto' : '100vh', display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
        gap: isMobile ? 36 : 56,
        alignItems: 'center',
        width: '100%',
        paddingTop: isMobile ? 36 : 60,
        paddingBottom: isMobile ? 52 : 80,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <span className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'hero.eyebrow')}</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--f-display)',
            fontSize: isMobile ? 'clamp(64px, 18vw, 100px)' : 'clamp(72px, 10vw, 168px)',
            lineHeight: 0.82,
            letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)',
          }}>
            {t(lang, 'hero.h1.l1')}<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{t(lang, 'hero.h1.l2i')}</span>,<br/>
            {t(lang, 'hero.h1.l3')}
          </h1>
          <div style={{
            fontFamily: 'var(--f-sans)', fontSize: 'clamp(15px, 1.5vw, 21px)', lineHeight: 1.45,
            marginTop: 20, color: 'var(--ink-soft)', maxWidth: 560,
          }}>
            {t(lang, 'hero.subtitle')}
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            <JustEatLink size={isMobile ? 'md' : 'lg'} lang={lang} />
            <a href="#menu" style={{
              fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 14,
              background: 'transparent', color: 'var(--ink)',
              padding: isMobile ? '12px 18px' : '18px 22px',
              borderRadius: 999, border: '1.5px solid var(--ink)',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}>
              {t(lang, 'cta.viewMenu')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9 L12 15 L18 9" />
              </svg>
            </a>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 32, alignItems: 'center', fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-mute)', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'var(--saffron)', fontSize: 16 }}>★★★★★</span> 4.8 · {t(lang, 'hero.reviews')}
            </span>
            <span>•</span>
            <span>{t(lang, 'hero.delivery')}</span>
            {!isMobile && <><span>•</span><span>{t(lang, 'hero.minOrder')}</span></>}
          </div>
        </div>

        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FoodPlaceholder
            label="HIRAYA BOWL — hero photo"
            shape="circle"
            size={isMobile ? undefined : 460}
            cornerNote="HERO"
          />
          {!isMobile && (
            <>
              <div style={{
                position: 'absolute', top: 0, left: -20, padding: '14px 18px',
                background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14,
                transform: 'rotate(-4deg)', boxShadow: '0 14px 30px -10px rgba(0,0,0,0.4)',
                maxWidth: 210,
              }}>
                <div className="mono" style={{ color: 'var(--ember)', fontSize: 9 }}>{t(lang, 'hero.floatFilLabel')}</div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.05, marginTop: 4 }}>
                  ang bunga<br/>ng pangarap
                </div>
                <div className="mono" style={{ color: 'rgba(244,234,214,0.6)', fontSize: 9, marginTop: 4 }}>{t(lang, 'hero.floatFilGloss')}</div>
              </div>
              <div style={{
                position: 'absolute', bottom: 20, right: -10, padding: '14px 18px',
                background: 'var(--clay)', color: 'var(--linen)', borderRadius: 14,
                transform: 'rotate(5deg)', boxShadow: '0 14px 30px -10px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <DualGlyph size={38} color="var(--linen)" />
                <div>
                  <div className="mono" style={{ opacity: 0.85, fontSize: 9 }}>{t(lang, 'hero.floatJpLabel')}</div>
                  <Rich
                    as="div"
                    html={t(lang, 'hero.floatJpLine')}
                    color="var(--linen)"
                    style={{ fontFamily: 'var(--f-display)', fontSize: 22, lineHeight: 1.1, marginTop: 2 }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

// ── Fusion Story ──
const FusionStory = ({ lang }) => {
  const isMobile = useIsMobile();
  const [ref, on] = useReveal();
  const px = isMobile ? '24px' : '56px';
  return (
    <section style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
      <Inabel height={26} variant="slim" seed={801} />
      <div ref={ref} style={{
        padding: `${isMobile ? 72 : 110}px ${px}`, textAlign: 'center',
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(32px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>
        <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'fs.eyebrow')}</div>
        <Rich
          as="div"
          html={t(lang, 'fs.title.html')}
          color="var(--saffron)"
          style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(32px, 6vw, 88px)', lineHeight: 0.95, marginTop: 14, maxWidth: 1080, marginLeft: 'auto', marginRight: 'auto' }}
        />
        {isMobile ? (
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'fs.fil.label')}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 'clamp(24px, 7vw, 40px)', lineHeight: 1.1, marginTop: 10 }}>
                ang bunga<br/>ng pangarap
              </div>
              <Rich as="div" html={t(lang, 'fs.fil.gloss')}
                    style={{ fontFamily: 'var(--f-sans)', fontSize: 15, color: 'rgba(244,234,214,0.7)', marginTop: 10, lineHeight: 1.5 }} />
            </div>
            <DualGlyph size={100} color="var(--clay)" />
            <div style={{ textAlign: 'center' }}>
              <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'fs.jp.label')}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 'clamp(24px, 7vw, 40px)', lineHeight: 1.1, marginTop: 10 }}>
                hiraya<br/>(平屋)
              </div>
              <Rich as="div" html={t(lang, 'fs.jp.gloss')}
                    style={{ fontFamily: 'var(--f-sans)', fontSize: 15, color: 'rgba(244,234,214,0.7)', marginTop: 10, lineHeight: 1.5 }} />
            </div>
          </div>
        ) : (
          <div style={{
            marginTop: 64, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 48,
            alignItems: 'center', maxWidth: 1100, marginLeft: 'auto', marginRight: 'auto',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'fs.fil.label')}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: 1.1, marginTop: 12 }}>
                ang bunga<br/>ng pangarap
              </div>
              <Rich as="div" html={t(lang, 'fs.fil.gloss')}
                    style={{ fontFamily: 'var(--f-sans)', fontSize: 17, color: 'rgba(244,234,214,0.7)', marginTop: 14, lineHeight: 1.5 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 1, height: 40, background: 'rgba(244,234,214,0.3)' }} />
              <DualGlyph size={140} color="var(--clay)" />
              <div style={{ width: 1, height: 40, background: 'rgba(244,234,214,0.3)' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'fs.jp.label')}</div>
              <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 56px)', lineHeight: 1.1, marginTop: 12 }}>
                hiraya<br/>(平屋)
              </div>
              <Rich as="div" html={t(lang, 'fs.jp.gloss')}
                    style={{ fontFamily: 'var(--f-sans)', fontSize: 17, color: 'rgba(244,234,214,0.7)', marginTop: 14, lineHeight: 1.5 }} />
            </div>
          </div>
        )}
        <Rich
          as="div"
          html={t(lang, 'fs.closing.html')}
          color="var(--saffron)"
          style={{ marginTop: 56, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: isMobile ? 22 : 28, lineHeight: 1.35, color: 'var(--saffron)' }}
        />
      </div>
      <Inabel height={26} variant="slim" seed={802} />
    </section>
  );
};

// ── Menu ──
const MenuCard = ({ item, lang, isMobile = false }) => {
  const desc = ITEM_I18N[item.id] && ITEM_I18N[item.id][lang];
  const imgW = isMobile ? 88 : 120;
  return (
    <article style={{
      display: 'grid',
      gridTemplateColumns: `1fr ${imgW}px`,
      gap: isMobile ? 12 : 16,
      background: 'var(--linen)', borderRadius: 12, padding: isMobile ? 14 : 16,
      border: '1px solid rgba(26,20,16,0.06)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: isMobile ? 20 : 24, lineHeight: 1.05, margin: 0, color: 'var(--ink)' }}>
          {item.name}
        </h3>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          {item.ingredients}
        </div>
        {desc && (
          <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: isMobile ? 12 : 14, color: 'var(--ink-mute)', lineHeight: 1.4 }}>
            {desc}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: 8, flexWrap: 'wrap', gap: 6 }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--clay)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {item.priceFrom && <span style={{ opacity: 0.7, fontSize: 11 }}>{t(lang, 'menu.from')} </span>}CHF {item.price.toFixed(2)}
          </span>
          {item.tags && item.tags.map(tag => <TagChip key={tag} tag={tag} lang={lang} small />)}
        </div>
      </div>
      <div style={{ alignSelf: 'stretch' }}>
        {item.img
          ? <img src={item.img} alt={item.name} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', borderRadius: 8, display: 'block' }} />
          : <FoodPlaceholder label={item.name} ratio="1/1" />}
      </div>
    </article>
  );
};

const Menu = ({ lang }) => {
  const isMobile = useIsMobile();
  const [activeKey, setActiveKey] = useState('rolls');
  const [headerH, setHeaderH] = useState(110);
  const [expanded, setExpanded] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('menu-expanded') || '{}'); } catch { return {}; }
  });
  const catNavRef = useRef(null);
  const sectionRefs = useRef({});
  const px = isMobile ? '20px' : '56px';

  const toggleExpand = (key) => setExpanded(prev => {
    const next = { ...prev, [key]: !prev[key] };
    try { sessionStorage.setItem('menu-expanded', JSON.stringify(next)); } catch {}
    return next;
  });

  useEffect(() => {
    const header = document.querySelector('header');
    if (header) setHeaderH(header.offsetHeight);
  }, [isMobile]);

  useEffect(() => {
    const observers = [];
    Object.keys(MENU).forEach(key => {
      const el = sectionRefs.current[key];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveKey(key); },
        { rootMargin: '-20% 0px -65% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollToSection = (e, key) => {
    e.preventDefault();
    const el = sectionRefs.current[key];
    if (!el) return;
    const catNavH = catNavRef.current ? catNavRef.current.offsetHeight : 50;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - catNavH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section id="menu" style={{ background: 'var(--paper)', paddingBottom: 80 }}>

      {/* Section header */}
      <div style={{ padding: `90px ${px} 28px` }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'menu.eyebrow')}</div>
            <Rich as="div" html={t(lang, 'menu.title.html')}
                  style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.92, marginTop: 6 }} />
          </div>
          {!isMobile && (
            <div className="mono" style={{ color: 'var(--ink-mute)', maxWidth: 360, textAlign: 'right', lineHeight: 1.7 }}>
              {t(lang, 'menu.browseInst')}
            </div>
          )}
        </div>
      </div>

      {/* Sticky category nav */}
      <div ref={catNavRef} style={{
        position: 'sticky', top: headerH, zIndex: 50,
        background: 'var(--paper)',
        borderBottom: '1px solid rgba(26,20,16,0.1)',
        padding: `10px ${px}`,
      }}>
        <div className="menu-cat-nav" style={{
          display: 'flex', gap: 4,
          overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none',
        }}>
          {Object.entries(MENU).map(([k]) => (
            <a key={k} href={`#menu-${k}`} onClick={e => scrollToSection(e, k)} style={{
              padding: '9px 16px', borderRadius: 999, cursor: 'pointer',
              fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 600,
              background: activeKey === k ? 'var(--ink)' : 'transparent',
              color: activeKey === k ? 'var(--paper)' : 'var(--ink-soft)',
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'background 0.15s, color 0.15s',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              {MENU_I18N[k].label[lang]}
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 10,
                opacity: activeKey === k ? 0.65 : 0.4,
              }}>{MENU[k].items.length}</span>
            </a>
          ))}
        </div>
      </div>

      {/* All categories stacked */}
      <div style={{ padding: `0 ${px}` }}>
        {Object.entries(MENU).map(([k, cat]) => {
          const catMeta = MENU_I18N[k];
          const isExpanded = !!expanded[k];
          const teaserItem = cat.items.find(i => i.teaser) || cat.items[0];
          const visibleItems = isExpanded ? cat.items : [teaserItem];
          const hiddenCount = cat.items.length - 1;
          return (
            <div key={k} id={`menu-${k}`} ref={el => { sectionRefs.current[k] = el; }} style={{ paddingTop: 52, paddingBottom: 12 }}>

              {/* Category header */}
              <div style={{
                padding: '18px 22px', background: 'var(--linen)', borderRadius: 12,
                borderLeft: '4px solid var(--clay)', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 26, lineHeight: 1.1, color: 'var(--ink)' }}>
                    {catMeta.label[lang]}
                  </div>
                  <div style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5, marginTop: 5 }}>
                    {catMeta.intro[lang]}
                  </div>
                </div>
                <span className="mono" style={{ color: 'var(--ink-mute)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {cat.items.length} {t(lang, 'menu.itemsLabel')} · {catMeta.sub[lang]}
                </span>
              </div>

              {/* Teaser / full items */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(460px, 1fr))',
                gap: 12,
              }}>
                {visibleItems.map((item, idx) => (
                  <div key={item.id} style={idx === 0 && !isExpanded ? { borderRadius: 14, outline: '2px solid var(--clay)', outlineOffset: 2 } : {}}>
                    <MenuCard item={item} lang={lang} isMobile={isMobile} />
                  </div>
                ))}
              </div>

              {/* Expand / collapse toggle */}
              <button
                onClick={() => toggleExpand(k)}
                style={{
                  marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
                  background: isExpanded ? 'transparent' : 'var(--clay)',
                  color: isExpanded ? 'var(--ink-soft)' : 'var(--linen)',
                  border: isExpanded ? '1px solid rgba(26,20,16,0.18)' : 'none',
                  borderRadius: 999, padding: '10px 18px', cursor: 'pointer',
                  fontFamily: 'var(--f-mono)', fontSize: 12, letterSpacing: '0.06em',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {isExpanded
                  ? `↑ ${t(lang, 'menu.collapse')}`
                  : `↓ ${t(lang, 'menu.showAll')} · ${hiddenCount} ${t(lang, 'menu.more')}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div style={{
        margin: `36px ${px} 0`,
        padding: isMobile ? '24px 22px' : '28px 36px',
        background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14,
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center',
        gap: 20,
      }}>
        <div>
          <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'menu.cta.eyebrow')}</div>
          <Rich as="div" html={t(lang, 'menu.cta.title.html')}
                color="var(--ember)"
                style={{ fontFamily: 'var(--f-display)', fontSize: isMobile ? 28 : 36, lineHeight: 1.05, marginTop: 4 }} />
          <div style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'rgba(244,234,214,0.7)', marginTop: 6 }}>
            {t(lang, 'menu.cta.body')}
          </div>
        </div>
        <JustEatLink size={isMobile ? 'md' : 'lg'} lang={lang} />
      </div>
    </section>
  );
};

// ── How to Order ──
const HowToOrder = ({ lang }) => {
  const isMobile = useIsMobile();
  const [ref, on] = useReveal();
  const px = isMobile ? '20px' : '56px';
  return (
    <section style={{ background: 'var(--paper-soft)', borderTop: '1px solid rgba(26,20,16,0.07)', borderBottom: '1px solid rgba(26,20,16,0.07)' }}>
      <div ref={ref} style={{
        padding: `28px ${px}`,
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(16px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>
        {['s1', 's2', 's3'].map((s, i) => (
          <div key={s} style={{
            flex: 1,
            padding: isMobile ? '14px 0' : '0 28px',
            borderLeft: !isMobile && i > 0 ? '1px solid rgba(26,20,16,0.1)' : 'none',
            borderTop: isMobile && i > 0 ? '1px solid rgba(26,20,16,0.1)' : 'none',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 32, color: 'var(--clay)', lineHeight: 1, flexShrink: 0 }}>{'0' + (i + 1)}</span>
            <div>
              <div style={{ fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t(lang, 'how.' + s + '.title')}</div>
              <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 2, fontSize: 11 }}>{t(lang, 'how.' + s + '.body')}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── Featured Bowl ──
const Featured = ({ lang }) => {
  const isMobile = useIsMobile();
  const [ref, on] = useReveal();
  const px = isMobile ? '24px' : '56px';
  const py = isMobile ? '64px' : '90px';
  return (
    <section style={{ background: 'var(--clay)', color: 'var(--linen)' }}>
      <div ref={ref} style={{
        padding: `${py} ${px}`,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.1fr 1fr',
        gap: isMobile ? 36 : 60,
        alignItems: 'center',
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(32px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>
        <div>
          <div className="mono" style={{ opacity: 0.85 }}>{t(lang, 'feature.eyebrow')}</div>
          <Rich as="div" html={t(lang, 'feature.title.html')}
                color="var(--linen)"
                style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 7vw, 104px)', lineHeight: 0.9, marginTop: 8 }} />
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: isMobile ? 16 : 19, lineHeight: 1.55, marginTop: 18, maxWidth: 520, opacity: 0.92 }}>
            {t(lang, 'feature.body')}
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--f-display)', fontSize: isMobile ? 48 : 64 }}>CHF 22.50</span>
            <a href={JUST_EAT_URL} target="_blank" rel="noopener noreferrer" style={{
              fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14,
              background: 'var(--linen)', color: 'var(--ink)', padding: '14px 22px',
              borderRadius: 999, letterSpacing: '0.04em', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>
              {t(lang, 'cta.orderShort')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M7 17 L17 7 M9 7 H17 V15" />
              </svg>
            </a>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: isMobile ? '80%' : 440, maxWidth: '100%' }}>
            <FoodPlaceholder label="HIRAYA BOWL — feature photo" shape="circle" cornerNote="FEATURED" />
          </div>
          <div style={{
            position: 'absolute', top: 8, right: isMobile ? 0 : 24, transform: 'rotate(8deg)',
            background: 'var(--saffron)', color: 'var(--ink)', padding: '8px 14px',
            borderRadius: 999, fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          }}>
            {t(lang, 'feature.badge')}
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Location ──
const LocationBlock = ({ lang }) => {
  const isMobile = useIsMobile();
  const [ref, on] = useReveal();
  const px = isMobile ? '24px' : '56px';
  const py = isMobile ? '64px' : '100px';
  return (
    <section id="find" style={{ background: 'var(--paper-soft)', padding: `${py} ${px}` }}>
      <div ref={ref} style={{
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(32px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>
        <div style={{ marginBottom: 28 }}>
          <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'loc.eyebrow')}</div>
          <Rich as="div" html={t(lang, 'loc.title.html')}
                style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(44px, 6vw, 88px)', lineHeight: 0.95, marginTop: 4 }} />
          {!isMobile && (
            <div className="mono" style={{ color: 'var(--ink-mute)', maxWidth: 360, lineHeight: 1.7, marginTop: 12 }}>
              {t(lang, 'loc.hint')}
            </div>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.4fr 1fr',
          gap: 24,
        }}>
          <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 240, position: 'relative', overflow: 'hidden' }}>
              <iframe
                title="Hiraya location"
                src="https://maps.google.com/maps?q=Hiraya+Asian+Fusion+Sushi,+Paradiesstrasse+2,+4102+Binningen,+Switzerland&output=embed&z=17"
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div style={{
              padding: '24px 28px',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: isMobile ? 20 : 24,
            }}>
              <div>
                <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: isMobile ? 40 : 56, lineHeight: 1 }}>Binningen</div>
                <div className="mono" style={{ color: 'var(--ember)', marginTop: 6 }}>Paradiesstrasse 2 · 4102</div>
                <div className="mono" style={{ color: 'rgba(244,234,214,0.6)', marginTop: 4 }}>+41 61 421 0024</div>
              </div>
              <div style={{ fontFamily: 'var(--f-sans)', fontSize: 14, lineHeight: 1.6 }}>
                <div className="mono" style={{ color: 'var(--ember)', marginBottom: 6 }}>{t(lang, 'loc.hours.label')}</div>
                <div>{t(lang, 'loc.hours.days')}</div>
                <div style={{ color: 'rgba(244,234,214,0.65)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>12:00–14:00 &nbsp; 16:00–20:00</div>
                <div style={{ color: 'rgba(244,234,214,0.4)', fontFamily: 'var(--f-mono)', fontSize: 11, marginTop: 4 }}>{t(lang, 'loc.hours.closed')}</div>
              </div>
            </div>
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="https://maps.google.com/?q=Paradiesstrasse+2,+4102+Binningen" target="_blank" rel="noopener noreferrer"
                 style={{ background: 'var(--clay)', color: 'var(--linen)', padding: '12px 18px', borderRadius: 999, fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                {t(lang, 'cta.route')} →
              </a>
              <a href="tel:+41614210024"
                 style={{ background: 'transparent', color: 'var(--paper)', padding: '12px 18px', borderRadius: 999, fontFamily: 'var(--f-sans)', fontSize: 13, fontWeight: 600, border: '1px solid rgba(244,234,214,0.3)', textDecoration: 'none' }}>
                {t(lang, 'cta.reserve')}
              </a>
            </div>
          </div>
          {!isMobile && (
            <FoodPlaceholder label="STOREFRONT — Paradiesstrasse 2" ratio="3/4" cornerNote="PHOTO" />
          )}
        </div>
      </div>
    </section>
  );
};

// ── Catering ──
const Catering = ({ lang }) => {
  const isMobile = useIsMobile();
  const [ref, on] = useReveal();
  const px = isMobile ? '24px' : '56px';
  const py = isMobile ? '64px' : '100px';
  return (
    <section id="catering" style={{ background: 'var(--paper)', padding: `${py} ${px}` }}>
      <div ref={ref} style={{
        maxWidth: 680,
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(32px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>
        <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'cat.eyebrow')}</div>
        <Rich as="div" html={t(lang, 'cat.title.html')}
              style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(44px, 6vw, 88px)', lineHeight: 0.95, marginTop: 8 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
          {['cat.use.birthday', 'cat.use.office', 'cat.use.wedding', 'cat.use.sushi'].map(key => (
            <span key={key} style={{
              fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.07em',
              padding: '6px 14px', borderRadius: 999,
              border: '1px solid rgba(194,73,42,0.4)', color: 'var(--clay)',
            }}>
              {t(lang, key)}
            </span>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: isMobile ? 16 : 18, lineHeight: 1.55, marginTop: 20, color: 'var(--ink-soft)' }}>
          {t(lang, 'cat.body')}
        </p>
        <div style={{ marginTop: 32 }}>
          <a href="mailto:info@hiraya.ch" style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '16px 22px', borderRadius: 999, fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
            {t(lang, 'cta.request')} →
          </a>
        </div>
      </div>
    </section>
  );
};

// ── Chef Story ──
const Story = ({ lang }) => {
  const isMobile = useIsMobile();
  const [ref, on] = useReveal();
  const px = isMobile ? '24px' : '56px';
  const py = isMobile ? '64px' : '100px';
  return (
    <section id="about" style={{ background: 'var(--paper-soft)', padding: `${py} ${px}` }}>
      <div ref={ref} style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '0.9fr 1.4fr',
        gap: isMobile ? 36 : 80,
        alignItems: isMobile ? 'start' : 'center',
        opacity: on ? 1 : 0, transform: on ? 'none' : 'translateY(32px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}>
        <div>
          <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'story.eyebrow')}</div>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 0.98, marginTop: 14 }}>
            {t(lang, 'story.title.l1')}<br/>
            <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{t(lang, 'story.title.l2')}</span><br/>
            {t(lang, 'story.title.l3')}
          </div>
          <div style={{ marginTop: 24, width: isMobile ? '60%' : 280 }}>
            <img
              src="/hiraya/gerwin.jpg"
              alt="Chef Gerwin"
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', objectPosition: 'center top', borderRadius: 14, display: 'block' }}
            />
          </div>
        </div>
        <div>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: isMobile ? 16 : 19, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 }}>
            {t(lang, 'story.body')}
          </p>
          <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: isMobile ? 22 : 30, color: 'var(--clay)', marginTop: 24, lineHeight: 1.25, marginBottom: 8 }}>
            {t(lang, 'story.quote')}
          </p>
          {t(lang, 'story.quoteGloss') && (
            <p className="mono" style={{ color: 'var(--ink-mute)', margin: 0 }}>
              {t(lang, 'story.quoteGloss')}
            </p>
          )}
          <div style={{ display: 'flex', gap: isMobile ? 20 : 32, marginTop: 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: isMobile ? 44 : 56, lineHeight: 1, color: 'var(--ink)' }}>2024</div>
              <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 4 }}>{t(lang, 'story.stat.founded')}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: isMobile ? 44 : 56, lineHeight: 1, color: 'var(--clay)' }}>4.8★</div>
              <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 4 }}>{t(lang, 'story.stat.rating')}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: isMobile ? 44 : 56, lineHeight: 1, color: 'var(--ink)' }}>25<span style={{ fontSize: 22 }}>min</span></div>
              <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 4 }}>{t(lang, 'story.stat.delivery')}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── Footer ──
const Footer = ({ lang, onLang }) => {
  const isMobile = useIsMobile();
  const px = isMobile ? '24px' : '56px';
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
      <Inabel height={32} variant="full" seed={951} />
      <div style={{
        padding: `${isMobile ? 48 : 60}px ${px} 30px`,
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr',
        gap: isMobile ? 32 : 48,
      }}>
        <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <DualGlyph size={isMobile ? 36 : 48} color="var(--ember)" />
            <div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: isMobile ? 36 : 44, lineHeight: 1 }}>
                Hira<span style={{ fontStyle: 'italic', color: 'var(--ember)' }}>ya</span>
              </div>
              <div className="mono" style={{ color: 'var(--ember)', fontSize: 9, marginTop: 4 }}>fusion sushi &amp; poke</div>
            </div>
          </div>
          <p style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'rgba(244,234,214,0.6)', lineHeight: 1.55, marginTop: 18, maxWidth: 380 }}>
            {t(lang, 'footer.tagline')}
          </p>
        </div>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: 13, lineHeight: 2 }}>
          <div className="mono" style={{ color: 'var(--ember)', marginBottom: 6 }}>{t(lang, 'footer.col.order')}</div>
          <div><a href={JUST_EAT_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Just Eat ↗</a></div>
          <div><a href="mailto:info@hiraya.ch" style={{ color: 'inherit', textDecoration: 'none' }}>{t(lang, 'cta.request')}</a></div>
          <div><a href="tel:+41614210024" style={{ color: 'inherit', textDecoration: 'none' }}>+41 61 421 0024</a></div>
        </div>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: 13, lineHeight: 2 }}>
          <div className="mono" style={{ color: 'var(--ember)', marginBottom: 6 }}>{t(lang, 'footer.col.loc')}</div>
          <div>Paradiesstrasse 2</div>
          <div>4102 Binningen</div>
          <div>{t(lang, 'loc.hours.days')} 12–14 · 16–20</div>
          <div><a href="https://maps.google.com/?q=Paradiesstrasse+2,+4102+Binningen" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{t(lang, 'cta.route')}</a></div>
        </div>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: 13, lineHeight: 2 }}>
          <div className="mono" style={{ color: 'var(--ember)', marginBottom: 6 }}>{t(lang, 'footer.col.follow')}</div>
          <div><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Instagram</a></div>
          <div><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Facebook</a></div>
          <div><a href="https://g.co/kgs/hiraya-binningen" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Google</a></div>
        </div>
      </div>
      <div style={{
        padding: `24px ${px}`, textAlign: 'center',
        borderTop: '1px solid rgba(244,234,214,0.1)',
        fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 22,
        color: 'var(--ember)', letterSpacing: '0.01em',
      }}>
        {t(lang, 'footer.thanksAll')}
      </div>
      <div style={{ padding: `16px ${px} 28px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(244,234,214,0.06)', color: 'rgba(244,234,214,0.45)', flexWrap: 'wrap', gap: 12 }}>
        <span className="mono">{t(lang, 'footer.copy')}</span>
        <LangPills lang={lang} onLang={onLang} tone="dark" />
      </div>
    </footer>
  );
};

// ── Top-level Website component ──
export const Website = () => {
  const [lang, setLang] = useLang();
  const [splashDone, setSplashDone] = useState(() => {
    try { return !!sessionStorage.getItem('splash-seen'); } catch { return false; }
  });
  const handleSplashDone = () => {
    try { sessionStorage.setItem('splash-seen', '1'); } catch {}
    setSplashDone(true);
  };
  return (
    <div style={{ width: '100%', background: 'var(--paper)', fontFamily: 'var(--f-sans)', color: 'var(--ink)' }}>
      {!splashDone && <SplashIntro onDone={handleSplashDone} />}
      <Nav lang={lang} onLang={setLang} />
      <Hero lang={lang} />
      <MarqueeStrip />
      <FusionStory lang={lang} />
      <Menu lang={lang} />
      <HowToOrder lang={lang} />
      <LocationBlock lang={lang} />
      <Catering lang={lang} />
      <Story lang={lang} />
      <Footer lang={lang} onLang={setLang} />
    </div>
  );
};
