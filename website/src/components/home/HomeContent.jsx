import React, { useState, useEffect, useRef } from 'react';
import {
  motion, AnimatePresence, useScroll, useSpring, useTransform, useMotionValueEvent,
} from 'framer-motion';
import { heroVariant } from '../../data/site';

/* ---------- shared easing / variants ---------- */
const EASE = [0.16, 1, 0.3, 1];
const fadeUp = { hidden: { opacity: 0, y: 42 }, show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };
const inView = { initial: 'hidden', whileInView: 'show', viewport: { once: true, margin: '-8% 0px' } };

function Reveal({ as = 'div', children, y = 42, delay = 0, ...rest }) {
  const C = motion[as] || motion.div;
  return (
    <C initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.85, ease: EASE, delay }} {...rest}>
      {children}
    </C>
  );
}

function TwoTone({ lead, tail, as = 'h2', className = '', ...rest }) {
  const C = motion[as] || motion.h2;
  return (
    <C className={`tt ${className}`} {...rest}>
      {lead} <span className="mute">{tail}</span>
    </C>
  );
}

function Btn({ href = '#', variant = 'dark', icon = true, children, ...rest }) {
  return (
    <motion.a href={href} className={`btn btn-${variant}`}
      initial="rest" animate="rest" whileHover="hover" whileTap={{ scale: 0.96 }}
      variants={{ rest: { y: 0 }, hover: { y: -3 } }}
      transition={{ duration: 0.3, ease: EASE }} {...rest}>
      <span>{children}</span>
      {icon && (
        <motion.span className="ico"
          variants={{ rest: { rotate: 0 }, hover: { rotate: 45 } }}
          transition={{ duration: 0.35, ease: EASE }}>→</motion.span>
      )}
    </motion.a>
  );
}

function RevealImage({ src, alt, ratio }) {
  return (
    <motion.div className="media" variants={fadeUp} style={ratio ? { aspectRatio: ratio } : undefined}>
      <motion.img src={src} alt={alt} loading="lazy" decoding="async"
        initial={{ scale: 1.18 }} whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 1.1, ease: EASE }} />
    </motion.div>
  );
}

function Word({ children, range, progress }) {
  const color = useTransform(progress, range, ['#9CA2A1', '#111312']);
  return <motion.span style={{ color }}>{children} </motion.span>;
}
function WordReveal({ text, className, style }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.32'] });
  const words = text.split(' ');
  return (
    <p ref={ref} className={className} style={style}>
      {words.map((w, i) => {
        const start = i / words.length, end = (i + 0.6) / words.length;
        return <Word key={i} range={[start, end]} progress={scrollYProgress}>{w}</Word>;
      })}
    </p>
  );
}

