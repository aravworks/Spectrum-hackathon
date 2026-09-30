import { useMemo, useState } from "react";

const rewardActions = [
  {
    id: 1,
    title: "Report a Waste Issue",
    description: "Submit an environmental waste observation.",
    coins: 50,
    icon: "!",
  },
  {
    id: 2,
    title: "Complete Waste Pickup",
    description: "Complete a verified waste pickup request.",
    coins: 100,
    icon: "↗",
  },
  {
    id: 3,
    title: "Recycle Material",
    description: "Send recoverable material into a recycling pathway.",
    coins: 75,
    icon: "♻",
  },
  {
    id: 4,
    title: "Repair Instead of Replace",
    description: "Choose repair or reuse before buying a replacement.",
    coins: 60,
    icon: "↻",
  },
  {
    id: 5,
    title: "Reuse an Item",
    description: "Give an existing product another useful lifecycle.",
    coins: 40,
    icon: "↺",
  },
  {
    id: 6,
    title: "Complete Awareness Activity",
    description: "Learn about responsible consumption and waste.",
    coins: 20,
    icon: "i",
  },
];

const initialHistory = [
  {
    id: "RW-001",
    action: "Recycled plastic material",
    date: "30 Sep 2026",
    coins: 75,
    status: "VERIFIED",
  },
  {
    id: "RW-002",
    action: "Completed awareness activity",
    date: "29 Sep 2026",
    coins: 20,
    status: "VERIFIED",
  },
  {
    id: "RW-003",
    action: "Reported waste issue",
    date: "28 Sep 2026",
    coins: 50,
    status: "PENDING",
  },
];

