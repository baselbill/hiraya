import { useState } from 'react';
import { t, useLang, LANG_LIST, MENU_I18N, ITEM_I18N } from '../i18n.js';
import { Inabel } from './system.jsx';
import { DualGlyph } from './marks.jsx';

const JUST_EAT_URL = 'https://www.just-eat.ch/en/menu/hiraya-asian-fusion-sushi';

const MENU = {
  poke: {
    items: [
      { id: 'poke-hir', name: 'Hiraya Bowl',    ingredients: 'salmon · mango · calamansi · avocado · crispy garlic', price: 22.50, kind: 'bowl', tags: ['bestseller'] },
      { id: 'poke-sal', name: 'Salmon Classic', ingredients: 'salmon · edamame · cucumber · sesame · ponzu',         price: 19.50, kind: 'bowl', tags: [] },
      { id: 'poke-tu',  name: 'Tuna Spicy',     ingredients: 'tuna · sriracha mayo · avocado · seaweed · scallion', price: 21.00, kind: 'bowl', tags: ['spicy'] },
      { id: 'poke-tof', name: 'Tofu Garden',    ingredients: 'tofu · edamame · radish · carrot · ginger · sesame', price: 17.00, kind: 'bowl', tags: ['vegan'] },
      { id: 'poke-chi', name: 'Adobo Chicken',  ingredients: 'chicken adobo · pickled mustard · scallion · sesame', price: 19.00, kind: 'bowl', tags: [] },
      { id: 'poke-mix', name: 'Mixed Sashimi',  ingredients: "chef's selection · sushi rice · house dressing",      price: 26.00, kind: 'bowl', tags: [] },
    ],
  },
  signatures: {
    items: [
      { id: 'hiraya', name: 'Hiraya Roll',    ingredients: 'salmon · mango · calamansi · crispy garlic',  price: 18.50, kind: 'maki', tags: ['bestseller'] },
      { id: 'adobo',  name: 'Adobo Maki',    ingredients: 'pork adobo · pickled mustard · scallion',     price: 17.00, kind: 'maki', tags: [] },
      { id: 'sisig',  name: 'Sisig Crunch',  ingredients: 'crispy pork · quail egg · chili mayo',        price: 17.50, kind: 'maki', tags: [] },
      { id: 'bicol',  name: 'Bicol Express', ingredients: 'coconut · chili · crab · cucumber',           price: 18.00, kind: 'maki', tags: ['spicy'] },
      { id: 'ube',    name: 'Ube Tempura',   ingredients: 'purple yam · salted egg · coconut',           price: 16.00, kind: 'maki', tags: ['veg'] },
      { id: 'mango',  name: 'Manggo Spice',  ingredients: 'tuna · mango · jalapeño · sesame',            price: 17.50, kind: 'maki', tags: ['spicy'] },
    ],
  },
  classics: {
    items: [
      { id: 'cali',    name: 'California',     ingredients: 'crab · avocado · cucumber',             price: 12.00, kind: 'maki', tags: [] },
      { id: 'spicy',   name: 'Spicy Tuna',     ingredients: 'tuna · sriracha mayo · cucumber',       price: 14.00, kind: 'maki', tags: ['spicy'] },
      { id: 'salav',   name: 'Salmon Avocado', ingredients: 'salmon · avocado · sesame',             price: 13.50, kind: 'maki', tags: [] },
      { id: 'crispy',  name: 'Crispy Chicken', ingredients: 'panko chicken · cucumber · teriyaki',   price: 13.00, kind: 'maki', tags: [] },
      { id: 'volcano', name: 'Volcano',        ingredients: 'tuna · spicy mayo · tempura crunch',   price: 15.00, kind: 'maki', tags: ['spicy'] },
      { id: 'veggie',  name: 'Veggie Garden',  ingredients: 'avocado · cucumber · carrot · radish', price: 11.00, kind: 'maki', tags: ['vegan'] },
    ],
  },
  sides: {
    items: [
      { id: 'gyoza',   name: 'Pork Gyoza · 6', ingredients: 'house-folded · ponzu',          price: 9.50, kind: 'side', tags: [] },
      { id: 'edamame', name: 'Edamame',         ingredients: 'sea salt · chili flakes',       price: 5.50, kind: 'side', tags: ['vegan'] },
      { id: 'miso',    name: 'Miso Soup',       ingredients: 'tofu · wakame · scallion',      price: 4.50, kind: 'side', tags: ['veg'] },
      { id: 'lumpia',  name: 'Lumpia · 4',      ingredients: 'crispy pork rolls · sweet chili', price: 8.50, kind: 'side', tags: [] },
      { id: 'salad',   name: 'Wakame Salad',    ingredients: 'seaweed · sesame · ginger',     price: 6.50, kind: 'side', tags: ['vegan'] },
      { id: 'rice',    name: 'Steamed Rice',    ingredients: 'niigata · short-grain',          price: 3.50, kind: 'side', tags: ['vegan'] },
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
        <>
          {i > 0 && <span key={`sep-${l.code}`} aria-hidden style={{ color: baseFg, opacity: 0.4 }}>·</span>}
          <button
            key={l.code}
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
        </>
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

const Nav = ({ lang, onLang }) => {
  const links = [
    { id: 'menu',     key: 'nav.menu' },
    { id: 'about',    key: 'nav.about' },
    { id: 'catering', key: 'nav.catering' },
    { id: 'find',     key: 'nav.find' },
  ];
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--paper)' }}>
      <div style={{
        background: 'var(--ink)', color: 'var(--paper)', padding: '8px 56px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, gap: 24,
        flexWrap: 'wrap',
      }}>
        <span className="mono" style={{ color: 'var(--ember)' }}>
          {t(lang, 'bar.openToday')} · {t(lang, 'bar.viaJustEat')}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <span className="mono" style={{ color: 'rgba(244,234,214,0.6)' }}>
            Paradiesstrasse 2 · 4102 Binningen · +41 61 421 0024
          </span>
          <LangPills lang={lang} onLang={onLang} tone="dark" />
        </div>
      </div>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 56px', borderBottom: '1px solid rgba(26,20,16,0.08)', gap: 24, flexWrap: 'wrap',
      }}>
        <a href="#top"><Wordmark size={18} /></a>
        <div style={{ display: 'flex', gap: 36, fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink)', fontWeight: 500, flexWrap: 'wrap' }}>
          {links.map(l => (
            <a key={l.id} href={`#${l.id}`} style={{ color: 'var(--ink)', paddingBottom: 4 }}>
              {t(lang, l.key)}
            </a>
          ))}
        </div>
        <JustEatLink size="sm" lang={lang} />
      </nav>
    </header>
  );
};