/* ============================ HERO ============================ */
const FRAME_COUNT = 193;
function Hero({ variant = 'v1' }) {
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const st = useRef({ frames: [], ctx: null, W: 0, H: 0, first: false });
  const [progress, setProgress] = useState(0);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  const hintOpacity = useTransform(smooth, [0, 0.05], [1, 0]);
  const copyOpacity = useTransform(smooth, [0, 0.12], [1, 0]);
  const copyY = useTransform(smooth, [0, 0.12], [0, -60]);
  const dimOpacity = useTransform(smooth, [0.5, 0.72], [0, 0.5]);
  const markOpacity = useTransform(smooth, [0.56, 0.74, 0.97, 1], [0, 1, 1, 1]);
  const markScale = useTransform(smooth, [0.56, 0.8], [1.16, 1]);
  const labelOpacity = useTransform(smooth, [0.68, 0.8], [0, 1]);

  function draw(p) {
    const { frames, ctx, W, H, first } = st.current;
    if (!first || !ctx) return;
    const idx = Math.min(frames.length - 1, Math.floor(p * (frames.length - 1)));
    const img = frames[idx];
    if (!img || !img.complete || !img.naturalWidth) return;
    ctx.clearRect(0, 0, W, H);
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }
  useMotionValueEvent(smooth, 'change', draw);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    st.current.ctx = ctx;
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const W = canvas.clientWidth, H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      st.current.W = W; st.current.H = H;
      draw(smooth.get());
    };
    const isMobile = innerWidth < 768;
    const step = isMobile ? 3 : 1;
    const dir = isMobile ? '/frames-mobile' : '/frames';
    const eff = isMobile ? Math.ceil(FRAME_COUNT / step) : FRAME_COUNT;
    let loaded = 0;
    const frames = [];
    for (let i = 1; i <= FRAME_COUNT; i += step) {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        loaded++;
        if (i === 1) { st.current.first = true; draw(0); }
        setProgress(Math.round(loaded / eff * 100));
      };
      img.src = `${dir}/build_${String(i).padStart(4, '0')}.webp`;
      frames.push(img);
    }
    st.current.frames = frames;
    resize();
    addEventListener('resize', resize);
    return () => removeEventListener('resize', resize);
  }, []);

  const lines = ['WIR BAUEN, WAS BESTAND HAT.'];
  return (
    <section className={`hero${variant === 'v2' ? ' hero--v2' : ''}`} ref={heroRef} id="hero">
      <div className="hero-stage">
        <canvas id="buildCanvas" ref={canvasRef}></canvas>
        <div className="hero-grad"></div>
        <motion.div className="hero-dim" style={{ opacity: dimOpacity }}></motion.div>

        <motion.div className="hero-loader"
          animate={{ width: progress + '%', opacity: progress >= 100 ? 0 : 1 }}
          transition={{ width: { duration: 0.3 }, opacity: { duration: 0.6, delay: 0.4 } }} />

        <motion.div className="hero-mark" style={{ opacity: markOpacity }}>
          <motion.span style={{ scale: markScale }}>VONHOEGEN</motion.span>
          <motion.span className="label" style={{ opacity: labelOpacity }}>Bauunternehmung · seit 1987</motion.span>
        </motion.div>

        <motion.div className="scroll-hint" style={{ opacity: hintOpacity }}>
          <span>Scrollen</span>
          <motion.span className="bar"
            animate={{ scaleY: [0, 1, 1, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, times: [0, 0.5, 0.51, 1], ease: 'easeInOut' }} />
        </motion.div>
      </div>

      <motion.div className="hero-copy" style={{ opacity: copyOpacity, y: copyY }}>
        <div className="inner">
          <motion.span className="hero-kicker" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
            Bauunternehmung · Würselen, seit 1987
          </motion.span>
          <motion.h1 initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}>
            {lines.map((ln, i) => (
              <motion.span key={i} style={{ display: 'block' }}
                variants={{ hidden: { opacity: 0, y: 46 }, show: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.9, ease: EASE }}>{ln}</motion.span>
            ))}
          </motion.h1>
          <motion.p className="sub" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}>
            <b>Industriebau. Pharmabau. Brandschutz.</b> <span className="muted">Bauen mit System aus Würselen.</span>
          </motion.p>
          <motion.div className="cta-row" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}>
            <Btn href="/kontakt" variant="light">Projekt anfragen</Btn>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================ LEISTUNGEN ============================ */