function RewardsPage() {
  const [coins, setCoins] = useState(1240);
  const [history, setHistory] = useState(initialHistory);
  const [activeTab, setActiveTab] = useState("earn");
  const [message, setMessage] = useState("");

  const totalEarned = useMemo(
    () =>
      history.reduce(
        (total, item) => total + item.coins,
        0
      ),
    [history]
  );

  const handleEarn = (action) => {
    const newRecord = {
      id: `RW-${String(history.length + 4).padStart(3, "0")}`,
      action: action.title,
      date: "30 Sep 2026",
      coins: action.coins,
      status: "PENDING",
    };

    setCoins((current) => current + action.coins);

    setHistory((current) => [
      newRecord,
      ...current,
    ]);

    setMessage(
      `+${action.coins} EcoCoins added for "${action.title}".`
    );

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  return (
    <div className="page rewards-page">
      {/* HEADER */}

      <div className="page-header rewards-header">
        <div>
          <div className="eyebrow">
            ECOVERSE / REWARDS & PARTICIPATION
          </div>

          <h1>EcoCoins</h1>

          <p>
            Reward environmentally responsible actions
            and make positive participation visible.
          </p>
        </div>

        <div className="rewards-header-status">
          <span />
          REWARD SYSTEM ACTIVE
        </div>
      </div>

      {/* COIN HERO */}

      <section className="eco-coin-hero">
        <div className="eco-coin-main">
          <div className="eco-coin-symbol">EC</div>

          <div>
            <span className="eco-coin-label">
              AVAILABLE ECOCOINS
            </span>

            <strong>{coins.toLocaleString()}</strong>

            <p>
              Earned through verified or participation-based
              environmental actions.
            </p>
          </div>
        </div>

        <div className="eco-coin-stats">
          <div>
            <span>TOTAL EARNED</span>
            <strong>
              {totalEarned.toLocaleString()}
            </strong>
          </div>

          <div>
            <span>ACTIONS</span>
            <strong>{history.length}</strong>
          </div>

          <div>
            <span>LEVEL</span>
            <strong>GREEN EXPLORER</strong>
          </div>
        </div>
      </section>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="reward-success-message">
          <span>✓</span>
          {message}
        </div>
      )}

      {/* TABS */}

      <div className="rewards-tabs">
        <button
          type="button"
          className={
            activeTab === "earn"
              ? "reward-tab active"
              : "reward-tab"
          }
          onClick={() => setActiveTab("earn")}
        >
          Earn EcoCoins
        </button>

        <button
          type="button"
          className={
            activeTab === "history"
              ? "reward-tab active"
              : "reward-tab"
          }
          onClick={() => setActiveTab("history")}
        >
          Activity History
        </button>

        <button
          type="button"
          className={
            activeTab === "impact"
              ? "reward-tab active"
              : "reward-tab"
          }
          onClick={() => setActiveTab("impact")}
        >
          Environmental Impact
        </button>
      </div>

      {/* EARN */}

      {activeTab === "earn" && (
        <section>
          <div className="rewards-section-heading">
            <div>
              <div className="eyebrow">
                PARTICIPATION
              </div>

              <h2>Ways to earn EcoCoins</h2>

              <p>
                Complete activities and contribute useful
                environmental information.
              </p>
            </div>
          </div>

          <div className="reward-action-grid">
            {rewardActions.map((action) => (
              <article
                className="reward-action-card"
                key={action.id}
              >
                <div className="reward-action-icon">
                  {action.icon}
                </div>

                <div className="reward-action-content">
                  <h3>{action.title}</h3>

                  <p>{action.description}</p>

                  <div className="reward-action-bottom">
                    <strong>
                      +{action.coins} EcoCoins
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        handleEarn(action)
                      }
                    >
                      Complete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* HISTORY */}

      {activeTab === "history" && (
        <section className="panel rewards-history-panel">
          <div className="rewards-section-heading">
            <div>
              <div className="eyebrow">
                REWARD LEDGER
              </div>

              <h2>Activity history</h2>
            </div>
          </div>

          <div className="reward-history-table">
            <div className="reward-history-header">
              <span>ID</span>
              <span>ACTION</span>
              <span>DATE</span>
              <span>COINS</span>
              <span>STATUS</span>
            </div>

            {history.map((item) => (
              <div
                className="reward-history-row"
                key={item.id}
              >
                <span>{item.id}</span>

                <strong>{item.action}</strong>

                <span>{item.date}</span>

                <b>+{item.coins}</b>

                <span>
                  <em
                    className={
                      item.status === "VERIFIED"
                        ? "reward-verified"
                        : "reward-pending"
                    }
                  >
                    {item.status}
                  </em>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* IMPACT */}

      {activeTab === "impact" && (
        <section>
          <div className="rewards-section-heading">
            <div>
              <div className="eyebrow">
                ENVIRONMENTAL CONTRIBUTION
              </div>

              <h2>Your participation impact</h2>

              <p>
                EcoCoins are designed to make positive
                environmental participation measurable.
              </p>
            </div>
          </div>

          <div className="reward-impact-grid">
            <div className="reward-impact-card">
              <span>WASTE ACTIONS</span>

              <strong>8</strong>

              <p>
                Reported, recycled or recovered material
                activities.
              </p>
            </div>

            <div className="reward-impact-card">
              <span>MATERIAL RECOVERED</span>

              <strong>42 kg</strong>

              <p>
                Demonstration value from completed
                recovery activities.
              </p>
            </div>

            <div className="reward-impact-card">
              <span>REUSE ACTIVITIES</span>

              <strong>5</strong>

              <p>
                Products given an additional lifecycle.
              </p>
            </div>

            <div className="reward-impact-card">
              <span>COMMUNITY CONTRIBUTION</span>

              <strong>12</strong>

              <p>
                Environmental participation events.
              </p>
            </div>
          </div>

          <div className="reward-impact-note">
            <strong>Important</strong>

            <p>
              EcoCoins are a participation mechanism, not
              a financial asset. Environmental impact values
              shown here are illustrative until verified
              activity data is connected to the backend.
            </p>
          </div>
        </section>
      )}

      {/* REDEMPTION */}

      <section className="reward-redemption-section">
        <div>
          <div className="eyebrow">
            FUTURE ECOVERSE FEATURE
          </div>

          <h2>Use EcoCoins for environmental impact</h2>

          <p>
            Future versions can allow verified users to
            exchange accumulated EcoCoins for approved
            environmental activities, community programs,
            repair incentives or recovery services.
          </p>
        </div>

        <div className="redemption-status">
          <span>COMING SOON</span>

          <strong>
            Redemption marketplace
          </strong>

          <small>
            Backend integration required
          </small>
        </div>
      </section>

      {/* DATA NOTE */}

      <div className="rewards-data-note">
        <strong>
          Reward data currently runs in frontend demo mode.
        </strong>

        <p>
          Actions and EcoCoin balances are stored only in
          the current frontend session. Production deployment
          should connect rewards to authenticated users,
          verified activities and backend transaction records.
        </p>
      </div>
    </div>
  );
}

export default RewardsPage;