const Hero = ({ lang }) => (
  <section id="top" style={{ position: 'relative', padding: '60px 56px 80px', background: 'var(--paper)', overflow: 'hidden' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 56, alignItems: 'center' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <span className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'hero.eyebrow')}</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--f-display)', fontSize: 'clamp(72px, 10vw, 168px)', lineHeight: 0.82,
          letterSpacing: '-0.02em', margin: 0, color: 'var(--ink)',
        }}>
          Two<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>languages</span>,<br/>
          one bowl.
        </h1>
        <div style={{
          fontFamily: 'var(--f-sans)', fontSize: 'clamp(15px, 1.5vw, 21px)', lineHeight: 1.45,
          marginTop: 24, color: 'var(--ink-soft)', maxWidth: 560,
        }}>
          {t(lang, 'hero.subtitle')}
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 36, flexWrap: 'wrap', alignItems: 'center' }}>
          <JustEatLink size="lg" lang={lang} />
          <a href="#menu" style={{
            fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 14,
            background: 'transparent', color: 'var(--ink)', padding: '18px 22px',
            borderRadius: 999, border: '1.5px solid var(--ink)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            {t(lang, 'cta.viewMenu')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 9 L12 15 L18 9" />
            </svg>
          </a>
        </div>

        <div style={{ display: 'flex', gap: 28, marginTop: 40, alignItems: 'center', fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-mute)', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <span style={{ color: 'var(--saffron)', fontSize: 16 }}>★★★★★</span> 4.9 · {t(lang, 'hero.reviews')}
          </span>
          <span>•</span>
          <span>{t(lang, 'hero.delivery')}</span>
          <span>•</span>
          <span>{t(lang, 'hero.minOrder')}</span>
        </div>
      </div>

      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <FoodPlaceholder label="HIRAYA BOWL — hero photo" shape="circle" size={460} cornerNote="HERO" />
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
      </div>
    </div>
  </section>
);

const FusionStory = ({ lang }) => (
  <section style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
    <Inabel height={26} variant="slim" seed={801} />
    <div style={{ padding: '110px 56px', textAlign: 'center' }}>
      <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'fs.eyebrow')}</div>
      <Rich
        as="div"
        html={t(lang, 'fs.title.html')}
        color="var(--saffron)"
        style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(36px, 6vw, 88px)', lineHeight: 0.95, marginTop: 14, maxWidth: 1080, marginLeft: 'auto', marginRight: 'auto' }}
      />
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
      <Rich
        as="div"
        html={t(lang, 'fs.closing.html')}
        color="var(--saffron)"
        style={{ marginTop: 64, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto', fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 28, lineHeight: 1.35, color: 'var(--saffron)' }}
      />
    </div>
    <Inabel height={26} variant="slim" seed={802} />
  </section>
);

const MenuCard = ({ item, lang }) => {
  const desc = ITEM_I18N[item.id] && ITEM_I18N[item.id][lang];
  return (
    <article style={{
      display: 'grid', gridTemplateColumns: '180px 1fr', gap: 20,
      background: 'var(--linen)', borderRadius: 14, padding: 16,
      border: '1px solid rgba(26,20,16,0.06)',
    }}>
      <FoodPlaceholder label={item.name} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: 30, lineHeight: 1, margin: 0, color: 'var(--ink)' }}>
            {item.name}
          </h3>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 16, color: 'var(--clay)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            CHF {item.price.toFixed(2)}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--f-sans)', fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
          {item.ingredients}
        </div>
        {desc && (
          <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-mute)', lineHeight: 1.4, marginTop: 2 }}>
            {desc}
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto', paddingTop: 6 }}>
            {item.tags.map(tag => <TagChip key={tag} tag={tag} lang={lang} small />)}
          </div>
        )}
      </div>
    </article>
  );
};

