const services = [
  {
    number: "01",
    title: "Brand Strategy",
    text: "We define the positioning, direction and story that give your brand a clear place in the market.",
  },
  {
    number: "02",
    title: "Brand Identity",
    text: "Visual identities designed to make your business recognizable, consistent and memorable.",
  },
  {
    number: "03",
    title: "Graphic Design",
    text: "Creative visual systems for social media, campaigns, marketing materials and digital experiences.",
  },
  {
    number: "04",
    title: "Content Creation",
    text: "Human-centered content designed to connect your brand with the people who matter.",
  },
  {
    number: "05",
    title: "Social Media",
    text: "Strategic social media content that keeps your brand active, relevant and recognizable.",
  },
  {
    number: "06",
    title: "Digital Marketing",
    text: "Creative campaigns and digital strategies built to move attention into action.",
  },
];

const clients = [
  {
    name: "San Thawdar Luxury Jewellery Shop",
    logo: "/clients/san-thawdar.png",
  },
  {
    name: "Vera Luxury Spa",
    logo: "/clients/vera.png",
  },
  {
    name: "Laura & Grace Travel Services",
    logo: "/clients/laura-grace.png",
  },
  {
    name: "Shwe Yadanar Myanmar Construction & Decoration",
    logo: "/clients/shwe-yadanar.png",
  },
  {
    name: "Unique Tailor",
    logo: "/clients/unique-tailor.png",
  },
  {
    name: "New Icon Custom Tailor",
    logo: "/clients/new-icon.png",
  },
  {
    name: "Modern Men Bangkok Custom Tailor",
    logo: "/clients/modern-men.png",
  },
];

const process = [
  {
    number: "01",
    title: "Discover",
    text: "We understand your business, audience, market and opportunity.",
  },
  {
    number: "02",
    title: "Define",
    text: "We create the strategic and creative direction for the brand.",
  },
  {
    number: "03",
    title: "Create",
    text: "We turn the strategy into a clear and powerful visual system.",
  },
  {
    number: "04",
    title: "Launch",
    text: "We put the brand into the world and help it move forward.",
  },
];