const SERVICES = [
  { n: '01', t: 'Industriebau', href: '/leistungen/industriebau', img: '/img/industriebau.webp', d: 'Produktions-, Logistik- und Gewerbehallen — schlüsselfertig, statisch durchdacht und auf Ihren Betriebsablauf zugeschnitten.' },
  { n: '02', t: 'Pharmabau', href: '/leistungen/pharmabau', img: '/img/pharma-reinraum.webp', d: 'Bauen unter Reinraumbedingungen — GMP- und FDA-konform, validierbar und revisionssicher dokumentiert.' },
  { n: '03', t: 'Brandschutz', href: '/leistungen/brandschutz', img: '/img/brandschutz-hero.webp', d: 'Brandschutzkonzepte, Schottungen und Ertüchtigungen nach aktueller Norm — geprüft und abgenommen.' },
  { n: '04', t: 'Sanierung', href: '/leistungen/sanierung', img: '/img/sanierung-hero.webp', d: 'Fachgerechter Rückbau nach TRGS 519 und energetische Revitalisierung — sicher für Mensch, Umwelt und Betrieb.' },
  { n: '05', t: 'Privatbau', href: '/leistungen/privatbau', img: '/img/privatbau-efh.webp', d: 'Vom Eigenheim bis zum Umbau im Bestand — Ein- und Mehrfamilienhäuser, Hochbau und Sanierung mit der gleichen Qualität wie im Industriebau.' },
];
function Services() {
  return (
    <section className="section dark" id="leistungen">
      <div className="wrap">
        <Reveal className="section-head">
          <span className="eyebrow on-dark">Leistungen</span>
          <h2 className="tt" style={{ marginTop: '1.4rem' }}>Was wir<br /><span className="mute">für Sie bauen.</span></h2>
        </Reveal>
        <div className="svc-list">
          {SERVICES.map((s) => (
            <Reveal as="a" href={s.href} className="svc-row" key={s.n}>
              <span className="num">{s.n}</span>
              <div className="thumb"><img src={s.img} alt={s.t} loading="lazy" decoding="async" /></div>
              <div className="ttl">{s.t}</div>
              <p className="desc">{s.d}</p>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 'clamp(40px,5vw,64px)' }}>
          <Btn href="/kontakt" variant="light">Anfrage starten</Btn>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ TESTIMONIALS ============================ */
const TESTI = [
  { q: 'Vonhoegen hat unsere Halle termingenau und ohne eine einzige böse Überraschung übergeben. Ein fester Ansprechpartner, der wirklich zuhört — so stellt man sich Bauen vor.', who: 'M. Brandt', role: 'Geschäftsführer, Logistik', img: '/img/projekt-halle.webp' },
  { q: 'Der Reinraum wurde im laufenden Betrieb erweitert, sauber dokumentiert und GMP-konform übergeben. Wir wurden in jeder Phase mitgenommen.', who: 'Dr. S. Keller', role: 'Werkleitung, Pharma', img: '/img/projekt-pharma.webp' },
  { q: 'Ehrlicher Festpreis, verbindlicher Terminplan, eigene Fachkräfte. Was zugesagt wurde, wurde gehalten. Würden wir jederzeit wieder beauftragen.', who: 'T. Möller', role: 'Bauherr, Gewerbebau', img: '/img/projekt-halle.webp' },
  { q: 'Die Sanierung nach TRGS 519 lief absolut sicher und reibungslos — für unsere Mitarbeiter und den weiteren Betrieb. Volle Empfehlung.', who: 'A. Wegener', role: 'Facility Management', img: '/img/projekt-sanierung.webp' },
];
function Testimonials() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTI.length), 6000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="section grey" id="stimmen">
      <div className="wrap">
        <Reveal className="section-head" style={{ marginBottom: 'clamp(40px,5vw,68px)' }}>
          <span className="eyebrow">Was Bauherren sagen</span>
          <TwoTone as="h2" lead="Verlassen Sie sich nicht" tail="auf unser Wort." style={{ marginTop: '1.4rem' }} />
        </Reveal>
        <Reveal className="testi-grid">
          <div className="testi-media">
            <AnimatePresence mode="wait">
              <motion.img key={idx} src={TESTI[idx].img} alt="" loading="lazy"
                initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: EASE }} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </AnimatePresence>
          </div>
          <div className="testi-body">
            <div className="stars">★★★★★</div>
            <div className="quote">
              <AnimatePresence mode="wait">
                <motion.p key={idx}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.5, ease: EASE }}>„{TESTI[idx].q}"</motion.p>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.div className="who" key={idx}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <b>{TESTI[idx].who}</b> — {TESTI[idx].role}
              </motion.div>
            </AnimatePresence>
            <div className="testi-foot">
              <div className="dots">
                {TESTI.map((_, i) => (
                  <motion.button key={i} className={i === idx ? 'active' : ''} onClick={() => setIdx(i)}
                    animate={{ scale: i === idx ? 1.3 : 1 }} transition={{ duration: 0.3 }} aria-label={`Stimme ${i + 1}`} />
                ))}
              </div>
              <span className="count">{String(idx + 1).padStart(2, '0')} / {String(TESTI.length).padStart(2, '0')}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================ FAQ ============================ */
const FAQS = [
  ['Übernehmen Sie auch Projekte im laufenden Betrieb?', 'Ja. Gerade im Industrie- und Pharmaumfeld planen wir Bauabschnitte so, dass Ihr Betrieb weiterläuft — mit klaren Sicherheits- und Abschottungskonzepten.'],
  ['Wie verbindlich sind Ihre Termine und Preise?', 'Sie erhalten eine klare Leistungsbeschreibung mit Festpreis und verbindlichem Terminplan. Was wir zusagen, halten wir — oder sprechen frühzeitig darüber.'],
  ['Sind Sie für Asbestsanierung zertifiziert?', 'Ja, Sanierungen führen wir fachgerecht nach TRGS 519 durch — sicher für Ihre Mitarbeiter, die Umgebung und den weiteren Betrieb.'],
  ['In welcher Region sind Sie tätig?', 'Schwerpunkt ist die Region Aachen / Städteregion und das angrenzende Rheinland (Düsseldorf, Köln). Für größere Projekte sind wir überregional im Einsatz.'],
];
function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <motion.div className={`faq-item${isOpen ? ' is-open' : ''}`} variants={fadeUp}>
      <button className="faq-q" onClick={onToggle}>
        <span className="faq-num" aria-hidden="true"></span>
        <span className="faq-qt">{q}</span>
        <span className="pm" aria-hidden="true"></span>
      </button>
      <div className="faq-a"><div className="faq-a-inner"><p>{a}</p></div></div>
    </motion.div>
  );
}