const Menu = ({ lang }) => {
  const [active, setActive] = useState('poke');
  const catData = MENU[active];
  const catMeta = MENU_I18N[active];
  return (
    <section id="menu" style={{ background: 'var(--paper)', padding: '90px 56px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 24 }}>
        <div>
          <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'menu.eyebrow')}</div>
          <Rich as="div" html={t(lang, 'menu.title.html')}
                style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 0.92, marginTop: 6 }} />
        </div>
        <div className="mono" style={{ color: 'var(--ink-mute)', maxWidth: 360, textAlign: 'right', lineHeight: 1.7 }}>
          {t(lang, 'menu.browseInst')}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, padding: 6, background: 'var(--bone)', borderRadius: 999, flexWrap: 'wrap', width: 'fit-content' }}>
        {Object.entries(MENU).map(([k]) => (
          <button key={k} onClick={() => setActive(k)}
                  style={{
                    padding: '12px 22px', border: 'none', borderRadius: 999, cursor: 'pointer',
                    fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 600,
                    background: active === k ? 'var(--ink)' : 'transparent',
                    color: active === k ? 'var(--paper)' : 'var(--ink-soft)',
                  }}>{MENU_I18N[k].label[lang]}</button>
        ))}
      </div>

      <div style={{
        marginTop: 28, padding: '24px 28px',
        background: 'var(--linen)', borderRadius: 12,
        borderLeft: '4px solid var(--clay)',
        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 32, lineHeight: 1.1, color: 'var(--ink)' }}>
            {catMeta.label[lang]}
          </div>
          <div style={{ fontFamily: 'var(--f-sans)', fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.55, marginTop: 10 }}>
            {catMeta.intro[lang]}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <span className="mono" style={{ color: 'var(--ink-mute)', textAlign: 'right' }}>
            {catData.items.length} {t(lang, 'menu.itemsLabel')} · {catMeta.sub[lang]}
          </span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <TagChip tag="bestseller" lang={lang} small />
            <TagChip tag="spicy" lang={lang} small />
            <TagChip tag="veg" lang={lang} small />
            <TagChip tag="vegan" lang={lang} small />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 18, marginTop: 24 }}>
        {catData.items.map(item => <MenuCard key={item.id} item={item} lang={lang} />)}
      </div>

      <div style={{
        marginTop: 36, padding: '28px 36px',
        background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap',
      }}>
        <div>
          <div className="mono" style={{ color: 'var(--ember)' }}>{t(lang, 'menu.cta.eyebrow')}</div>
          <Rich as="div" html={t(lang, 'menu.cta.title.html')}
                color="var(--ember)"
                style={{ fontFamily: 'var(--f-display)', fontSize: 36, lineHeight: 1.05, marginTop: 4 }} />
          <div style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'rgba(244,234,214,0.7)', marginTop: 6 }}>
            {t(lang, 'menu.cta.body')}
          </div>
        </div>
        <JustEatLink size="lg" lang={lang} />
      </div>
    </section>
  );
};

