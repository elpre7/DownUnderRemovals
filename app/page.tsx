"use client";

import {
  ArrowRight,
  Box,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  House,
  MapPin,
  Menu,
  Navigation,
  PackageCheck,
  Phone,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const MAPS_URL = "https://maps.app.goo.gl/HRFn5AA9g6H8Rga18?g_st=ic";
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1783473007464-1dbf2ff30dec?auto=format&fit=crop&fm=jpg&q=84&w=2200";
const CUSTOMER_IMAGE =
  "https://images.unsplash.com/photo-1758523671087-b256bbbca475?auto=format&fit=crop&fm=jpg&q=82&w=1600";

const services = [
  {
    icon: House,
    number: "01",
    title: "Home removals",
    text: "From apartments to family homes, we plan the move around your access, timing and belongings.",
    accent: "Hobart & surrounds",
  },
  {
    icon: PackageCheck,
    number: "02",
    title: "Furniture delivery",
    text: "A careful point-to-point service for sofas, appliances, marketplace purchases and bulky items.",
    accent: "Single items welcome",
  },
  {
    icon: Route,
    number: "03",
    title: "Regional moves",
    text: "Reliable transport between Hobart and regional Tasmania, with your route agreed in advance.",
    accent: "Tasmania-wide",
  },
];

const reviews = [
  {
    name: "Sarah M.",
    location: "Hobart",
    text: "The team made moving day feel easy. Friendly, careful and right on time.",
  },
  {
    name: "James R.",
    location: "Kingston",
    text: "Clear communication from the quote through to delivery. Everything arrived safely.",
  },
  {
    name: "Emily T.",
    location: "Glenorchy",
    text: "Fast, professional and genuinely helpful. I would happily use them again.",
  },
];

function AnimatedNumber({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now() + 180;
      const duration = 2000;
      const tick = (now: number) => {
        if (now < start) {
          setDisplay(0);
          requestAnimationFrame(tick);
          return;
        }
        const progress = Math.min((now - start) / duration, 1);
        setDisplay(value * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{display.toFixed(decimals)}{suffix}</span>;
}

function QuoteForm() {
  const [step, setStep] = useState(1);
  const [complete, setComplete] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComplete(true);
  }

  if (complete) {
    return (
      <div className="quote-success" role="status">
        <span className="success-icon"><Check size={28} strokeWidth={2.6} /></span>
        <p className="eyebrow eyebrow-dark">Request ready</p>
        <h2>Thanks — we&apos;ll be in touch.</h2>
        <p>This concept form is working as a preview. Connect it to email or a CRM before the site goes live.</p>
        <button className="text-button" onClick={() => { setComplete(false); setStep(1); }}>
          Send another request <ArrowRight size={17} />
        </button>
      </div>
    );
  }

  return (
    <form className="quote-card" onSubmit={handleSubmit}>
      <div className="quote-card-head">
        <div><span className="mini-label">Free & no obligation</span><h2>Tell us about your move</h2></div>
        <div className="step-count" aria-label={`Step ${step} of 2`}><span className={step >= 1 ? "active" : ""}>1</span><i /><span className={step >= 2 ? "active" : ""}>2</span></div>
      </div>

      {step === 1 ? (
        <div className="form-grid">
          <label>Moving from<span className="input-shell"><MapPin size={17} /><input required placeholder="Suburb or postcode" /></span></label>
          <label>Moving to<span className="input-shell"><Navigation size={17} /><input required placeholder="Suburb or postcode" /></span></label>
          <label>Preferred date<span className="input-shell"><CalendarDays size={17} /><input required type="date" /></span></label>
          <label>Size of move<select required defaultValue=""><option value="" disabled>Select an option</option><option>Single item</option><option>1 bedroom</option><option>2 bedrooms</option><option>3 bedrooms</option><option>4+ bedrooms</option></select></label>
          <button className="primary-button wide" type="button" onClick={() => setStep(2)}>Continue <ArrowRight size={18} /></button>
        </div>
      ) : (
        <div className="form-grid">
          <label>Your name<input required placeholder="Full name" /></label>
          <label>Phone number<input required type="tel" placeholder="04XX XXX XXX" /></label>
          <label>Email address<input required type="email" placeholder="you@example.com" /></label>
          <label>Anything we should know?<textarea placeholder="Stairs, heavy items, access…" rows={3} /></label>
          <div className="form-actions"><button className="back-button" type="button" onClick={() => setStep(1)}>Back</button><button className="primary-button" type="submit">Get my free quote <ArrowRight size={18} /></button></div>
        </div>
      )}
      <p className="privacy-note"><ShieldCheck size={15} /> Your details stay private. No spam, ever.</p>
    </form>
  );
}

function GoogleReviewCarousel() {
  const [activeReview, setActiveReview] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(0);

  const moveReview = (direction: number) => {
    setActiveReview((current) => (current + direction + reviews.length) % reviews.length);
  };

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => moveReview(1), 5200);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <aside
      className="review-carousel"
      id="reviews"
      aria-label="Google reviews preview"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(event) => {
        const distance = touchStart.current - event.changedTouches[0].clientX;
        if (Math.abs(distance) > 35) moveReview(distance > 0 ? 1 : -1);
        setPaused(false);
      }}
    >
      <div className="review-carousel-head">
        <div className="google-review-brand">
          <span className="google-logo" aria-hidden="true">G</span>
          <div><strong>Google Reviews</strong><span><b>4.9</b> <i>★★★★★</i> · Verified customers</span></div>
        </div>
        <div className="carousel-controls">
          <button type="button" onClick={() => moveReview(-1)} aria-label="Previous review"><ChevronLeft /></button>
          <button type="button" onClick={() => moveReview(1)} aria-label="Next review"><ChevronRight /></button>
        </div>
      </div>
      <div className="review-viewport">
        <div className="review-track" style={{ transform: `translateX(-${activeReview * 100}%)` }}>
          {reviews.map((review) => (
            <article className="review-slide" key={review.name}>
              <blockquote>“{review.text}”</blockquote>
              <div className="review-author"><span>{review.name.charAt(0)}</span><div><strong>{review.name}</strong><small>{review.location} · Sample review</small></div></div>
            </article>
          ))}
        </div>
      </div>
      <div className="carousel-footer">
        <div className="carousel-dots" aria-label="Select review">{reviews.map((review, index) => <button type="button" key={review.name} className={index === activeReview ? "active" : ""} onClick={() => setActiveReview(index)} aria-label={`Show review ${index + 1}`} />)}</div>
        <span>Sample layout · connect real Google reviews before launch</span>
      </div>
    </aside>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <div className="utility-bar">
        <div className="page-width utility-inner">
          <span><MapPin size={14} /> Hobart-based · Serving Tasmania</span>
          <span className="utility-rating"><Star size={14} fill="currentColor" /> Google reviews will appear here</span>
          <a href="tel:+61455613236"><Phone size={14} /> 0455 613 236</a>
        </div>
      </div>

      <header className="site-header">
        <div className="page-width nav-inner">
          <a className="brand" href="#top" aria-label="DownUnder Removals home"><span className="brand-mark"><Truck size={24} /></span><span><strong>DOWNUNDER</strong><small>REMOVALS</small></span></a>
          <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
            <a href="#services" onClick={() => setMenuOpen(false)}>Services</a><a href="#why-us" onClick={() => setMenuOpen(false)}>Why us</a><a href="#reviews" onClick={() => setMenuOpen(false)}>Reviews</a><a href="#location" onClick={() => setMenuOpen(false)}>Service area</a><a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
          </nav>
          <a className="nav-cta" href="#quote">Get a free quote <ArrowRight size={17} /></a>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-photo" style={{ backgroundImage: `linear-gradient(90deg, rgba(5,21,42,.94) 0%, rgba(5,21,42,.74) 44%, rgba(5,21,42,.08) 78%), url(${HERO_IMAGE})` }} />
        <div className="hero-stripe" aria-hidden="true"><span>MOVE EASY · MOVE LOCAL · MOVE WITH CARE ·</span></div>
        <div className="page-width hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><Sparkles size={15} /> Local removals, done properly</p>
            <h1>Your move.<br /><em>Handled.</em></h1>
            <p className="hero-lead">Careful home removals and reliable deliveries across Tasmania — without the moving-day drama.</p>
            <div className="hero-actions"><a className="primary-button" href="#quote">Get a free quote <ArrowRight size={18} /></a><a className="secondary-button" href="tel:+61455613236"><Phone size={18} /> Call 0455 613 236</a></div>
            <div className="hero-trust"><span><Check /> Free quotes</span><span><Check /> Local Hobart team</span><span><Check /> Careful handling</span></div>
          </div>
          <div className="hero-note"><span className="hero-note-icon"><Clock3 /></span><span><small>Need to move soon?</small><strong>Ask about next availability</strong></span></div>
        </div>
      </section>

      <section className="stats-section" aria-label="Company statistics preview">
        <div className="page-width stats-shell">
          <div className="stats-grid"><div className="stat"><strong><AnimatedNumber value={650} suffix="+" /></strong><span>Moves completed</span></div><div className="stat"><strong><AnimatedNumber value={98} suffix="%" /></strong><span>Happy customers</span></div><div className="stat"><strong><AnimatedNumber value={4.9} suffix="/5" decimals={1} /></strong><span>Google rating</span></div></div>
        </div>
        <p className="page-width demo-disclaimer">Illustrative figures — replace with verified business data before publishing.</p>
      </section>

      <section className="quote-section" id="quote"><div className="page-width conversion-stack"><QuoteForm /><GoogleReviewCarousel /></div></section>

      <section className="section services-section" id="services"><div className="page-width">
        <div className="section-heading split-heading"><div><p className="eyebrow eyebrow-dark">What we move</p><h2>One local team.<br />Every kind of move.</h2></div><p>Whether it is one awkward sofa or a full household, we build the job around what you actually need.</p></div>
        <div className="services-grid">{services.map((service) => { const Icon = service.icon; return <article className="service-card" key={service.title}><div className="service-top"><span className="service-icon"><Icon /></span><span className="service-number">{service.number}</span></div><h3>{service.title}</h3><p>{service.text}</p><span className="service-accent">{service.accent} <ArrowRight size={16} /></span></article>; })}</div>
      </div></section>

      <section className="care-section" id="why-us">
        <div className="care-image"><img src={CUSTOMER_IMAGE} alt="A couple with moving boxes in their new home" /><div className="image-stamp"><ShieldCheck /><strong>Care at<br />every step</strong></div></div>
        <div className="care-copy"><p className="eyebrow">Why DownUnder</p><h2>Less stress.<br /><em>More certainty.</em></h2><p className="care-lead">Moving is a big day. You deserve a team that communicates clearly, arrives prepared and treats your belongings like their own.</p><ul className="benefit-list"><li><span><Check /></span><div><strong>Clear communication</strong><p>Know what is happening before, during and after your move.</p></div></li><li><span><Check /></span><div><strong>Careful from door to door</strong><p>Thoughtful loading, secure transport and considered unloading.</p></div></li><li><span><Check /></span><div><strong>A quote built around your move</strong><p>Tell us the details upfront so there are fewer surprises later.</p></div></li></ul><a className="primary-button" href="#quote">Plan my move <ArrowRight size={18} /></a></div>
      </section>

      <section className="process-section"><div className="page-width"><div className="section-heading centered-heading"><p className="eyebrow">How it works</p><h2>From first message to final box.</h2><p>Simple, clear and organised from the start.</p></div><div className="process-grid"><article><span>01</span><div className="process-icon"><Box /></div><h3>Tell us about it</h3><p>Share your locations, date, access and what needs moving.</p></article><article><span>02</span><div className="process-icon"><CalendarDays /></div><h3>Confirm your move</h3><p>We agree the details, availability and quote with you.</p></article><article><span>03</span><div className="process-icon"><Truck /></div><h3>Leave the lifting to us</h3><p>We arrive, load carefully and get you where you need to go.</p></article></div></div></section>

      <section className="location-section" id="location"><div className="map-wrap"><iframe title="Approximate DownUnder Removals service location in Hobart" src="https://www.google.com/maps?q=Hobart,TAS,Australia&output=embed" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /><div className="map-label"><span><MapPin /></span><div><small>Based near</small><strong>Hobart, Tasmania</strong></div></div></div><div className="location-copy"><p className="eyebrow eyebrow-dark">Our service area</p><h2>Hobart-based.<br />Tasmania-bound.</h2><p>We help customers move around Hobart and across Tasmania. Send us your pickup and destination suburbs and we will confirm availability.</p><div className="areas"><span>Hobart</span><span>Glenorchy</span><span>Kingston</span><span>Clarence</span><span>Brighton</span><span>Regional TAS</span></div><a className="map-button" href={MAPS_URL} target="_blank" rel="noreferrer"><Navigation size={18} /> Open in Google Maps <ArrowRight size={17} /></a><small className="location-note">Map shows an approximate Hobart service area, not a precise depot address.</small></div></section>

      <section className="faq-section" id="faq"><div className="page-width faq-grid"><div className="faq-heading"><p className="eyebrow eyebrow-dark">Good to know</p><h2>Questions before moving day?</h2><p>Here are the things customers usually want to know first.</p><a href="tel:+61455613236"><Phone size={17} /> Still unsure? Call us</a></div><div className="faq-list"><details open><summary>How do I get an accurate quote?<ChevronDown /></summary><p>Tell us your pickup and delivery locations, property size, access details and any unusually heavy or fragile items. Photos are helpful too.</p></details><details><summary>Do you move single pieces of furniture?<ChevronDown /></summary><p>Yes. We can quote for individual sofas, appliances, marketplace purchases and other bulky items.</p></details><details><summary>Do you travel outside Hobart?<ChevronDown /></summary><p>Yes, the service covers Tasmania. Availability and pricing depend on the route, date and size of the move.</p></details><details><summary>What should I have ready on moving day?<ChevronDown /></summary><p>Have boxes sealed and labelled, clear access paths, reserve parking where possible and tell us about stairs or restricted access in advance.</p></details></div></div></section>

      <section className="final-cta"><div className="page-width final-cta-inner"><div><p className="eyebrow">Ready when you are</p><h2>Let&apos;s get you moving.</h2><p>Tell us where, when and what. We&apos;ll take it from there.</p></div><div className="final-actions"><a className="primary-button" href="#quote">Get a free quote <ArrowRight size={18} /></a><a className="secondary-button" href="tel:+61455613236"><Phone size={18} /> Call now</a></div></div></section>

      <footer className="site-footer"><div className="page-width footer-grid"><div><a className="brand brand-light" href="#top"><span className="brand-mark"><Truck size={24} /></span><span><strong>DOWNUNDER</strong><small>REMOVALS</small></span></a><p>Careful house removals and reliable deliveries across Tasmania.</p></div><div><strong>Explore</strong><a href="#services">Services</a><a href="#why-us">Why us</a><a href="#reviews">Reviews</a><a href="#faq">FAQ</a></div><div><strong>Contact</strong><a href="tel:+61455613236">0455 613 236</a><span>Hobart, TAS 7018</span><span>9:00 am – 5:00 pm</span></div><div><strong>Start your move</strong><p>Get a tailored, no-obligation quote.</p><a className="footer-cta" href="#quote">Get a free quote <ArrowRight size={16} /></a></div></div><div className="page-width footer-bottom"><span>© {new Date().getFullYear()} DownUnder Removals. All rights reserved.</span><span>Website concept · Policies to be added before launch</span></div></footer>
      <div className="mobile-actions"><a href="tel:+61455613236"><Phone /> Call</a><a href="#quote"><ArrowRight /> Free quote</a></div>
    </main>
  );
}
