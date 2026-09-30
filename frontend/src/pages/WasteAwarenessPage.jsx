function WasteAwarenessPage() {
  const categories = [
    {
      title: "Textile & Fashion",
      tag: "TEXTILE",
      fact: "Clothing has impacts across material production, manufacturing, transport, use and end-of-life.",
      actions: [
        "Buy for longer use",
        "Repair before replacing",
        "Reuse or donate wearable items",
        "Check fibre and material information",
      ],
    },
    {
      title: "Plastic & Packaging",
      tag: "PLASTIC",
      fact: "Packaging can create waste immediately after a product is purchased or consumed.",
      actions: [
        "Avoid unnecessary packaging",
        "Prefer reusable alternatives",
        "Separate recyclable materials",
        "Check local recycling requirements",
      ],
    },
    {
      title: "Electronics & E-waste",
      tag: "E-WASTE",
      fact: "Electronic products contain valuable materials as well as components requiring controlled treatment.",
      actions: [
        "Repair before replacement",
        "Extend device life",
        "Use authorised collection channels",
        "Never mix e-waste with household waste",
      ],
    },
    {
      title: "Food Waste",
      tag: "FOOD",
      fact: "Food waste represents wasted resources used in growing, processing, transporting and storing food.",
      actions: [
        "Plan purchases",
        "Store food correctly",
        "Use leftovers",
        "Separate organic waste where supported",
      ],
    },
    {
      title: "Batteries",
      tag: "BATTERY",
      fact: "Batteries require appropriate handling because of their materials and safety characteristics.",
      actions: [
        "Do not put batteries in general waste",
        "Use designated collection points",
        "Avoid damaging or opening batteries",
        "Follow local disposal guidance",
      ],
    },
    {
      title: "Household Products",
      tag: "HOUSEHOLD",
      fact: "Everyday products have a lifecycle that extends beyond the moment they are discarded.",
      actions: [
        "Choose durable products",
        "Reuse where practical",
        "Repair damaged items",
        "Consider end-of-life options before buying",
      ],
    },
  ];

  const lifecycle = [
    {
      number: "01",
      title: "RESOURCE",
      text: "Materials and natural resources enter the product lifecycle.",
    },
    {
      number: "02",
      title: "PRODUCTION",
      text: "Energy, water, materials and manufacturing processes create environmental impacts.",
    },
    {
      number: "03",
      title: "CONSUMPTION",
      text: "Purchasing and usage decisions influence how long products remain in use.",
    },
    {
      number: "04",
      title: "END OF USE",
      text: "Products may be repaired, reused, returned, recycled or discarded.",
    },
    {
      number: "05",
      title: "RECOVERY",
      text: "Materials can potentially return to productive use through appropriate recovery pathways.",
    },
  ];

  return (
    <div className="page awareness-page">

      {/* HERO */}
      <section className="awareness-hero">

        <div className="awareness-hero-copy">

          <div className="eyebrow">
            ECOVERSE WASTE AWARENESS
          </div>

          <h1>
            Understand the waste
            <br />
            behind everyday products.
          </h1>

          <p>
            Waste does not begin when something reaches
            a bin. It is connected to the materials,
            resources, production, consumption and
            end-of-life decisions behind every product.
          </p>

          <div className="awareness-hero-actions">
            <a
              href="#waste-categories"
              className="dark-button"
            >
              Explore Waste Categories ↓
            </a>
          </div>

        </div>

        <div className="awareness-hero-visual">

          <div className="awareness-orbit orbit-one" />
          <div className="awareness-orbit orbit-two" />

          <div className="awareness-core">
            <span>PRODUCT</span>
            <strong>→</strong>
            <span>WASTE</span>
          </div>

          <div className="awareness-node node-top">
            RESOURCES
          </div>

          <div className="awareness-node node-right">
            CONSUMPTION
          </div>

          <div className="awareness-node node-bottom">
            RECOVERY
          </div>

          <div className="awareness-node node-left">
            IMPACT
          </div>

        </div>

      </section>

      {/* CORE MESSAGE */}
      <section className="awareness-intro">

        <div>
          <div className="eyebrow">
            WHY AWARENESS MATTERS
          </div>

          <h2>
            Look beyond the bin.
          </h2>
        </div>

        <p>
          A waste item is the visible end of a much
          larger system. ECOVERSE helps connect that
          visible waste with product lifecycle information,
          resource use, environmental impact and possible
          recovery pathways.
        </p>

      </section>

      {/* LIFECYCLE */}
      <section className="panel awareness-lifecycle">

        <div className="section-heading">

          <div>
            <div className="eyebrow">
              PRODUCT LIFECYCLE
            </div>

            <h2>
              Where waste begins
            </h2>
          </div>

          <span className="section-meta">
            RESOURCE → RECOVERY
          </span>

        </div>

        <div className="awareness-lifecycle-grid">

          {lifecycle.map((stage) => (
            <div
              className="awareness-lifecycle-card"
              key={stage.number}
            >
              <span>{stage.number}</span>

              <h3>{stage.title}</h3>

              <p>{stage.text}</p>
            </div>
          ))}

        </div>

      </section>

      {/* CATEGORIES */}
      <section
        id="waste-categories"
        className="awareness-categories-section"
      >

        <div className="section-heading">

          <div>
            <div className="eyebrow">
              MATERIAL INTELLIGENCE
            </div>

            <h2>
              Know what happens after use.
            </h2>
          </div>

          <p>
            Different materials require different
            handling, recovery and end-of-life pathways.
          </p>

        </div>

        <div className="awareness-category-grid">

          {categories.map((category) => (
            <article
              className="awareness-category-card"
              key={category.tag}
            >

              <div className="awareness-category-top">

                <span className="awareness-category-tag">
                  {category.tag}
                </span>

                <span className="awareness-category-arrow">
                  ↗
                </span>

              </div>

              <h3>
                {category.title}
              </h3>

              <p className="awareness-fact">
                {category.fact}
              </p>

              <div className="awareness-actions">

                <div className="eyebrow">
                  PRACTICAL ACTIONS
                </div>

                {category.actions.map((action) => (
                  <div
                    className="awareness-action"
                    key={action}
                  >
                    <span>✓</span>
                    {action}
                  </div>
                ))}

              </div>

            </article>
          ))}

        </div>

      </section>

      {/* CONSUMER QUESTIONS */}
      <section className="panel awareness-question-panel">

        <div>
          <div className="eyebrow">
            BEFORE YOU BUY
          </div>

          <h2>
            Ask better questions.
          </h2>

          <p>
            Awareness is not only about disposal. It can
            also begin before a product enters your home.
          </p>
        </div>

        <div className="awareness-question-grid">

          <div>
            <span>01</span>
            <strong>Do I need it?</strong>
            <p>
              Consider whether the product is actually
              necessary for your intended use.
            </p>
          </div>

          <div>
            <span>02</span>
            <strong>How long can I use it?</strong>
            <p>
              Durability, repairability and reuse can
              affect the product's useful life.
            </p>
          </div>

          <div>
            <span>03</span>
            <strong>What is it made from?</strong>
            <p>
              Material information can help you understand
              potential recovery pathways.
            </p>
          </div>

          <div>
            <span>04</span>
            <strong>What happens afterwards?</strong>
            <p>
              Consider return, reuse, recycling and
              end-of-life options.
            </p>
          </div>

        </div>

      </section>

      {/* ECOVERSE CTA */}
      <section className="awareness-cta">

        <div>

          <div className="eyebrow">
            TRACE THE PRODUCT
          </div>

          <h2>
            Don't just dispose.
            <br />
            Understand the lifecycle.
          </h2>

          <p>
            Use ECOVERSE Product Trace to explore the
            lifecycle information available for a product.
          </p>

        </div>

        <a
          href="/consumer"
          className="dark-button awareness-cta-button"
        >
          Explore Product Trace →
        </a>

      </section>

      <div className="awareness-note">
        <strong>Awareness note:</strong>
        Information shown in ECOVERSE should distinguish
        verified information, company-reported information,
        modelled estimates and unavailable data.
      </div>

    </div>
  );
}

export default WasteAwarenessPage;