const HowToOrder = ({ lang }) => (
  <section style={{ background: 'var(--paper-soft)', padding: '90px 56px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: 56, alignItems: 'start' }}>
      <div>
        <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'how.eyebrow')}</div>
        <Rich as="div" html={t(lang, 'how.title.html')}
              style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.95, marginTop: 8 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {['s1', 's2', 's3'].map((s, i) => (
          <div key={s} style={{
            background: 'var(--linen)', borderRadius: 14, padding: '24px 22px',
            display: 'flex', flexDirection: 'column', gap: 10, minHeight: 240,
            border: '1px solid rgba(26,20,16,0.06)',
          }}>
            <span style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 56, color: 'var(--clay)', lineHeight: 1 }}>{'0' + (i + 1)}</span>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 26, lineHeight: 1.1, color: 'var(--ink)' }}>{t(lang, 'how.' + s + '.title')}</div>
            <div style={{ fontFamily: 'var(--f-sans)', fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{t(lang, 'how.' + s + '.body')}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const Featured = ({ lang }) => (
  <section style={{ background: 'var(--clay)', color: 'var(--linen)' }}>
    <div style={{ padding: '90px 56px', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, alignItems: 'center' }}>
      <div>
        <div className="mono" style={{ opacity: 0.85 }}>{t(lang, 'feature.eyebrow')}</div>
        <Rich as="div" html={t(lang, 'feature.title.html')}
              color="var(--linen)"
              style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 7vw, 104px)', lineHeight: 0.9, marginTop: 8 }} />
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 19, lineHeight: 1.55, marginTop: 18, maxWidth: 520, opacity: 0.92 }}>
          {t(lang, 'feature.body')}
        </p>
        <div style={{ marginTop: 28, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 64 }}>CHF 22.50</span>
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
        <div style={{ width: 440, maxWidth: '100%' }}>
          <FoodPlaceholder label="HIRAYA BOWL — feature photo" shape="circle" cornerNote="FEATURED" />
        </div>
        <div style={{
          position: 'absolute', top: 8, right: 24, transform: 'rotate(8deg)',
          background: 'var(--saffron)', color: 'var(--ink)', padding: '8px 14px',
          borderRadius: 999, fontFamily: 'var(--f-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
        }}>
          {t(lang, 'feature.badge')}
        </div>
      </div>
    </div>
  </section>
);

