"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Activity,
  Gamepad2,
  Shirt,
  Trophy,
  BookOpen,
  ShoppingBag,
  Users,
  Settings,
  Heart,
  Zap,
  Smile,
  Utensils,
  Moon,
  Sparkles,
  ChevronRight,
  Send,
  Bot,
  User,
  Sparkle,
  Brain,
  Play,
  RotateCcw,
  Coins,
  Check,
  CheckCircle2,
  Lock,
  Gift,
  Hand,
  UserCheck,
  Volume2,
  Database,
  Trash2,
  PackageCheck,
  PlusCircle,
  Plus,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface ClosetItem {
  id: string;
  name: string;
  category: "hats" | "glasses" | "outfits" | "backgrounds";
  price: number;
  icon: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  purchased: boolean;
  equipped: boolean;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  rewardXp: number;
  current: number;
  target: number;
  claimed: boolean;
  icon: string;
  type: "feed" | "chat" | "game" | "dress";
}

interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  category: "Care" | "Gaming" | "Social" | "Style";
}

interface DiaryEntry {
  id: string;
  title: string;
  date: string;
  category: "Milestone" | "Fun" | "Care" | "Health";
  content: string;
  emoji: string;
}

interface StoreItem {
  id: string;
  name: string;
  category: "Food" | "Toys" | "Health" | "Upgrades";
  price: number;
  icon: string;
  description: string;
  statEffect: string;
  quantityOwned: number;
}

interface PetFriend {
  id: string;
  ownerName: string;
  petName: string;
  petAvatar: string;
  level: number;
  status: string;
  isVisiting: boolean;
  wavesSent: number;
}

interface SocialActivity {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  emoji: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // --- STATS & LEVEL PROGRESSION ENGINE ---
  const [stats, setStats] = useState({
    hunger: 75,
    happiness: 90,
    energy: 65,
    level: 1,
    xp: 0,
    coins: 250,
  });

  const [petMood, setPetMood] = useState<string>("Happy 😸");
  const [isSleeping, setIsSleeping] = useState(false);

  // Helper function to increase XP and handle automatic Level-Up
  const addXpAndCoins = (xpAmount: number, coinAmount: number) => {
    setStats((prev) => {
      let newXp = prev.xp + xpAmount;
      let newLevel = prev.level;
      let newCoins = prev.coins + coinAmount;
      const xpNeeded = newLevel * 100;

      if (newXp >= xpNeeded) {
        newXp = newXp - xpNeeded;
        newLevel += 1;
        newCoins += 100; // Level Up Bonus!
        setPetMood("Leveled Up! 🎉");
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        coins: newCoins,
      };
    });
  };

  // Quest Tracker Updater Helper
  const incrementQuestProgress = (type: "feed" | "chat" | "game" | "dress") => {
    setQuests((prevQuests) =>
      prevQuests.map((q) => {
        if (q.type === type && q.current < q.target) {
          return { ...q, current: q.current + 1 };
        }
        return q;
      })
    );
  };

  // --- PAGE 2: CHATROOM STATE & LOGIC ---
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Woof! 🐾 Hey there! I'm Brownie. How are you doing today?",
      timestamp: "10:00 AM",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab, isTyping]);