function FaqList({ items }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <motion.div className="faq" style={{ marginTop: 'clamp(40px,5vw,64px)' }} variants={stagger} {...inView}>
      {items.map(([q, a], i) => (
        <FaqItem key={q} q={q} a={a} isOpen={openIdx === i}
          onToggle={() => setOpenIdx((cur) => (cur === i ? null : i))} />
      ))}
    </motion.div>
  );
}

/* ============================ CONTACT FORM ============================ */
function ContactForm() {
  const [sent, setSent] = useState(false);
  return (
    <AnimatePresence mode="wait">
      {!sent ? (
        <motion.form key="form" className="form" onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-8%' }}
          exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.6, ease: EASE }}>
          <div className="field"><label>Name<span className="req">*</span></label><input type="text" name="name" placeholder="Ihr Name" required /></div>
          <div className="row2">
            <div className="field"><label>E-Mail-Adresse<span className="req">*</span></label><input type="email" name="email" placeholder="ihre@email.de" required /></div>
            <div className="field"><label>Telefonnummer</label><input type="tel" name="phone" placeholder="Für schnelle Rückfragen" /></div>
          </div>
          <div className="field"><label>Betreff / Anliegen</label>
            <select name="subject" defaultValue="Allgemeine Anfrage">
              <option>Allgemeine Anfrage</option>
              <option>Neubau</option>
              <option>Umbau / Sanierung</option>
              <option>Reparatur / Kleinauftrag</option>
              <option>Beratung gewünscht</option>
              <option>Sonstiges</option>
            </select>
          </div>
          <div className="field"><label>Nachricht<span className="req">*</span></label><textarea name="message" rows="4" placeholder="Beschreiben Sie kurz Ihr Anliegen oder Bauvorhaben. Wir melden uns zeitnah bei Ihnen zurück." required></textarea></div>
          <label className="checkbox">
            <input type="checkbox" name="privacy" required />
            <span className="box" aria-hidden="true"></span>
            <span className="ck-text">Ich habe die <a href="/datenschutz">Datenschutzerklärung</a> gelesen und stimme zu, dass meine Angaben zur Kontaktaufnahme verarbeitet werden.<span className="req">*</span></span>
          </label>
          <Btn href="#" variant="light" onClick={(e) => { e.preventDefault(); setSent(true); }}>Anfrage senden</Btn>
        </motion.form>
      ) : (
        <motion.div key="ok" className="form-success"
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
          <motion.div className="big" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.1 }}>✓</motion.div>
          <h3 style={{ color: '#fff' }}>Vielen Dank für Ihre Anfrage — wir melden uns umgehend.</h3>
          <p style={{ color: 'rgba(255,255,255,.7)', marginTop: '.6rem' }}>Ihre Anfrage ist eingegangen. Sie hören innerhalb von 48 Stunden von uns.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================ HOME CONTENT ============================ */
