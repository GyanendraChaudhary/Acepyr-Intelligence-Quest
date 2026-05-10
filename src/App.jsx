import React, { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Flame,
  Trophy,
  Sparkles,
  ShieldCheck,
  Coins,
  BrainCircuit,
  CalendarCheck,
  Rocket,
  CheckCircle2,
  Lock,
  ExternalLink,
  Zap,
  Crown,
  Star,
  Activity,
  Gift,
  BarChart3
} from "lucide-react";
import confetti from "canvas-confetti";
import { ethers } from "ethers";
import { vectors, quests, leaderboard } from "./data";
import acepyrIcon from "./assets/acepyr-icon.png";
import acepyrHero from "./assets/acepyr-hero.png";

const STORAGE_KEY = "acepyr-intelligence-quest-v1";

const defaultProfile = {
  wallet: "",
  points: 350,
  streak: 0,
  bestStreak: 0,
  lastCheckin: "",
  completedQuests: [],
  level: "Observer",
  popup: null
};

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function shortWallet(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getLevel(points) {
  if (points >= 2500) return "Acepyr Architect";
  if (points >= 1800) return "Intelligence Builder";
  if (points >= 1100) return "Vector Analyst";
  if (points >= 600) return "Signal Scout";
  return "Observer";
}

function App() {
  const [profile, setProfile] = useState(defaultProfile);
  const [selectedVector, setSelectedVector] = useState(vectors[0]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [prediction, setPrediction] = useState("Higher");
  const [confidence, setConfidence] = useState(50);
  const [pollChoice, setPollChoice] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {
        setProfile(defaultProfile);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const today = getToday();
  const checkedToday = profile.lastCheckin === today;
  const progressPercent = Math.min((profile.points / 2500) * 100, 100);

  const completedCount = profile.completedQuests.length;

  const intelligenceScore = useMemo(() => {
    return Math.min(100, Math.floor(profile.points / 30 + profile.streak * 4 + completedCount * 5));
  }, [profile.points, profile.streak, completedCount]);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function rewardPopup(title, amount, message) {
    setProfile((prev) => ({
      ...prev,
      popup: {
        title,
        amount,
        message
      }
    }));

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  }

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        showToast("MetaMask not found. Please install a Web3 wallet.", "error");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];

      setProfile((prev) => ({
        ...prev,
        wallet: address
      }));

      showToast("Wallet connected successfully.");
    } catch (error) {
      showToast("Wallet connection cancelled or failed.", "error");
    }
  }

  function dailyCheckin() {
    if (checkedToday) {
      showToast("You already checked in today. Come back tomorrow.", "info");
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;

    if (profile.lastCheckin === yesterdayStr) {
      newStreak = profile.streak + 1;
    }

    const bonus = newStreak >= 7 ? 75 : newStreak >= 3 ? 45 : 25;

    const newPoints = profile.points + bonus;

    setProfile((prev) => ({
      ...prev,
      points: newPoints,
      streak: newStreak,
      bestStreak: Math.max(prev.bestStreak, newStreak),
      lastCheckin: today,
      level: getLevel(newPoints)
    }));

    rewardPopup("Daily Check-in Complete", bonus, `Your streak is now ${newStreak} day(s). Keep building your Acepyr signal.`);
  }

  function completeQuest(quest) {
    if (profile.completedQuests.includes(quest.id)) {
      showToast("Quest already completed.", "info");
      return;
    }

    const newPoints = profile.points + quest.reward;

    setProfile((prev) => ({
      ...prev,
      points: newPoints,
      completedQuests: [...prev.completedQuests, quest.id],
      level: getLevel(newPoints)
    }));

    rewardPopup("Quest Completed", quest.reward, `${quest.title} added intelligence points to your profile.`);
  }

  function runPredictionMission() {
    const reward = prediction === "Higher" ? 55 : 45;
    const confidenceBonus = Math.floor(confidence / 10);
    const total = reward + confidenceBonus;

    setProfile((prev) => ({
      ...prev,
      points: prev.points + total,
      level: getLevel(prev.points + total)
    }));

    rewardPopup("THEMIS Forecast Submitted", total, `Prediction: ${prediction}. Confidence: ${confidence}%. Your calibration has been recorded.`);
  }

  function submitPoll() {
    if (!pollChoice) {
      showToast("Select one poll answer first.", "error");
      return;
    }

    const reward = 35;

    setProfile((prev) => ({
      ...prev,
      points: prev.points + reward,
      level: getLevel(prev.points + reward)
    }));

    rewardPopup("Consilium Poll Submitted", reward, `Your response has been added to the simulated intelligence layer.`);
    setPollChoice("");
  }

  function resetProgress() {
    setProfile(defaultProfile);
    showToast("Demo progress reset.", "info");
  }

  return (
    <div className="app">
      {toast && (
        <div className={`toast ${toast.type}`}>
          <Sparkles size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {profile.popup && (
        <div className="popupOverlay">
          <div className="rewardPopup">
            <button
              className="closePopup"
              onClick={() => setProfile((prev) => ({ ...prev, popup: null }))}
            >
              ×
            </button>

            <div className="popupIcon">
              <Gift size={42} />
            </div>

            <h2>{profile.popup.title}</h2>
            <h1>+{profile.popup.amount} IQ Points</h1>
            <p>{profile.popup.message}</p>

            <button
              className="primaryBtn full"
              onClick={() => setProfile((prev) => ({ ...prev, popup: null }))}
            >
              Claim Reward
            </button>
          </div>
        </div>
      )}

      <header className="hero">
        <nav className="navbar">
          <div className="brand">
            <img src={acepyrIcon} alt="Acepyr Icon" />
            <div>
              <h2>Acepyr Intelligence Quest</h2>
              <span>Built by Anton</span>
            </div>
          </div>

          <div className="navActions">
            {profile.wallet ? (
              <button className="walletBtn connected">
                <Wallet size={18} />
                {shortWallet(profile.wallet)}
              </button>
            ) : (
              <button className="walletBtn" onClick={connectWallet}>
                <Wallet size={18} />
                Connect Wallet
              </button>
            )}
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroContent">
            <div className="tag">
              <Sparkles size={16} />
              Intelligence Economy · Real Stakes · Real Rewards
            </div>

            <h1>
              Build your <span>Acepyr Signal</span> through daily quests,
              streaks and Web3 participation.
            </h1>

            <p>
              A colorful community dashboard inspired by Acepyr’s intelligence economy.
              Connect wallet, check in daily, complete vector missions, earn IQ points,
              and grow your decision-maker profile.
            </p>

            <div className="heroButtons">
              <button className="primaryBtn" onClick={dailyCheckin}>
                <CalendarCheck size={18} />
                {checkedToday ? "Checked In Today" : "Daily Check-in"}
              </button>

              <a className="secondaryBtn" href="https://acepyr.com" target="_blank">
                <ExternalLink size={18} />
                Acepyr Website
              </a>
            </div>

            <div className="miniStats">
              <div>
                <strong>{profile.points}</strong>
                <span>IQ Points</span>
              </div>
              <div>
                <strong>{profile.streak}</strong>
                <span>Daily Streak</span>
              </div>
              <div>
                <strong>{profile.level}</strong>
                <span>Current Level</span>
              </div>
            </div>
          </div>

          <div className="heroCard">
            <img src={acepyrHero} alt="Acepyr Hero" />
            <div className="floatingCard top">
              <BrainCircuit size={22} />
              <div>
                <b>Decision Data</b>
                <span>Measured under pressure</span>
              </div>
            </div>

            <div className="floatingCard bottom">
              <Coins size={22} />
              <div>
                <b>Revenue Loop</b>
                <span>Users generate value</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="tabs">
          <button onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active" : ""}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab("quests")} className={activeTab === "quests" ? "active" : ""}>
            Quests
          </button>
          <button onClick={() => setActiveTab("vectors")} className={activeTab === "vectors" ? "active" : ""}>
            Vectors
          </button>
          <button onClick={() => setActiveTab("wallet")} className={activeTab === "wallet" ? "active" : ""}>
            Wallet Lab
          </button>
          <button onClick={() => setActiveTab("leaderboard")} className={activeTab === "leaderboard" ? "active" : ""}>
            Leaderboard
          </button>
        </section>

        {activeTab === "dashboard" && (
          <section className="section dashboardGrid">
            <div className="glassCard profileCard">
              <div className="cardHeader">
                <div>
                  <h2>Your Foundry Profile</h2>
                  <p>Calculated from decisions, quests and check-ins.</p>
                </div>
                <Crown className="goldIcon" size={34} />
              </div>

              <div className="profileAvatar">
                <img src={acepyrIcon} alt="Acepyr" />
                <div>
                  <h3>Anton</h3>
                  <span>{profile.level}</span>
                </div>
              </div>

              <div className="progressBox">
                <div className="progressTop">
                  <span>Builder Progress</span>
                  <b>{Math.floor(progressPercent)}%</b>
                </div>
                <div className="progressBar">
                  <div style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>

              <div className="profileStats">
                <div>
                  <Flame size={22} />
                  <strong>{profile.streak}</strong>
                  <span>Current Streak</span>
                </div>
                <div>
                  <Trophy size={22} />
                  <strong>{profile.bestStreak}</strong>
                  <span>Best Streak</span>
                </div>
                <div>
                  <Activity size={22} />
                  <strong>{intelligenceScore}</strong>
                  <span>Signal Score</span>
                </div>
              </div>
            </div>

            <div className="glassCard checkinCard">
              <div className="cardHeader">
                <div>
                  <h2>Daily Check-in System</h2>
                  <p>Come daily, grow streak, earn more points.</p>
                </div>
                <CalendarCheck size={34} />
              </div>

              <div className="streakCircle">
                <span>{profile.streak}</span>
                <p>Day Streak</p>
              </div>

              <button className="primaryBtn full" onClick={dailyCheckin}>
                {checkedToday ? <CheckCircle2 size={18} /> : <Zap size={18} />}
                {checkedToday ? "Already Claimed Today" : "Claim Daily Points"}
              </button>

              <p className="smallNote">
                3-day streak gives bonus. 7-day streak gives bigger reward popup.
              </p>
            </div>

            <div className="glassCard economyCard">
              <h2>Revenue Loop Concept</h2>
              <div className="loop">
                <div>Users Participate</div>
                <span>↓</span>
                <div>Decisions Measured</div>
                <span>↓</span>
                <div>Enterprise Demand</div>
                <span>↓</span>
                <div>Revenue Share</div>
              </div>
            </div>

            <div className="glassCard missionCard">
              <h2>THEMIS Quick Mission</h2>
              <p>Submit a simulated market prediction and earn IQ points.</p>

              <div className="choiceRow">
                <button className={prediction === "Higher" ? "selected" : ""} onClick={() => setPrediction("Higher")}>
                  Higher
                </button>
                <button className={prediction === "Lower" ? "selected" : ""} onClick={() => setPrediction("Lower")}>
                  Lower
                </button>
              </div>

              <label className="rangeLabel">
                Confidence: {confidence}%
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                />
              </label>

              <button className="primaryBtn full" onClick={runPredictionMission}>
                Submit Forecast
              </button>
            </div>
          </section>
        )}

        {activeTab === "quests" && (
          <section className="section">
            <div className="sectionTitle">
              <h2>Acepyr Quest Board</h2>
              <p>Complete missions and grow your intelligence profile.</p>
            </div>

            <div className="questGrid">
              {quests.map((quest) => {
                const done = profile.completedQuests.includes(quest.id);

                return (
                  <div className={`questCard ${done ? "done" : ""}`} key={quest.id}>
                    <div className="questTop">
                      <span>{quest.category}</span>
                      <b>{quest.difficulty}</b>
                    </div>

                    <h3>{quest.title}</h3>
                    <p>{quest.desc}</p>

                    <div className="questBottom">
                      <div>
                        <Coins size={18} />
                        +{quest.reward} Points
                      </div>

                      <button onClick={() => completeQuest(quest)} disabled={done}>
                        {done ? (
                          <>
                            <CheckCircle2 size={16} />
                            Done
                          </>
                        ) : (
                          <>
                            <Rocket size={16} />
                            Start
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === "vectors" && (
          <section className="section vectorSection">
            <div className="sectionTitle">
              <h2>Acepyr Vectors</h2>
              <p>Each vector measures a different decision layer under real pressure.</p>
            </div>

            <div className="vectorGrid">
              <div className="vectorList">
                {vectors.map((vector) => (
                  <button
                    key={vector.name}
                    className={selectedVector.name === vector.name ? "activeVector" : ""}
                    onClick={() => setSelectedVector(vector)}
                  >
                    <BrainCircuit size={18} />
                    <div>
                      <b>{vector.name}</b>
                      <span>{vector.type}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="glassCard vectorDetail">
                <span className="statusPill">{selectedVector.status}</span>
                <h2>{selectedVector.name}</h2>
                <h3>{selectedVector.type}</h3>
                <p>{selectedVector.desc}</p>

                <div className="vectorReward">
                  <Coins size={22} />
                  <div>
                    <b>Potential Quest Reward</b>
                    <span>+{selectedVector.points} IQ Points</span>
                  </div>
                </div>

                <button
                  className="primaryBtn"
                  onClick={() =>
                    rewardPopup(
                      `${selectedVector.name} Vector Activated`,
                      selectedVector.points,
                      `You explored ${selectedVector.name}. This is a simulated vector reward for community engagement.`
                    )
                  }
                >
                  Activate Vector
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "wallet" && (
          <section className="section walletGrid">
            <div className="glassCard walletPanel">
              <div className="cardHeader">
                <div>
                  <h2>Wallet Interaction Lab</h2>
                  <p>Connect wallet and simulate Acepyr on-chain readiness.</p>
                </div>
                <Wallet size={36} />
              </div>

              {profile.wallet ? (
                <div className="walletConnectedBox">
                  <ShieldCheck size={42} />
                  <h3>Wallet Connected</h3>
                  <p>{profile.wallet}</p>
                  <span>Ready for future Base interaction demo.</span>
                </div>
              ) : (
                <div className="walletConnectedBox locked">
                  <Lock size={42} />
                  <h3>No Wallet Connected</h3>
                  <p>Connect MetaMask to unlock Web3 profile status.</p>
                  <button className="primaryBtn" onClick={connectWallet}>
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>

            <div className="glassCard pollPanel">
              <h2>Consilium Poll Demo</h2>
              <p>Institutions ask, users answer, decision data compounds.</p>

              <div className="pollQuestion">
                <b>Which Vector should Acepyr expand next?</b>

                {["AI Security", "Legal Reasoning", "DeFi Risk", "Gaming Prediction"].map((item) => (
                  <label key={item} className={pollChoice === item ? "pollActive" : ""}>
                    <input
                      type="radio"
                      name="poll"
                      value={item}
                      checked={pollChoice === item}
                      onChange={(e) => setPollChoice(e.target.value)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              <button className="primaryBtn full" onClick={submitPoll}>
                Submit Poll & Earn
              </button>
            </div>

            <div className="glassCard chainPanel">
              <h2>On-chain Layer Preview</h2>

              <div className="chainItem">
                <span>$ACEPYR</span>
                <b>Soulbound Points</b>
              </div>

              <div className="chainItem">
                <span>$ACEPYRX</span>
                <b>Base Layer Coming</b>
              </div>

              <div className="chainItem">
                <span>Revenue Share</span>
                <b>Stablecoin Claim Concept</b>
              </div>

              <button className="secondaryBtn full" onClick={() => showToast("Mainnet claim is demo-only in this project.", "info")}>
                Simulate Claim
              </button>
            </div>
          </section>
        )}

        {activeTab === "leaderboard" && (
          <section className="section">
            <div className="sectionTitle">
              <h2>Community Leaderboard</h2>
              <p>Showcase builders, players and intelligence contributors.</p>
            </div>

            <div className="leaderboard">
              <div className="leaderRow current">
                <div className="rank">#0</div>
                <div>
                  <h3>Anton</h3>
                  <p>Built by Anton · Acepyr Builder Candidate</p>
                </div>
                <strong>{profile.points} Points</strong>
              </div>

              {leaderboard.map((item) => (
                <div className="leaderRow" key={item.rank}>
                  <div className="rank">#{item.rank}</div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.role}</p>
                  </div>
                  <strong>{item.points} Points</strong>
                </div>
              ))}
            </div>

            <button className="dangerBtn" onClick={resetProgress}>
              Reset Demo Progress
            </button>
          </section>
        )}
      </main>

      <footer>
        <div>
          <img src={acepyrIcon} alt="Acepyr" />
          <span>Acepyr Intelligence Quest</span>
        </div>
        <p>Built by Anton · Community Builder Project · May 2026</p>
      </footer>
    </div>
  );
}

export default App;