export default function Home() {
  return (
    <main className="bg-[#0a0a0a] text-white overflow-hidden">

      {/* NAVIGATION */}

      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-10 py-5 bg-[#0a0a0a]/75 backdrop-blur-md border-b border-white/[0.04]">

        <div className="max-w-[1400px] mx-auto flex items-center justify-between">

          <a href="#top" className="block">
            <img
              src="/modo-logo.png"
              alt="MODO Branding Agency"
              className="w-[100px] md:w-[120px] h-auto object-contain"
            />
          </a>

          <div className="hidden md:flex items-center gap-10 text-sm text-neutral-400">

            <a href="#work" className="hover:text-white transition">
              Clients
            </a>

            <a href="#services" className="hover:text-white transition">
              Services
            </a>

            <a href="#about" className="hover:text-white transition">
              About
            </a>

          </div>

          <a
            href="#contact"
            className="border border-white/20 rounded-full px-5 py-2.5 text-sm hover:bg-white hover:text-black transition-all"
          >
            Start a project
          </a>

        </div>

      </nav>


      {/* HERO */}

      <section
        id="top"
        className="min-h-screen flex items-end px-6 md:px-10 pt-32 pb-16 md:pb-20 relative"
      >

        <div className="absolute top-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-white/[0.025] blur-[100px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto w-full relative">

          <div className="mb-10 flex items-center gap-3 text-sm text-neutral-500">

            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />

            <span>
              Branding · Creative · Digital
            </span>

          </div>


          <h1 className="max-w-[1200px] text-[17vw] md:text-[12vw] lg:text-[10.5vw] leading-[0.78] tracking-[-0.075em] font-semibold">

            MAKE

            <br />

            <span className="text-neutral-500">
              YOUR
            </span>

            <br />

            MODO.

          </h1>


          <div className="mt-14 flex flex-col md:flex-row md:items-end justify-between gap-8">

            <p className="max-w-md text-lg md:text-xl leading-relaxed text-neutral-400">
              We build brands, experiences and digital ideas
              that move businesses forward.
            </p>

            <a
              href="#about"
              className="flex items-center gap-3 text-sm text-neutral-500 hover:text-white transition"
            >
              <span>Scroll to explore</span>
              <span className="text-white">↓</span>
            </a>

          </div>

        </div>

      </section>


      {/* ABOUT */}

      <section
        id="about"
        className="px-6 md:px-10 py-28 md:py-40 border-t border-white/10"
      >

        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16">

          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            What is MODO?
          </p>

          <div>

            <h2 className="text-4xl md:text-6xl leading-[1.05] tracking-[-0.04em] font-medium">
              A branding agency for businesses that{" "}
              <span className="text-neutral-500">
                refuse to look ordinary.
              </span>
            </h2>

            <p className="mt-10 max-w-xl text-neutral-400 text-lg leading-relaxed">
              MODO combines strategy, design, content and
              digital marketing into one creative direction.
              We do not just make things look good.
              We make brands feel right.
            </p>

          </div>

        </div>

      </section>


      {/* SERVICES */}

      <section
        id="services"
        className="px-6 md:px-10 py-28 md:py-40 bg-[#111111]"
      >

        <div className="max-w-[1400px] mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">

            <div>

              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-5">
                Our capabilities
              </p>

              <h2 className="text-5xl md:text-7xl tracking-[-0.05em]">
                What we do.
              </h2>

            </div>

            <p className="text-neutral-500 max-w-sm">
              From the first idea to the final campaign,
              we create with purpose.
            </p>

          </div>


          <div className="border-t border-white/10">

            {services.map((service) => (

              <div
                key={service.number}
                className="group grid md:grid-cols-[100px_1fr_1fr] gap-6 py-9 border-b border-white/10 hover:px-4 transition-all duration-300"
              >

                <span className="text-neutral-600 text-sm">
                  {service.number}
                </span>

                <h3 className="text-2xl md:text-4xl tracking-[-0.03em] group-hover:text-neutral-300 transition">
                  {service.title}
                </h3>

                <p className="text-neutral-500 max-w-md md:justify-self-end leading-relaxed">
                  {service.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* CLIENTS */}

      <section
        id="work"
        className="px-6 md:px-10 py-28 md:py-40"
      >

        <div className="max-w-[1400px] mx-auto">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">

            <div>

              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-5">
                Selected clients
              </p>

              <h2 className="text-5xl md:text-7xl tracking-[-0.05em]">
                Brands we move.
              </h2>

            </div>

            <p className="text-neutral-500 max-w-sm">
              Working with ambitious businesses across different industries.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 border-t border-white/10">

            {clients.map((client, index) => (

              <div
                key={client.name}
                className="
                  group
                  relative
                  h-[280px]
                  md:h-[340px]
                  border-b
                  border-white/10
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                "
              >

                <span className="absolute top-6 left-6 text-xs text-neutral-600">
                  {String(index + 1).padStart(2, "0")}
                </span>


                <div className="w-[72%] h-[68%] flex items-center justify-center">

                  <img
                    src={client.logo}
                    alt={client.name}
                    className="
                      max-w-full
                      max-h-full
                      w-auto
                      h-auto
                      object-contain
                      opacity-70
                      grayscale
                      transition-all
                      duration-500
                      group-hover:opacity-100
                      group-hover:grayscale-0
                      group-hover:scale-105
                    "
                  />

                </div>


                <span className="absolute bottom-6 right-6 text-xs text-neutral-600 group-hover:text-white transition">
                  {String(index + 1).padStart(2, "0")} / Client
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* PROCESS */}

      <section className="px-6 md:px-10 py-28 md:py-40 bg-white text-black">

        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-5">
              Our process
            </p>

            <h2 className="text-5xl md:text-7xl tracking-[-0.06em] leading-[0.95]">
              Think.
              <br />
              Create.
              <br />
              Move.
            </h2>

          </div>


          <div>

            {process.map((item) => (

              <div
                key={item.number}
                className="grid grid-cols-[50px_1fr] gap-5 py-7 border-t border-black/10"
              >

                <span className="text-sm text-neutral-400">
                  {item.number}
                </span>

                <div>

                  <h3 className="text-2xl mb-2">
                    {item.title}
                  </h3>

                  <p className="text-neutral-500">
                    {item.text}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>


      {/* WHY MODO */}

      <section className="px-6 md:px-10 py-28 md:py-40">

        <div className="max-w-[1400px] mx-auto">

          <div className="grid lg:grid-cols-2 gap-16">

            <div>

              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-5">
                Why MODO
              </p>

              <h2 className="text-5xl md:text-7xl tracking-[-0.06em] leading-[0.95]">
                More than
                <br />
                just
                <br />
                design.
              </h2>

            </div>


            <div className="space-y-10">

              <p className="text-neutral-400 text-lg leading-relaxed">
                Great branding is not only about how something
                looks. It is about what people remember,
                what they feel and what they do next.
              </p>


              <div className="border-t border-white/10 pt-8">

                <h3 className="text-2xl mb-3">
                  Strategy meets creativity.
                </h3>

                <p className="text-neutral-500 leading-relaxed">
                  We connect business thinking with creative
                  execution so your brand has both meaning
                  and visual impact.
                </p>

              </div>


              <div className="border-t border-white/10 pt-8">

                <h3 className="text-2xl mb-3">
                  Built for the digital world.
                </h3>

                <p className="text-neutral-500 leading-relaxed">
                  From social media to digital campaigns,
                  we design brands that are ready to live
                  everywhere your audience is.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* CONTACT */}

      <section
        id="contact"
        className="px-6 md:px-10 py-32 md:py-48 border-t border-white/10"
      >

        <div className="max-w-[1400px] mx-auto">

          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 mb-10">
            Start something
          </p>


          <h2 className="text-[15vw] md:text-[10vw] leading-[0.8] tracking-[-0.08em] font-semibold">

            LET&apos;S

            <br />

            <span className="text-neutral-500">
              MAKE IT
            </span>

            <br />

            MODO.

          </h2>


          <div className="mt-16 flex flex-col md:flex-row md:items-center justify-between gap-8 border-t border-white/10 pt-8">

            <a
              href="mailto:hello@modo.agency"
              className="text-xl md:text-2xl hover:text-neutral-400 transition"
            >
              hello@modo.agency
            </a>


            <a
              href="mailto:hello@modo.agency"
              className="inline-flex items-center justify-center bg-white text-black rounded-full px-7 py-4 hover:bg-neutral-200 transition"
            >
              Start a project ↗
            </a>

          </div>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="px-6 md:px-10 pb-8">

        <div className="max-w-[1400px] mx-auto border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-xs text-neutral-600">

          <img
            src="/modo-logo.png"
            alt="MODO Branding Agency"
            className="w-[85px] h-auto opacity-70"
          />

          <span>
            © 2026 MODO Branding Agency
          </span>

          <span>
            Branding · Creative · Digital
          </span>

        </div>

      </footer>

    </main>
  );
}