export default function HomeContent() {
  return (
    <>
      <Hero variant={heroVariant} />

      {/* WARUM */}
      <section className="section" id="warum">
        <div className="wrap">
          <Reveal as="span" className="eyebrow" style={{ display: 'inline-flex' }}>Warum Vonhoegen</Reveal>
          <WordReveal className="statement" style={{ marginTop: '1.6rem' }}
            text="Ihr Vorhaben ist mehr als ein Bauauftrag. Wir bringen es voran — mit klarer Planung, ehrlichem Festpreis und einem festen Ansprechpartner, der bis zur Schlüsselübergabe an Ihrer Seite bleibt." />
        </div>
      </section>

      {/* ES GEHT UM MEHR */}
      <section className="section grey">
        <div className="wrap">
          <div className="chev-statement">
            <TwoTone as="h2" lead="Es geht um mehr" tail="als Stein auf Stein." {...inView} variants={fadeUp} />
          </div>
          <motion.div className="chevrons" variants={stagger} {...inView}>
            {[
              ['/img/industriebau.webp', 'Industriebau'],
              ['/img/pharma.webp', 'Pharmabau'],
              ['/img/rohbau.webp', 'Rohbau'],
              ['/img/projekt-halle.webp', 'Übergabe'],
            ].map(([src, alt]) => (
              <motion.div className="chev" key={alt}
                variants={{ hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE } } }}>
                <motion.img src={src} alt={alt} loading="lazy"
                  initial={{ scale: 1.2 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: EASE }} />
              </motion.div>
            ))}
          </motion.div>
          <Reveal as="p" className="chev-lead">
            Es geht um <b>Verlässlichkeit. Substanz. Vertrauen.</b> Sie suchen nicht nur ein Gebäude — Sie suchen einen Partner, der hält, was er verspricht. Genau dafür stehen wir.
          </Reveal>
        </div>
      </section>

      {/* ABLAUF */}
      <section className="section" id="ablauf">
        <div className="wrap">
          <div className="process">
            <div>
              <Reveal as="span" className="eyebrow" style={{ display: 'inline-flex' }}>Ablauf</Reveal>
              <TwoTone as="h2" lead="Bauen," tail="neu gedacht." style={{ marginTop: '1.4rem' }} {...inView} variants={fadeUp} />
              <motion.div className="steps" style={{ marginTop: 'clamp(28px,3vw,44px)' }} variants={stagger} {...inView}>
                {[
                  ['01', 'Zuhören & Aufmaß', 'Wir hören zu, schauen uns die Lage vor Ort an und verstehen, worauf es Ihnen wirklich ankommt — nicht nur, was machbar ist.'],
                  ['02', 'Klarheit & Festpreis', 'Klare Leistungsbeschreibung, ehrlicher Festpreis, verbindlicher Terminplan. Wir definieren, was Sie wirklich brauchen — kein Blindflug.'],
                  ['03', 'Umsetzen & Übergeben', 'Eigene Fachkräfte, ein fester Ansprechpartner, lückenlose Dokumentation. Wir bauen, was passt — und übergeben schlüsselfertig.'],
                ].map(([n, h, p]) => (
                  <motion.div className="step" key={n} variants={fadeUp}>
                    <div className="no">{n}</div>
                    <div><h3>{h}</h3><p>{p}</p></div>
                  </motion.div>
                ))}
              </motion.div>
              <Reveal style={{ display: 'flex', gap: '.8rem', marginTop: '2.4rem', flexWrap: 'wrap' }}>
                <Btn href="/kontakt" variant="dark">Projekt starten</Btn>
                <Btn href="/leistungen" variant="light" icon={false}>Für Bauherren</Btn>
              </Reveal>
            </div>
            <RevealImage src="/img/projekt-pharma.webp" alt="Vonhoegen Bauprojekt" ratio="4/5" />
          </div>
        </div>
      </section>

      {/* ÜBER UNS */}
      <section className="section grey" id="ueber">
        <div className="wrap">
          <div className="feature">
            <RevealImage src="/img/team.webp" alt="Thomas Vonhoegen" ratio="4/5" />
            <Reveal>
              <span className="eyebrow">Über uns</span>
              <blockquote>„Ein Bau ist erst dann gut, wenn er auch in zwanzig Jahren noch hält, was wir versprochen haben."</blockquote>
              <p>Gegründet von Thomas Vonhoegen, steht das Unternehmen für eine Bauweise, die nicht am nächsten Quartal, sondern an Jahrzehnten gemessen wird. Mit eigenem Stamm an Fachkräften, kurzen Wegen und einem festen Ansprechpartner pro Projekt — kein Verstecken hinter anonymen Subunternehmern.</p>
              <div className="signoff">
                <img className="av" src="/img/team.webp" alt="Thomas Vonhoegen" loading="lazy" decoding="async" />
                <div><div className="nm">Thomas Vonhoegen</div><div className="ro">Gründer & Geschäftsführer</div></div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Testimonials />
      <Services />

      {/* SUPPORT CARDS */}
      <section className="section">
        <div className="wrap">
          <Reveal className="section-head">
            <span className="eyebrow">Mehr als nur Bauen</span>
            <TwoTone as="h2" lead="Begleitung über" tail="die Übergabe hinaus." style={{ marginTop: '1.4rem' }} />
            <p>Ein Projekt endet nicht mit der Schlüsselübergabe — und wir auch nicht. Wir begleiten Sie weiter, damit Ihre Investition langfristig Wert behält.</p>
          </Reveal>
          <motion.div className="cards3" variants={stagger} {...inView}>
            {[
              ['/img/projekt-halle.webp', 'Generalplanung', 'Von der ersten Skizze bis zur Ausführungsplanung — alles aus einer Hand, abgestimmt und verbindlich.'],
              ['/img/umbau.webp', 'Projektsteuerung', 'Ein fester Ansprechpartner koordiniert Gewerke, Termine und Budget — Sie behalten den Überblick.'],
              ['/img/projekt-sanierung.webp', 'Wartung & Service', 'Auch nach der Übergabe sind wir da — für Instandhaltung, Erweiterung und Anpassung an neue Anforderungen.'],
            ].map(([img, h, p]) => (
              <motion.article className="scard" key={h} variants={fadeUp}
                whileHover={{ y: -6, boxShadow: '0 30px 60px -28px rgba(0,0,0,.2)' }} transition={{ duration: 0.4, ease: EASE }}>
                <div className="media"><motion.img src={img} alt={h} loading="lazy" decoding="async"
                  whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: EASE }} /></div>
                <div className="body"><h3>{h}</h3><p>{p}</p><span className="more">Mehr erfahren <span className="arr">→</span></span></div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* REFERENZEN */}
      <section className="section grey" id="referenzen">
        <div className="wrap">
          <Reveal className="ref-head">
            <div className="section-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">Referenzen</span>
              <TwoTone as="h2" lead="Gebaut, übergeben," tail="bewährt." style={{ marginTop: '1.4rem' }} />
            </div>
            <Btn href="/referenzen" variant="dark">Alle Projekte</Btn>
          </Reveal>
          <motion.div className="refs" variants={stagger} {...inView}>
            {[
              ['/img/projekt-halle.webp', '2025 · Industriebau', 'Produktionshalle Eschweiler', '4.200 m² schlüsselfertige Produktions- und Logistikfläche — terminsicher übergeben.'],
              ['/img/projekt-pharma.webp', '2024 · Pharmabau', 'Reinraum-Erweiterung Aachen', 'GMP-C-Erweiterung im laufenden Betrieb — validierbar geplant und sauber dokumentiert.'],
              ['/img/projekt-sanierung.webp', '2024 · Sanierung', 'Schadstoffsanierung Stolberg', 'Rückbau und Sanierung nach TRGS 519 — sicher abgenommen und freigegeben.'],
            ].map(([img, d, h, p]) => (
              <motion.article className="ref" key={h} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.4, ease: EASE }}>
                <div className="media"><motion.img src={img} alt={h} loading="lazy" decoding="async"
                  whileHover={{ scale: 1.05 }} transition={{ duration: 0.6, ease: EASE }} /></div>
                <div className="date">{d}</div><h3>{h}</h3><p>{p}</p>
                <span className="more">Projekt ansehen <span className="arr">→</span></span>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <div className="wrap">
          <Reveal className="section-head" style={{ marginInline: 'auto', textAlign: 'center' }}>
            <TwoTone as="h2" lead="Häufige" tail="Fragen." />
          </Reveal>
          <FaqList items={FAQS} />
        </div>
      </section>

      {/* CTA + KONTAKT */}
      <section className="cta" id="kontakt">
        <div className="bg"><img src="/img/projekt-halle.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" /></div>
        <div className="wrap">
          <div className="grid">
            <Reveal>
              <span className="eyebrow on-dark">Kontakt</span>
              <h2 style={{ marginTop: '1.2rem' }}>Lassen Sie uns<br /><em>Ihr Projekt</em><br />besprechen.</h2>
              <p className="lead">Erzählen Sie uns kurz, was Sie vorhaben. Sie erhalten innerhalb von 48 Stunden eine ehrliche Ersteinschätzung — unverbindlich.</p>
              <div className="trust">
                <div><span className="ck">✓</span> Fester Ansprechpartner ab dem ersten Gespräch</div>
                <div><span className="ck">✓</span> Festpreis & verbindlicher Terminplan</div>
                <div><span className="ck">✓</span> Eigene Fachkräfte statt anonymer Subunternehmer</div>
              </div>
            </Reveal>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