const LocationBlock = ({ lang }) => (
  <section id="find" style={{ background: 'var(--paper-soft)', padding: '100px 56px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, gap: 24, flexWrap: 'wrap' }}>
      <div>
        <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'loc.eyebrow')}</div>
        <Rich as="div" html={t(lang, 'loc.title.html')}
              style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 0.95, marginTop: 4 }} />
      </div>
      <div className="mono" style={{ color: 'var(--ink-mute)', maxWidth: 360, textAlign: 'right', lineHeight: 1.7 }}>
        {t(lang, 'loc.hint')}
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
      <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 300, background: 'var(--teal-deep)', position: 'relative', overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="none">
            <path d="M0 130 L800 150" stroke="rgba(244,234,214,0.14)" strokeWidth="22" />
            <path d="M0 220 L800 200" stroke="rgba(244,234,214,0.08)" strokeWidth="14" />
            <path d="M340 0 L380 300" stroke="rgba(244,234,214,0.1)" strokeWidth="18" />
            <path d="M120 0 L140 300" stroke="rgba(244,234,214,0.06)" strokeWidth="10" />
            <path d="M580 0 L600 300" stroke="rgba(244,234,214,0.05)" strokeWidth="8" />
            <path d="M0 260 Q220 232 420 268 T800 248" stroke="#5b6c3a" strokeWidth="7" fill="none" opacity="0.45" />
            <text x="40" y="40" fontSize="11" fill="rgba(244,234,214,0.4)" fontFamily="DM Mono, monospace" letterSpacing="0.12em">{t(lang, 'loc.kicker')}</text>
            <text x="40" y="56" fontSize="9" fill="rgba(244,234,214,0.3)" fontFamily="DM Mono, monospace" letterSpacing="0.12em">47.5440° N · 7.5705° E</text>
            <g transform="translate(360 140)">
              <circle r="44" fill="var(--clay)" opacity="0.18" />
              <circle r="22" fill="var(--clay)" opacity="0.35" />
              <circle r="12" fill="var(--clay)" />
              <circle r="3.5" fill="var(--linen)" />
            </g>
            <text x="380" y="118" fontSize="11" fill="var(--ember)" fontFamily="DM Mono, monospace" letterSpacing="0.12em">PARADIESSTR. 2</text>
          </svg>
        </div>
        <div style={{ padding: '28px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 56, lineHeight: 1 }}>Binningen</div>
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
        <div style={{ padding: '0 32px 28px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
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
      <FoodPlaceholder label="STOREFRONT — Paradiesstrasse 2" ratio="3/4" cornerNote="PHOTO" />
    </div>
  </section>
);

const Catering = ({ lang }) => (
  <section id="catering" style={{ background: 'var(--paper)', padding: '100px 56px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 60, alignItems: 'center' }}>
      <div>
        <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'cat.eyebrow')}</div>
        <Rich as="div" html={t(lang, 'cat.title.html')}
              style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(48px, 6vw, 88px)', lineHeight: 0.95, marginTop: 8 }} />
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 18, lineHeight: 1.55, marginTop: 18, maxWidth: 540, color: 'var(--ink-soft)' }}>
          {t(lang, 'cat.body')}
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
          <a href="mailto:info@hiraya.ch" style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '16px 22px', borderRadius: 999, fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            {t(lang, 'cta.request')} →
          </a>
          <a href="#menu" style={{ background: 'transparent', color: 'var(--ink)', padding: '16px 22px', borderRadius: 999, fontFamily: 'var(--f-sans)', fontSize: 14, fontWeight: 600, border: '1.5px solid var(--ink)', textDecoration: 'none' }}>
            {t(lang, 'cta.examples')}
          </a>
        </div>
      </div>
      <div style={{ position: 'relative', background: 'var(--bone)', borderRadius: 18, padding: 36, overflow: 'hidden' }}>
        <Inabel height={20} variant="slim" seed={901} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
        <div style={{ paddingTop: 30 }}>
          <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'cat.packages')}</div>
          <div style={{ fontFamily: 'var(--f-display)', fontSize: 96, lineHeight: 1, color: 'var(--ink)' }}>
            CHF 28<span style={{ fontSize: 28, color: 'var(--ink-mute)' }}>{t(lang, 'cat.perPerson')}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, marginTop: 28 }}>
            {['row1', 'row2', 'row3'].map((row, i) => (
              <div key={row} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(26,20,16,0.12)' : 'none', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--f-sans)', fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{t(lang, 'cat.' + row + '.name')}</div>
                  <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 2 }}>{t(lang, 'cat.' + row + '.sub')}</div>
                </div>
                <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, color: 'var(--clay)', whiteSpace: 'nowrap' }}>{t(lang, 'cat.' + row + '.price')}</span>
              </div>
            ))}
          </div>
        </div>
        <Inabel height={20} variant="slim" seed={902} style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }} />
      </div>
    </div>
  </section>
);

