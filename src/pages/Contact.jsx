
import "./contact.css";
import { ArrowUpRight, MapPin } from "lucide-react";

function Contact() {
  const handleSubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const name = data.get("name");
    const phone = data.get("phone");
    const email = data.get("email");
    const message = data.get("message");

    const subject = encodeURIComponent(
      `MANZILL 777 enquiry from ${name}`
    );

    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nMessage:\n${message}`
    );

    window.location.href =
      `mailto:hello@manzill777.com?subject=${subject}&body=${body}`;
  };

  return (
    <section className="contact-page">
      <div className="contact-container">

        {/* LEFT SIDE */}
        <div className="contact-left">
          <div className="contact-title">
            <h1>
              Let's get you
              <br />
              moving.
            </h1>
          </div>

          <p className="contact-intro">
            Need a ride, have a question, or want to plan a trip?
            We're here to help.
          </p>

          <div className="contact-links">

            <a
              className="contact-link"
              href="tel:+919815489193"
            >
              <span className="contact-number">01</span>

              <span className="contact-link-text">
                <small>CALL US</small>
                <strong>+91 98154 89193</strong>
              </span>

              <ArrowUpRight className="contact-arrow" size={17} />
            </a>

            <a
              className="contact-link"
              href="https://wa.me/919815489193"
              target="_blank"
              rel="noreferrer"
            >
              <span className="contact-number">02</span>

              <span className="contact-link-text">
                <small>WHATSAPP</small>
                <strong>Chat with us</strong>
              </span>

              <ArrowUpRight className="contact-arrow" size={17} />
            </a>

            <a
              className="contact-link"
              href="mailto:hello@manzill777.com"
            >
              <span className="contact-number">03</span>

              <span className="contact-link-text">
                <small>EMAIL</small>
                <strong>hello@manzill777.com</strong>
              </span>

              <ArrowUpRight className="contact-arrow" size={17} />
            </a>

            <div className="contact-link">
              <span className="contact-number">04</span>

              <span className="contact-link-text">
                <small>OPERATING AREA</small>
                <strong>Chandigarh &amp; Tricity</strong>
              </span>

              <MapPin className="contact-arrow" size={17} />
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: CONTACT FORM */}
        <div className="contact-right">
          <form className="contact-form" onSubmit={handleSubmit}>

            <div className="contact-form-row">
              <label className="contact-field">
                <span>YOUR NAME</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                />
              </label>

              <label className="contact-field">
                <span>PHONE NUMBER</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91"
                  autoComplete="tel"
                  required
                />
              </label>
            </div>

            <label className="contact-field">
              <span>EMAIL</span>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="contact-field">
              <span>HOW CAN WE HELP?</span>
              <textarea
                name="message"
                placeholder="Tell us what you need..."
                rows={5}
                required
              />
            </label>

            <button className="contact-submit" type="submit">
              <span>Send Message</span>
              <ArrowUpRight size={18} />
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}

export default Contact;