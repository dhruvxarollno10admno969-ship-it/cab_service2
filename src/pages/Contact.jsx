
import { useState } from "react";
import "./contact.css";

import {
  ArrowUpRight,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    message: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity() || submitting) return;

    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (
      name.length < 2 ||
      name.length > 100 ||
      phone.length < 7 ||
      phone.length > 20 ||
      email.length > 254 ||
      message.length < 5 ||
      message.length > 3000
    ) {
      setStatus({
        type: "error",
        message: "Please check your details and try again.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      await addDoc(collection(db, "contactEnquiries"), {
        name,
        phone,
        email,
        message,
        status: "new",
        source: "contact-page",
        createdAt: serverTimestamp(),
      });

      form.reset();

      setStatus({
        type: "success",
        message: "Your enquiry has been submitted successfully. Thank you for contacting Manzill 777!",
      });
    } catch (error) {
      console.error("Contact enquiry submission failed:", error);

      setStatus({
        type: "error",
        message:
          "We couldn't submit your enquiry. Please try again or contact us on WhatsApp.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="contact-page">
      <section className="contact-section">
        <div className="contact-orb contact-orb-one" aria-hidden="true" />
        <div className="contact-orb contact-orb-two" aria-hidden="true" />
        <div className="contact-grid-overlay" aria-hidden="true" />

        <div className="contact-container">
          {/* HERO */}
          <header className="contact-hero">
            <div className="contact-eyebrow">
              <span className="contact-eyebrow-icon">
                <Sparkles size={15} />
              </span>
              YOUR JOURNEY, OUR PRIORITY
            </div>

            <h1>
              Let's make your
              <br />
              next journey <span>effortless.</span>
            </h1>

            <p className="contact-hero-description">
              Questions, travel plans, or help with your next ride?
              We're here to make every journey comfortable,
              convenient, and stress-free.
            </p>

            <div className="contact-hero-actions">
              <a href="#contact-form" className="contact-primary-btn">
                Get in touch
                <ArrowUpRight size={18} />
              </a>

              <a
                href="https://wa.me/919815489193"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-secondary-btn"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </a>
            </div>

            <div className="contact-trust-line">
              <ShieldCheck size={18} />
              <span>Reliable support for every journey.</span>
              <span className="contact-trust-dot" />
              <span>Manzill 777</span>
            </div>
          </header>

          {/* CONTACT INFORMATION */}
          <section
            className="contact-details-grid"
            aria-label="Contact information"
          >
            <a href="tel:+919815489193" className="contact-detail-card">
              <div className="contact-icon">
                <Phone size={21} />
              </div>

              <div className="contact-detail-content">
                <span className="contact-detail-label">CALL US</span>
                <h2>+91 98154 89193</h2>
                <p>Speak directly with our team</p>
              </div>

              <ArrowUpRight className="contact-detail-arrow" size={19} />
            </a>

            <a
              href="mailto:hello@manzill777.com"
              className="contact-detail-card"
            >
              <div className="contact-icon">
                <Mail size={21} />
              </div>

              <div className="contact-detail-content">
                <span className="contact-detail-label">EMAIL US</span>
                <h2>hello@manzill777.com</h2>
                <p>We'd love to hear from you</p>
              </div>

              <ArrowUpRight className="contact-detail-arrow" size={19} />
            </a>

            <div className="contact-detail-card">
              <div className="contact-icon">
                <MapPin size={21} />
              </div>

              <div className="contact-detail-content">
                <span className="contact-detail-label">OUR LOCATION</span>
                <h2>Chandigarh &amp; Tricity</h2>
                <p>Local rides and everyday journeys</p>
              </div>
            </div>

            <div className="contact-detail-card">
              <div className="contact-icon">
                <Clock size={21} />
              </div>

              <div className="contact-detail-content">
                <span className="contact-detail-label">AVAILABILITY</span>
                <h2>24/7 Ride Booking</h2>
                <p>Plan your next journey anytime</p>
              </div>
            </div>
          </section>

          {/* ENQUIRY SECTION */}
          <section className="contact-form-layout" id="contact-form">
            <div className="contact-form-intro">
              <span className="contact-small-label">LET'S TALK</span>

              <h2>
                We're just a
                <br />
                message <span>away.</span>
              </h2>

              <p>
                Tell us what you need. From booking enquiries
                to travel questions, we're ready to help you
                plan your next journey.
              </p>

              <div className="contact-response-note">
                <div className="contact-response-icon">
                  <MessageCircle size={22} />
                </div>

                <div className="contact-response-content">
                  <h3>Prefer a direct conversation?</h3>
                  <p>Connect with our team on WhatsApp.</p>

                  <a
                    href="https://wa.me/919815489193"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Start a conversation
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>

              <div className="contact-support-note">
                <CheckCircle2 size={18} />
                <span>Your journey matters to us.</span>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form-heading">
                <span className="contact-form-overline">
                  SEND A MESSAGE
                </span>

                <h3>How can we help?</h3>

                <p>Fill in the details to submit your enquiry.</p>
              </div>

              <div className="contact-input-row">
                <div className="contact-field">
                  <label htmlFor="contact-name">Full name</label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Rahul Sharma"
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="contact-phone">Phone number</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    autoComplete="tel"
                    inputMode="tel"
                    pattern="[+0-9() -]{7,20}"
                    title="Enter a valid phone number using digits, spaces, +, parentheses or hyphens."
                    maxLength={20}
                    required
                  />
                </div>
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">Email address</label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  maxLength={254}
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-message">Your message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Tell us about your journey or enquiry..."
                  rows={5}
                  minLength={5}
                  maxLength={3000}
                  required
                />

                <span className="contact-field-hint">
                  Include any details that will help us assist you.
                </span>
              </div>

              <button
                type="submit"
                className="contact-submit-btn"
                disabled={submitting}
              >
                <span>
                  {submitting ? "Submitting enquiry..." : "Send enquiry"}
                </span>

                {submitting ? (
                  <span className="contact-spinner" aria-hidden="true" />
                ) : (
                  <Send size={17} />
                )}
              </button>

              {status.message && (
                <div
                  className={`contact-form-status contact-status-${status.type}`}
                  role={status.type === "error" ? "alert" : "status"}
                  aria-live="polite"
                >
                  {status.type === "success" ? (
                    <CheckCircle2 size={19} />
                  ) : (
                    <ShieldCheck size={19} />
                  )}

                  <span>{status.message}</span>
                </div>
              )}

              <p className="contact-form-footnote">
                Your enquiry will be saved securely in our contact
                records when the submission succeeds.
              </p>
            </form>
          </section>

          {/* BOOKING CTA */}
          <section className="contact-bottom-banner">
            <div
              className="contact-banner-decoration"
              aria-hidden="true"
            >
              <Sparkles size={100} />
            </div>

            <div className="contact-banner-copy">
              <span>YOUR NEXT JOURNEY STARTS HERE</span>
              <h2>Ready when you are.</h2>
              <p>
                Comfortable rides. Reliable service.
                A better way to get there.
              </p>
            </div>

            <a href="/booking" className="contact-banner-btn">
              Book your ride
              <ArrowUpRight size={18} />
            </a>
          </section>

          {/* FOOTER */}
          <footer className="contact-footer">
            <a href="/" className="contact-footer-brand">
              <span className="contact-footer-logo">M</span>
              <span>MANZILL <b>777</b></span>
            </a>

            <span className="contact-footer-tagline">
              Every journey matters.
            </span>

            <a href="#contact-form" className="contact-footer-link">
              Get in touch
              <ArrowUpRight size={14} />
            </a>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default Contact;