const Story = ({ lang }) => (
  <section id="about" style={{ background: 'var(--paper-soft)', padding: '100px 56px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.4fr', gap: 80, alignItems: 'center' }}>
      <div>
        <div className="mono" style={{ color: 'var(--clay)' }}>{t(lang, 'story.eyebrow')}</div>
        <div style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.98, marginTop: 14 }}>
          {t(lang, 'story.title.l1')}<br/>
          <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{t(lang, 'story.title.l2')}</span><br/>
          {t(lang, 'story.title.l3')}
        </div>
        <div style={{ marginTop: 28, width: 280 }}>
          <FoodPlaceholder label="GERWIN — chef portrait" ratio="3/4" cornerNote="PHOTO" />
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'var(--f-sans)', fontSize: 19, lineHeight: 1.6, color: 'var(--ink-soft)', margin: 0 }}>
          {t(lang, 'story.body')}
        </p>
        <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 30, color: 'var(--clay)', marginTop: 24, lineHeight: 1.25, marginBottom: 8 }}>
          {t(lang, 'story.quote')}
        </p>
        {t(lang, 'story.quoteGloss') && (
          <p className="mono" style={{ color: 'var(--ink-mute)', margin: 0 }}>
            {t(lang, 'story.quoteGloss')}
          </p>
        )}
        <div style={{ display: 'flex', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: 1, color: 'var(--ink)' }}>2024</div>
            <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 4 }}>{t(lang, 'story.stat.founded')}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: 1, color: 'var(--clay)' }}>4.9★</div>
            <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 4 }}>{t(lang, 'story.stat.rating')}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 56, lineHeight: 1, color: 'var(--ink)' }}>25<span style={{ fontSize: 28 }}>min</span></div>
            <div className="mono" style={{ color: 'var(--ink-mute)', marginTop: 4 }}>{t(lang, 'story.stat.delivery')}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ lang }) => (
  <footer style={{ background: 'var(--ink)', color: 'var(--paper)' }}>
    <Inabel height={32} variant="full" seed={951} />
    <div style={{ padding: '60px 56px 30px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <DualGlyph size={48} color="var(--ember)" />
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: 44, lineHeight: 1 }}>
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
      padding: '24px 56px', textAlign: 'center',
      borderTop: '1px solid rgba(244,234,214,0.1)',
      fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: 22,
      color: 'var(--ember)', letterSpacing: '0.01em',
    }}>
      {t(lang, 'footer.thanksAll')}
    </div>
    <div style={{ padding: '16px 56px 28px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(244,234,214,0.06)', color: 'rgba(244,234,214,0.45)', flexWrap: 'wrap', gap: 12 }}>
      <span className="mono">{t(lang, 'footer.copy')}</span>
      <span className="mono">{LANG_LIST.map(l => l.greeting).join(' · ')}</span>
    </div>
  </footer>
);

export const Website = () => {
  const [lang, setLang] = useLang();
  return (
    <div style={{ width: '100%', background: 'var(--paper)', fontFamily: 'var(--f-sans)', color: 'var(--ink)' }}>
      <Nav lang={lang} onLang={setLang} />
      <Hero lang={lang} />
      <FusionStory lang={lang} />
      <Menu lang={lang} />
      <HowToOrder lang={lang} />
      <Featured lang={lang} />
      <LocationBlock lang={lang} />
      <Catering lang={lang} />
      <Story lang={lang} />
      <Footer lang={lang} />
    </div>
  );
};