// Replace lines 174–218 with this updated handleSendMessage function:
const handleSendMessage = async () => {
  if (!inputMessage.trim() || isTyping) return;

  const userText = inputMessage.trim();
  const userMsg: Message = {
    id: Date.now().toString(),
    sender: "user",
    text: userText,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };

  // 1. Immediately show user's message in UI & trigger quest progress
  const updatedMessages = [...messages, userMsg];
  setMessages(updatedMessages);
  setInputMessage("");
  setIsTyping(true);
  incrementQuestProgress("chat");

  try {
    // 2. Format message history for API (mapping "bot" to "brownie" / "user" to "user")
    const formattedHistory = messages.map((m) => ({
      sender: m.sender === "user" ? "user" : "brownie",
      text: m.text,
    }));

    // 3. Send request to your Next.js backend API
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userText,
        history: formattedHistory,
      }),
    });

    const data = await res.json();

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: data.reply || "Woof! I'm having trouble thinking right now. 🐾",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // 4. Append AI response & reward user
    setMessages((prev) => [...prev, botMsg]);
    addXpAndCoins(10, 5);
  } catch (error) {
    console.error("Error communicating with Brownie AI:", error);
    const errorMsg: Message = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: "Woof... my server connection dropped! Please try again.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setIsTyping(false);
  }
};

  // --- PAGE 3: HEALTH DIAGNOSTICS & VITALS ---
  const [activeDiag, setActiveDiag] = useState<"overall" | "hydration" | "mind" | "stamina">("overall");

  // --- PAGE 4: EXPANDED ARCADE MINIGAMES ---
  const [activeGame, setActiveGame] = useState<"none" | "fetch" | "catcher" | "memory" | "hurdles">("none");
  const [gameScore, setGameScore] = useState(0);
  const [gameTime, setGameTime] = useState(15);
  const [isGameActive, setIsGameActive] = useState(false);
  const [targetPos, setTargetPos] = useState({ top: 40, left: 50 });

  // Treat Catcher State
  const [catcherPos, setCatcherPos] = useState(50);
  const [treatPos, setTreatPos] = useState({ x: 50, y: 0 });

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState([
    { id: 1, icon: "🥩", flipped: false, matched: false },
    { id: 2, icon: "🎾", flipped: false, matched: false },
    { id: 3, icon: "🥩", flipped: false, matched: false },
    { id: 4, icon: "🎾", flipped: false, matched: false },
  ]);

  // Hurdles Game State
  const [hurdlePos, setHurdlePos] = useState(100);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameActive && gameTime > 0) {
      timer = setInterval(() => {
        setGameTime((prev) => prev - 1);
        if (activeGame === "catcher") {
          setTreatPos((prev) => ({
            x: prev.y > 80 ? Math.floor(Math.random() * 80) + 10 : prev.x,
            y: prev.y > 80 ? 0 : prev.y + 20,
          }));
        } else if (activeGame === "hurdles") {
          setHurdlePos((prev) => (prev <= 0 ? 100 : prev - 20));
        }
      }, 1000);
    } else if (gameTime === 0 && isGameActive) {
      setIsGameActive(false);
      const coinsEarned = gameScore * 15 + 20;
      addXpAndCoins(35, coinsEarned);
      incrementQuestProgress("game");
    }
    return () => clearInterval(timer);
  }, [isGameActive, gameTime, activeGame, gameScore]);

  const startFetchGame = () => {
    setGameScore(0);
    setGameTime(15);
    setIsGameActive(true);
    setActiveGame("fetch");
    setTargetPos({ top: 30, left: 40 });
  };

  const handleFetchClick = () => {
    if (!isGameActive) return;
    setGameScore((s) => s + 1);
    setTargetPos({
      top: Math.floor(Math.random() * 60) + 20,
      left: Math.floor(Math.random() * 70) + 15,
    });
  };

  const handleFlipCard = (index: number) => {
    const updated = [...memoryCards];
    updated[index].flipped = true;
    setMemoryCards(updated);
    setGameScore((s) => s + 1);
  };

  const handleJumpHurdle = () => {
    if (isJumping) return;
    setIsJumping(true);
    if (hurdlePos > 20 && hurdlePos < 60) {
      setGameScore((s) => s + 1);
    }
    setTimeout(() => setIsJumping(false), 600);
  };

  // --- PAGE 5: CLOSET STUDIO STATE ---
  const [closetCategory, setClosetCategory] = useState<"hats" | "glasses" | "outfits" | "backgrounds">("hats");
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([
    { id: "h1", name: "Party Hat", category: "hats", price: 0, icon: "🥳", rarity: "Common", purchased: true, equipped: true },
    { id: "h2", name: "Royal Crown", category: "hats", price: 200, icon: "👑", rarity: "Legendary", purchased: false, equipped: false },
    { id: "g1", name: "Cool Shades", category: "glasses", price: 100, icon: "🕶️", rarity: "Rare", purchased: false, equipped: false },
    { id: "o1", name: "Superhero Cape", category: "outfits", price: 300, icon: "🦸", rarity: "Epic", purchased: false, equipped: false },
  ]);

  const handleEquipOrBuy = (item: ClosetItem) => {
    if (!item.purchased) {
      if (stats.coins < item.price) {
        alert("Not enough coins!");
        return;
      }
      setStats((prev) => ({ ...prev, coins: prev.coins - item.price }));
      setClosetItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, purchased: true } : i))
      );
      return;
    }

    setClosetItems((prev) =>
      prev.map((i) =>
        i.category === item.category ? { ...i, equipped: i.id === item.id ? !i.equipped : false } : i
      )
    );
    incrementQuestProgress("dress");
  };

  // --- PAGE 6: QUESTS & ACHIEVEMENTS ---
  const [quests, setQuests] = useState<Quest[]>([
    { id: "q1", title: "Feed Brownie", description: "Give Brownie a meal from the Care Store or inventory", rewardCoins: 80, rewardXp: 40, current: 0, target: 1, claimed: false, icon: "🍖", type: "feed" },
    { id: "q2", title: "Chat Buddy", description: "Send 2 interactive chat messages", rewardCoins: 100, rewardXp: 50, current: 0, target: 2, claimed: false, icon: "💬", type: "chat" },
    { id: "q3", title: "Arcade Champion", description: "Play 1 minigame in the arcade", rewardCoins: 120, rewardXp: 60, current: 0, target: 1, claimed: false, icon: "🎮", type: "game" },
    { id: "q4", title: "Fashion Icon", description: "Equip or buy an accessory in Closet Studio", rewardCoins: 90, rewardXp: 45, current: 0, target: 1, claimed: false, icon: "👑", type: "dress" },
  ]);

  const [badges] = useState<Badge[]>([
    { id: "b1", title: "Rising Star", description: "Reach Companion Level 2", icon: "⭐", unlocked: stats.level >= 2, category: "Care" },
    { id: "b2", title: "Arcade Master", description: "Earn score in any minigame", icon: "🏆", unlocked: true, category: "Gaming" },
    { id: "b3", title: "Fashionista", description: "Equip party hat or crown", icon: "✨", unlocked: true, category: "Style" },
  ]);

  const claimQuestReward = (quest: Quest) => {
    if (quest.current < quest.target || quest.claimed) return;
    addXpAndCoins(quest.rewardXp, quest.rewardCoins);
    setQuests((prev) =>
      prev.map((q) => (q.id === quest.id ? { ...q, claimed: true } : q))
    );
  };

  // --- PAGE 7: PET DIARY & MEMORIES ---
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([
    { id: "d1", title: "First Day Home!", date: "Today", category: "Milestone", content: "Adopted Brownie! High energy and loves playing.", emoji: "🐾" },
  ]);
  const [diaryTitle, setDiaryTitle] = useState("");
  const [diaryCategory, setDiaryCategory] = useState<"Milestone" | "Fun" | "Care" | "Health">("Fun");
  const [diaryContent, setDiaryContent] = useState("");

  const handleSaveDiaryEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryTitle.trim() || !diaryContent.trim()) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      title: diaryTitle,
      date: "Just now",
      category: diaryCategory,
      content: diaryContent,
      emoji: "🌟",
    };

    setDiaryEntries([newEntry, ...diaryEntries]);
    setDiaryTitle("");
    setDiaryContent("");
  };

  // --- PAGE 8: CARE STORE & INVENTORY "MY PET BAG" ---
  const [storeCategory, setStoreCategory] = useState<"All" | "Food" | "Toys" | "Health" | "Upgrades">("All");
  const [storeItems, setStoreItems] = useState<StoreItem[]>([
    { id: "s1", name: "Gourmet Bone Steak", category: "Food", price: 60, icon: "🥩", description: "Fills hunger instantly by +35%!", statEffect: "+35 Hunger, +15 Happiness", quantityOwned: 1 },
    { id: "s2", name: "Squeaky Rubber Duck", category: "Toys", price: 90, icon: "🦆", description: "Boosts pet happiness during play.", statEffect: "+25 Happiness", quantityOwned: 0 },
    { id: "s3", name: "Vitamin Chewables", category: "Health", price: 110, icon: "💊", description: "Boosts stamina and energy.", statEffect: "+30 Energy", quantityOwned: 0 },
    { id: "s4", name: "Golden Frisbee", category: "Toys", price: 180, icon: "🥏", description: "High-flying fetch fun!", statEffect: "+40 Happiness, +20 XP", quantityOwned: 0 },
  ]);

  const handleBuyStoreItem = (item: StoreItem) => {
    if (stats.coins < item.price) {
      alert("Not enough coins!");
      return;
    }

    setStats((prev) => ({ ...prev, coins: prev.coins - item.price }));
    setStoreItems((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, quantityOwned: s.quantityOwned + 1 } : s))
    );
  };

  const handleUseInventoryItem = (item: StoreItem) => {
    if (item.quantityOwned <= 0) return;

    setStoreItems((prev) =>
      prev.map((s) => (s.id === item.id ? { ...s, quantityOwned: s.quantityOwned - 1 } : s))
    );

    let hungerBoost = item.category === "Food" ? 35 : 0;
    let happyBoost = item.category === "Toys" ? 30 : 10;
    let energyBoost = item.category === "Health" ? 30 : 0;

    setStats((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + hungerBoost),
      happiness: Math.min(100, prev.happiness + happyBoost),
      energy: Math.min(100, prev.energy + energyBoost),
    }));

    addXpAndCoins(15, 0);
    incrementQuestProgress("feed");
    setPetMood("Satisfied! 😋");
  };

  // --- PAGE 9: REALISTIC COMMUNITY HUB ---
  const [friends] = useState<PetFriend[]>([
    { id: "f1", ownerName: "Aria", petName: "Luna", petAvatar: "🐺", level: 3, status: "Ready for fetch in the park!", isVisiting: false, wavesSent: 2 },
    { id: "f2", ownerName: "Leo", petName: "Mochi", petAvatar: "🦊", level: 4, status: "Taking an afternoon nap 💤", isVisiting: false, wavesSent: 1 },
    { id: "f3", ownerName: "Maya", petName: "Coco", petAvatar: "🐩", level: 5, status: "Dressed up in rare outfits! ✨", isVisiting: false, wavesSent: 4 },
  ]);

  const [activePlaydate, setActivePlaydate] = useState<PetFriend | null>(null);
  const [socialFeed, setSocialFeed] = useState<SocialActivity[]>([
    { id: "a1", actor: "Aria & Luna", action: "sent Brownie a treat box", timestamp: "5m ago", emoji: "🎁" },
    { id: "a2", actor: "Maya & Coco", action: "unlocked Level 5 companion badge", timestamp: "20m ago", emoji: "⭐" },
  ]);

  const handleStartPlaydate = (friend: PetFriend) => {
    if (stats.coins < 25) {
      alert("Playdates cost 25 coins!");
      return;
    }
    setStats((prev) => ({
      ...prev,
      coins: prev.coins - 25,
      happiness: Math.min(100, prev.happiness + 20),
    }));
    setActivePlaydate(friend);
    addXpAndCoins(25, 0);

    const newActivity: SocialActivity = {
      id: Date.now().toString(),
      actor: "You & Brownie",
      action: `started a park playdate with ${friend.petName}`,
      timestamp: "Just now",
      emoji: "🐾",
    };
    setSocialFeed([newActivity, ...socialFeed]);
  };

  // --- PAGE 10: SETTINGS HUB ---
  const [settings, setSettings] = useState({
    soundEnabled: true,
    petPersonality: "Playful" as "Playful" | "Calm" | "Curious" | "Energetic",
  });
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);

  const equippedHat = closetItems.find((i) => i.category === "hats" && i.equipped);

  const navItems = [
    { id: "dashboard", label: "Main Dashboard", icon: LayoutDashboard },
    { id: "chat", label: "AI Chatroom", icon: MessageSquare },
    { id: "status", label: "Status & Vitals", icon: Activity },
    { id: "arcade", label: "Minigames Arcade", icon: Gamepad2 },
    { id: "closet", label: "Closet Studio", icon: Shirt },
    { id: "quests", label: "Quests & Badges", icon: Trophy },
    { id: "diary", label: "Pet Diary", icon: BookOpen },
    { id: "shop", label: "Care Store & Bag", icon: ShoppingBag },
    { id: "community", label: "Community Hub", icon: Users },
    { id: "settings", label: "Settings Hub", icon: Settings },
  ];

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-950 text-slate-100">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-3 px-2 py-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xl">
            🐾
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide text-amber-400">
              Brownie AI
            </h1>
            <p className="text-xs text-slate-400">Virtual Pet Companion</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-400" size={16} />
            <span className="text-xs font-semibold text-slate-300">
              {stats.coins} Coins
            </span>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            Lvl {stats.level}
          </span>
        </div>
      </aside>

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col">
        {/* PAGE 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome back! 👋</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Brownie is excited to spend time with you!
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl flex items-center gap-2">
                <Smile className="text-amber-400" size={18} />
                <span className="text-sm font-medium text-slate-300">
                  Mood: <span className="text-amber-400 font-bold">{petMood}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-b from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[320px]">
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-36 h-36 bg-slate-800/80 border-2 border-amber-500/30 rounded-full flex items-center justify-center text-7xl shadow-xl animate-bounce relative">
                    {isSleeping ? "🐶💤" : "🐶"}
                    {equippedHat && (
                      <span className="absolute -top-3 text-3xl">{equippedHat.icon}</span>
                    )}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-amber-400">Brownie</h3>
                  <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full mt-1">
                    Level {stats.level} Companion
                  </span>
                </div>

                <div className="relative z-10 flex gap-4 mt-8">
                  <button
                    onClick={() => {
                      setStats((s) => ({ ...s, hunger: Math.min(100, s.hunger + 15) }));
                      addXpAndCoins(10, 0);
                      incrementQuestProgress("feed");
                      setPetMood("Yummy! 🍖");
                    }}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Utensils size={16} /> Quick Feed
                  </button>
                  <button
                    onClick={() => {
                      setStats((s) => ({ ...s, happiness: Math.min(100, s.happiness + 15) }));
                      addXpAndCoins(15, 0);
                      setPetMood("Excited! 🎾");
                    }}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Zap size={16} /> Belly Rub
                  </button>
                  <button
                    onClick={() => setIsSleeping(!isSleeping)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold px-4 py-2 rounded-xl transition-all"
                  >
                    <Moon size={16} /> {isSleeping ? "Wake Up" : "Sleep"}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Activity size={18} className="text-amber-400" /> Live Vitals
                </h3>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-400">Hunger</span>
                      <span className="text-slate-200">{stats.hunger}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-orange-400 h-full" style={{ width: `${stats.hunger}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-400">Happiness</span>
                      <span className="text-slate-200">{stats.happiness}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-pink-400 h-full" style={{ width: `${stats.happiness}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-400">Energy</span>
                      <span className="text-slate-200">{stats.energy}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full" style={{ width: `${stats.energy}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Level {stats.level} XP Progress</span>
                    <span>{stats.xp} / {stats.level * 100} XP</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all"
                      style={{ width: `${(stats.xp / (stats.level * 100)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: CHATROOM */}
        {activeTab === "chat" && (
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
                  🐶
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">Brownie Chat</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online & Listening
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    msg.sender === "user" ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-800 text-amber-400"
                  }`}>
                    {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`max-w-[75%] rounded-2xl p-4 text-sm ${
                    msg.sender === "user" ? "bg-amber-500 text-slate-950 font-medium" : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}>
                    <p>{msg.text}</p>
                    <span className="text-[10px] block mt-1 opacity-70">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
              {isTyping && <div className="text-xs text-slate-500 italic">Brownie is typing...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask Brownie something..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none"
              />
              <button
                onClick={handleSendMessage}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl transition-colors flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 3: STATUS & HEALTH DIAGNOSTICS */}
        {activeTab === "status" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Biological Health Diagnostic</h2>
              <p className="text-slate-400 text-sm mt-1">
                Real-time AI monitoring of Brownie&apos;s physical and emotional status.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { id: "overall", label: "Overall Fitness", val: "Optimal (98%)", color: "text-emerald-400" },
                { id: "hydration", label: "Hydration", val: `${stats.hunger}%`, color: "text-blue-400" },
                { id: "mind", label: "Synaptic Focus", val: "High (88%)", color: "text-purple-400" },
                { id: "stamina", label: "Stamina Reserve", val: `${stats.energy}%`, color: "text-amber-400" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveDiag(item.id as any)}
                  className={`p-5 rounded-2xl border text-left ${
                    activeDiag === item.id ? "bg-slate-900 border-amber-500/50" : "bg-slate-900/50 border-slate-800"
                  }`}
                >
                  <span className="text-xs text-slate-400">{item.label}</span>
                  <div className={`text-xl font-bold mt-2 ${item.color}`}>{item.val}</div>
                </button>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-lg text-amber-400 flex items-center gap-2">
                <Brain size={20} /> AI Recommendation Analysis
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeDiag === "hydration" && "Hydration is directly tied to feeding. Give Brownie a fresh snack from the Care Store to maximize vitality!"}
                {activeDiag === "mind" && "Brownie's neural engagement is peak when playing memory games in the arcade."}
                {activeDiag === "stamina" && "Stamina is currently balanced. Let Brownie take a short sleep session if energy drops below 30%."}
                {activeDiag === "overall" && "All vitals are functioning within target parameters! Maintain regular daily check-ins."}
              </p>
            </div>
          </div>
        )}

        {/* PAGE 4: MINIGAMES ARCADE */}
        {activeTab === "arcade" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Minigames Arcade 🎮</h2>
              <p className="text-slate-400 text-sm mt-1">Play games to earn Coins and boost XP!</p>
            </div>

            {activeGame === "none" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-4xl">🎾</div>
                    <h3 className="font-bold text-lg text-slate-100">Fetch Target Practice</h3>
                    <p className="text-xs text-slate-400">Click fast-moving targets to earn coins!</p>
                  </div>
                  <button
                    onClick={startFetchGame}
                    className="mt-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Play Fetch
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-4xl">🧠</div>
                    <h3 className="font-bold text-lg text-slate-100">Memory Paw-tzle</h3>
                    <p className="text-xs text-slate-400">Match treat cards to train Brownie&apos;s focus!</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveGame("memory");
                      setIsGameActive(true);
                      setGameTime(15);
                      setGameScore(0);
                    }}
                    className="mt-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Play Memory
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-4xl">🏃</div>
                    <h3 className="font-bold text-lg text-slate-100">Agility Hurdles</h3>
                    <p className="text-xs text-slate-400">Jump over approaching obstacle hurdles!</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveGame("hurdles");
                      setIsGameActive(true);
                      setGameTime(15);
                      setGameScore(0);
                    }}
                    className="mt-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-xl text-xs"
                  >
                    Play Hurdles
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[360px] relative">
                <div className="w-full flex justify-between max-w-md mb-6 text-sm font-bold">
                  <span>Score: <span className="text-amber-400">{gameScore}</span></span>
                  <span>Time: <span className="text-amber-400">{gameTime}s</span></span>
                </div>

                {activeGame === "fetch" && isGameActive && (
                  <button
                    onClick={handleFetchClick}
                    style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%` }}
                    className="absolute text-4xl p-2 bg-amber-500/20 rounded-full border border-amber-500/50"
                  >
                    🎾
                  </button>
                )}

                {activeGame === "memory" && isGameActive && (
                  <div className="grid grid-cols-2 gap-4">
                    {memoryCards.map((card, idx) => (
                      <button
                        key={card.id}
                        onClick={() => handleFlipCard(idx)}
                        className="w-20 h-20 bg-slate-800 border border-slate-700 rounded-xl text-3xl flex items-center justify-center"
                      >
                        {card.flipped ? card.icon: "❓"}
                      </button>
                    ))}
                  </div>
                )}

                {activeGame === "hurdles" && isGameActive && (
                  <div className="w-full max-w-md h-32 bg-slate-950 rounded-xl relative overflow-hidden flex items-end p-4">
                    <div className={`text-3xl transition-all ${isJumping ? "-translate-y-12" : "translate-y-0"}`}>
                      🐶
                    </div>
                    <div
                      style={{ left: `${hurdlePos}%` }}
                      className="absolute text-2xl bottom-4 transition-all"
                    >
                      🪵
                    </div>
                    <button
                      onClick={handleJumpHurdle}
                      className="absolute top-2 right-2 bg-amber-500 text-slate-950 px-3 py-1 text-xs font-bold rounded-lg"
                    >
                      Jump!
                    </button>
                  </div>
                )}

                {!isGameActive && (
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-bold text-amber-400">Game Over!</h3>
                    <p className="text-sm text-slate-300">You earned {gameScore * 15 + 20} Coins and +35 XP!</p>
                    <button
                      onClick={() => setActiveGame("none")}
                      className="bg-slate-800 px-4 py-2 text-xs font-bold rounded-xl"
                    >
                      Back to Arcade
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PAGE 5: CLOSET STUDIO */}
        {activeTab === "closet" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Closet Studio 👔</h2>
              <p className="text-slate-400 text-sm mt-1">Dress up Brownie with hats and accessories!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {closetItems.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-between space-y-4">
                  <div className="text-5xl">{item.icon}</div>
                  <div className="text-center">
                    <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                    <span className="text-[10px] text-slate-500 uppercase">{item.rarity}</span>
                  </div>
                  <button
                    onClick={() => handleEquipOrBuy(item)}
                    className={`w-full py-2 rounded-xl text-xs font-bold ${
                      item.purchased
                        ? item.equipped
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-200"
                        : "bg-amber-500 hover:bg-amber-600 text-slate-950"
                    }`}
                  >
                    {item.purchased ? (item.equipped ? "Equipped" : "Equip") : `Buy (${item.price} Coins)`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 6: QUESTS & ACHIEVEMENTS */}
        {activeTab === "quests" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Quests & Badges 🏆</h2>
              <p className="text-slate-400 text-sm mt-1">Complete daily tasks to gain XP and level up!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quests.map((q) => {
                const isReady = q.current >= q.target;
                return (
                  <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">{q.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">{q.description}</p>
                      <span className="text-[10px] text-amber-400 mt-2 block font-semibold">
                        Reward: +{q.rewardCoins} Coins, +{q.rewardXp} XP
                      </span>
                    </div>
                    <button
                      onClick={() => claimQuestReward(q)}
                      disabled={!isReady || q.claimed}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${
                        q.claimed
                          ? "bg-slate-800 text-slate-500"
                          : isReady
                          ? "bg-amber-500 text-slate-950"
                          : "bg-slate-800 text-slate-500 opacity-60"
                      }`}
                    >
                      {q.claimed ? "Claimed" : isReady ? "Claim" : `${q.current}/${q.target}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PAGE 7: PET DIARY */}
        {activeTab === "diary" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Pet Diary & Memories 📖</h2>
              <p className="text-slate-400 text-sm mt-1">Save your favorite memories with Brownie!</p>
            </div>

            <form onSubmit={handleSaveDiaryEntry} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-200">Write New Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Entry Title..."
                  value={diaryTitle}
                  onChange={(e) => setDiaryTitle(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                />
                <select
                  value={diaryCategory}
                  onChange={(e) => setDiaryCategory(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="Fun">Fun</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Care">Care</option>
                  <option value="Health">Health</option>
                </select>
              </div>
              <textarea
                placeholder="Write your note here..."
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
              >
                Save Memory Entry
              </button>
            </form>

            <div className="space-y-4">
              {diaryEntries.map((entry) => (
                <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex gap-4">
                  <div className="text-3xl">{entry.emoji}</div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{entry.title}</h4>
                    <span className="text-[10px] text-amber-400 font-semibold">{entry.category} • {entry.date}</span>
                    <p className="text-xs text-slate-300 mt-2">{entry.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 8: CARE STORE & PET BACKPACK BAG */}
        {activeTab === "shop" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Care Store & Pet Bag 🛍️</h2>
                <p className="text-slate-400 text-sm mt-1">Buy treats and use owned items from your pet bag!</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-amber-400">
                {stats.coins} Coins
              </div>
            </div>

            {/* PET BACKPACK / SHELF INVENTORY */}
            <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                🎒 My Pet Bag / Pantry Shelf
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {storeItems.map((item) => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between items-center text-center">
                    <div className="text-3xl mb-1">{item.icon}</div>
                    <h4 className="font-bold text-xs text-slate-200">{item.name}</h4>
                    <span className="text-[10px] text-slate-400 mt-0.5">In Stock: {item.quantityOwned}</span>
                    <button
                      onClick={() => handleUseInventoryItem(item)}
                      disabled={item.quantityOwned <= 0}
                      className={`mt-3 w-full py-1.5 rounded-lg text-xs font-bold ${
                        item.quantityOwned > 0 ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-600"
                      }`}
                    >
                      Use / Feed
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* STORE ITEMS PURCHASING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {storeItems.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
                  <div className="text-4xl">{item.icon}</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{item.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                  </div>
                  <button
                    onClick={() => handleBuyStoreItem(item)}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold py-2 rounded-xl text-xs border border-slate-700"
                  >
                    Buy ({item.price} Coins)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 9: COMMUNITY HUB */}
        {activeTab === "community" && (
          <div className="max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Community Hub 🌐</h2>
              <p className="text-slate-400 text-sm mt-1">Connect with neighbor pet owners and set playdates!</p>
            </div>

            {activePlaydate && (
              <div className="bg-purple-900/30 border border-purple-500/40 rounded-2xl p-6 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{activePlaydate.petAvatar}</div>
                  <div>
                    <h3 className="font-bold text-slate-100">Active Playdate with {activePlaydate.petName}!</h3>
                    <p className="text-xs text-slate-300">Brownie & {activePlaydate.petName} are having fun in the park.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePlaydate(null)}
                  className="bg-slate-800 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold"
                >
                  End Playdate
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <div key={friend.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{friend.petAvatar}</div>
                    <div>
                      <h4 className="font-bold text-slate-100 text-sm">{friend.petName}</h4>
                      <p className="text-xs text-slate-400">Owner: {friend.ownerName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStartPlaydate(friend)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-xl text-xs"
                  >
                    Start Playdate (25 Coins)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAGE 10: SETTINGS HUB */}
        {activeTab === "settings" && (
          <div className="max-w-4xl mx-auto w-full space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings Hub ⚙️</h2>
                <p className="text-slate-400 text-sm mt-1">Configure pet behavior and application audio.</p>
              </div>
              {saveSettingsSuccess && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  Settings Saved!
                </span>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-200">Pet AI Trait Persona</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["Playful", "Calm", "Curious", "Energetic"] as const).map((trait) => (
                    <button
                      key={trait}
                      onClick={() => setSettings({ ...settings, petPersonality: trait })}
                      className={`p-3 rounded-xl text-xs font-bold border ${
                        settings.petPersonality === trait ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-slate-950 border-slate-800 text-slate-400"
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex gap-4">
                <button
                  onClick={() => {
                    setSaveSettingsSuccess(true);
                    setTimeout(() => setSaveSettingsSuccess(false), 2500);
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
{/* Dynamic Animated Health Metric Bar */}
<div className="w-full bg-amber-100 h-4 rounded-full overflow-hidden p-0.5 shadow-inner">
  <div 
    className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
    style={{ width: "${healthScore}%" }}
  />
</div>
{/* Floating Avatar with Level-Up Glow */}
<div className="relative flex justify-center items-center my-6">
  <div className="brownie-avatar animate-brownie-idle relative z-10">
    <img src="/brownie-pet.png" alt="Brownie" className="w-48 h-48 object-contain" />
  </div>
  {/* Soft Background Glow */}
  <div className="absolute w-40 h-40 bg-amber-200/60 rounded-full blur-2xl -z-0" />
</div>
{/* Pet Bag Pantry Shelf Item */}
<div className="pet-card p-4 flex flex-col items-center hover:scale-105 transition-transform duration-200 cursor-pointer">
  <span className="text-3xl mb-1">🦴</span>
  <span className="font-bold text-sm text-amber-900">Bone Treat</span>
  <button className="btn-tactile text-xs mt-2 py-1 px-3">
    Feed
  </button>
</div>
