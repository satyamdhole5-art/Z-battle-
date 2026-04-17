/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Home, Trophy, Wallet, User, Shield, LogIn, ChevronRight, Share2, Plus, Trash2, Edit2, CheckCircle, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Components
const BottomNav = () => {
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-brand-card/90 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-2 z-50">
            <Link to="/" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive("/") ? "text-brand-primary" : "text-gray-400"}`}>
                <Home size={22} />
                <span className="text-[10px] mt-1 font-medium">Home</span>
            </Link>
            <Link to="/my-tournaments" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive("/my-tournaments") ? "text-brand-primary" : "text-gray-400"}`}>
                <Trophy size={22} />
                <span className="text-[10px] mt-1 font-medium">My Plays</span>
            </Link>
            <Link to="/wallet" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive("/wallet") ? "text-brand-primary" : "text-gray-400"}`}>
                <Wallet size={22} />
                <span className="text-[10px] mt-1 font-medium">Wallet</span>
            </Link>
            <Link to="/profile" className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isActive("/profile") ? "text-brand-primary" : "text-gray-400"}`}>
                <User size={22} />
                <span className="text-[10px] mt-1 font-medium">Profile</span>
            </Link>
        </nav>
    )
};

const Header = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const location = useLocation();

    useEffect(() => {
        fetch("/api/user")
            .then(res => res.json())
            .then(data => setBalance(data.balance))
            .catch(() => setBalance(0));
    }, [location]);

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-brand-card/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 z-50">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center font-bold text-black italic">AP</div>
                <h1 className="font-bold tracking-tight text-white uppercase text-sm italic">Adept Play</h1>
            </div>
            <div className="flex items-center space-x-3">
                <Link to="/admin" className="p-2 text-gray-400 hover:text-white transition-colors">
                    <Shield size={20} />
                </Link>
                <Link to="/wallet" className="flex items-center space-x-1.5 bg-white/5 px-2.5 py-1 rounded-full border border-white/10 active:scale-95 transition-transform">
                    <span className="text-brand-primary font-bold text-xs leading-none">₹</span>
                    <span className="text-white text-xs font-bold leading-none">
                        {balance !== null ? balance.toFixed(2) : "..."}
                    </span>
                </Link>
            </div>
        </header>
    )
}

// Pages
const HomePage = () => {
    const [tournaments, setTournaments] = useState<{ id: string, name: string, prize: string, entry: string, game: string, maxPlayers?: string }[]>([]);
    const [fetching, setFetching] = useState(true);
    const [showInstall, setShowInstall] = useState(false);

    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
        if (isMobile && !isStandalone) setShowInstall(true);

        fetch("/api/tournaments")
            .then(res => res.json())
            .then(data => {
                setTournaments(data);
                setFetching(false);
            })
            .catch(() => setFetching(false));
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-16 pb-24 px-4 space-y-6"
        >
            {showInstall && (
                <section className="bg-brand-primary/10 border border-brand-primary/30 p-5 rounded-3xl relative overflow-hidden group">
                    <div className="flex items-start space-x-4 relative z-10">
                        <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-black shadow-xl shrink-0">
                            <Plus size={24} strokeWidth={3} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white uppercase italic">Install Mobile App</h3>
                            <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed">Tap your browser menu & select <span className="text-brand-primary">"Install App"</span> or <span className="text-brand-primary">"Add to Home Screen"</span> to download this to your phone!</p>
                        </div>
                    </div>
                </section>
            )}

            <section className="relative h-44 rounded-2xl overflow-hidden group">
                <img 
                    src="https://picsum.photos/seed/freefire/800/400" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                    alt="Hero"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                    <h2 className="text-xl font-black text-white uppercase italic leading-none">Weekly Masters Cup</h2>
                    <p className="text-brand-primary font-bold text-xs mt-1 uppercase tracking-wider">Win ₹10,000 Total Pool</p>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Live Tournaments</h3>
                    <Link to="/" className="text-[10px] text-brand-primary font-black uppercase flex items-center tracking-tighter hover:opacity-80 transition-opacity">VIEW ALL <ChevronRight size={14} /></Link>
                </div>

                <div className="space-y-4">
                    {fetching ? (
                         <div className="py-20 text-center text-[10px] text-gray-700 font-bold uppercase tracking-widest italic animate-pulse">Scanning Grid...</div>
                    ) : tournaments.map((t) => (
                        <TournamentCard key={t.id} id={t.id} data={t} />
                    ))}
                </div>
            </section>
        </motion.div>
    )
}

interface TournamentCardProps {
    id: string;
    data: any;
    key?: string | number;
}

const TournamentCard = ({ id, data }: TournamentCardProps) => {
    return (
        <Link to={`/tournament/${id}`} className="bg-brand-card border border-white/5 rounded-2xl overflow-hidden active:scale-95 transition-transform block shadow-lg">
            <div className="relative h-36">
                <img src={`https://picsum.photos/seed/game${id}/600/300`} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" alt="Tournament" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-card via-transparent to-transparent"></div>
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm border border-brand-primary/30 px-2.5 py-1 rounded-md text-[10px] font-black text-brand-primary uppercase tracking-wider shadow-sm">LIVE</div>
                <div className="absolute bottom-2 right-2 bg-brand-primary text-black px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight shadow-sm">₹{data.entry} ENTRY</div>
                <div className="absolute bottom-2 left-2 flex items-center space-x-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">Slots: 48/{data.maxPlayers || "50"}</span>
                </div>
            </div>
            <div className="p-4 flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-white uppercase text-sm leading-tight italic">{data.name}</h4>
                    <p className="text-brand-primary/80 text-[10px] uppercase font-black mt-1 tracking-tighter">MAP: Bermuda • GENRE: {data.game}</p>
                </div>
                <div className="text-right">
                    <p className="text-gray-500 text-[9px] uppercase font-black leading-none">Prize Pool</p>
                    <p className="text-white font-black text-base italic leading-none mt-1">₹{data.prize}</p>
                </div>
            </div>
        </Link>
    )
}

const TournamentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        fetch(`/api/tournaments/${id}`)
            .then(res => res.json())
            .then(data => {
                setTournament(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await fetch("/api/tournaments/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tournamentId: id })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Successfully Joined ${tournament.name}! Your new balance is ₹${data.newBalance.toFixed(2)}`);
                navigate("/");
            } else {
                alert(data.error || "Failed to join tournament");
            }
        } catch (e) {
            alert("Network error. Deployment failed.");
        } finally {
            setJoining(false);
        }
    };

    if (loading) return (
        <div className="bg-brand-bg min-h-screen flex items-center justify-center">
            <div className="text-[10px] text-gray-700 font-black uppercase tracking-[0.5em] animate-pulse">Syncing Mission Data...</div>
        </div>
    );

    if (!tournament) return (
        <div className="bg-brand-bg min-h-screen flex flex-col items-center justify-center p-10 text-center">
             <Trophy size={60} className="text-gray-800 mb-4" />
             <p className="text-white font-black uppercase italic tracking-tighter">Tournament Terminated or Not Found</p>
             <button onClick={() => navigate("/")} className="mt-6 text-brand-primary text-[10px] font-black uppercase tracking-widest border border-brand-primary/20 px-6 py-3 rounded-full">Abort to HQ</button>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-brand-bg min-h-screen pb-32 relative"
        >
            <div className="relative h-64">
                <img src={`https://picsum.photos/seed/game${id}/1200/600`} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Detail" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-black/40"></div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform"
                >
                    <ChevronRight className="rotate-180" size={24} />
                </button>
                <div className="absolute bottom-6 left-4 right-4">
                    <h1 className="text-3xl font-black text-white uppercase italic leading-none">{tournament.name}</h1>
                    <div className="flex items-center space-x-2 mt-3">
                        <span className="bg-brand-primary/20 text-brand-primary border border-brand-primary/30 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{tournament.game}</span>
                        <span className="bg-white/10 text-gray-300 border border-white/10 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">Bermuda Pro</span>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-brand-card p-4 rounded-2xl border border-white/5 text-center shadow-lg">
                        <p className="text-gray-500 text-[9px] uppercase font-black">Prize Pool</p>
                        <p className="text-brand-primary text-sm font-black mt-1 uppercase italic tracking-tighter leading-none">₹{tournament.prize}</p>
                    </div>
                    <div className="bg-brand-card p-4 rounded-2xl border border-white/5 text-center shadow-lg">
                        <p className="text-gray-500 text-[9px] uppercase font-black">Entry Fee</p>
                        <p className="text-white text-sm font-black mt-1 uppercase italic tracking-tighter leading-none">₹{tournament.entry}</p>
                    </div>
                    <div className="bg-brand-card p-4 rounded-2xl border border-white/5 text-center shadow-lg">
                        <p className="text-gray-500 text-[9px] uppercase font-black">Slots</p>
                        <p className="text-white text-sm font-black mt-1 uppercase italic tracking-tighter leading-none text-blue-400">48/{tournament.maxPlayers || "50"}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.2em]">Deployment Instructions</h3>
                    <div className="bg-brand-card rounded-2xl border border-white/5 p-5 space-y-5 shadow-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">Reporting Time</span>
                            <span className="text-[11px] text-white font-black uppercase italic">21:00 PM (Sharp)</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">Battle Arena</span>
                            <span className="text-[11px] text-white font-black uppercase italic">Bermuda</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-tight">League Format</span>
                            <span className="text-[11px] text-white font-black uppercase italic">Solo Survival</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold text-gray-500 uppercase text-[10px] tracking-[0.2em]">Code of Conduct</h3>
                    <ul className="text-[12px] text-gray-400 space-y-3 list-none leading-relaxed px-1">
                        <li className="flex items-start space-x-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                             <span>Minimum Player Level: <span className="text-white font-bold">LVL 40+</span> required for entry.</span>
                        </li>
                        <li className="flex items-start space-x-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0"></div>
                             <span>Zero Tolerance Policy: Teaming or illegal script usage results in <span className="text-red-500 font-bold uppercase">Immediate Ban</span>.</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="fixed bottom-20 left-4 right-4 z-40">
                <button 
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center space-x-2 shadow-2xl shadow-brand-primary/20 italic disabled:opacity-50"
                >
                    {joining ? "DEPLOYING TO ARENA..." : `ENLIST NOW - ₹${tournament.entry}`}
                </button>
            </div>
        </motion.div>
    )
}

const WalletPage = () => {
    const [userData, setUserData] = useState<{ balance: number, transactions: any[] }>({ balance: 0, transactions: [] });
    const [fetching, setFetching] = useState(true);
    const [amount, setAmount] = useState("50");
    const [isDemo, setIsDemo] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        // Check for success redirect
        const params = new URLSearchParams(location.search);
        if (params.get("mode") === "demo") setIsDemo(true);
        if (params.get("payment") === "success" && params.get("amount")) {
            fetch(`/api/payment/sync?status=success&amount=${params.get("amount")}`)
                .then(() => navigate("/wallet", { replace: true }));
        }

        fetch("/api/user")
            .then(res => res.json())
            .then(data => {
                setUserData(data);
                setFetching(false);
            })
            .catch(() => setFetching(false));
    }, [location]);

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="pt-20 pb-24 px-4 space-y-8"
        >
            <div className="bg-gradient-to-br from-brand-primary to-[#FF9E00] rounded-[2.5rem] p-7 text-black shadow-2xl relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-20%] opacity-20 blur-3xl w-60 h-60 bg-white rounded-full transition-transform group-hover:scale-110 duration-700"></div>
                <div className="flex justify-between items-start">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80">Battle Wallet Balance</p>
                    {isDemo && <span className="text-[8px] bg-black/10 px-2 py-0.5 rounded-full font-black uppercase">Demo Active</span>}
                </div>
                <div className="flex items-baseline space-x-1.5 mt-3">
                    <span className="text-2xl font-black italic">₹</span>
                    <h2 className="text-6xl font-black italic tracking-tighter">
                        {fetching ? "..." : userData.balance.toFixed(2)}
                    </h2>
                </div>
            </div>

            <div className="bg-brand-card rounded-[2rem] border border-white/5 p-6 shadow-xl space-y-4">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Load Combat Credits</h3>
                <form action="/api/payment/create-checkout" method="POST" className="space-y-4">
                    <div className="flex bg-brand-bg rounded-2xl border border-white/10 p-4 items-center">
                        <span className="text-brand-primary font-black text-lg p-1 italic leading-none">₹</span>
                        <input 
                            name="amount"
                            type="number" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-transparent border-none outline-none text-white font-black text-2xl ml-2 w-full placeholder-gray-800"
                            placeholder="Amount"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {["50", "100", "500"].map(val => (
                            <button 
                                key={val}
                                type="button" 
                                onClick={() => setAmount(val)}
                                className={`py-2 rounded-xl text-[10px] font-black border transition-all ${amount === val ? "bg-brand-primary text-black border-brand-primary" : "bg-white/5 text-gray-400 border-white/5"}`}
                            >
                                ₹{val}
                            </button>
                        ))}
                    </div>
                    <button type="submit" className="w-full bg-brand-primary text-black font-black py-4 rounded-2xl uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center space-x-2 shadow-xl mt-2 italic">
                        <Plus size={18} strokeWidth={3} /> <span>Initialize Deposit</span>
                    </button>
                </form>
            </div>

            <div className="space-y-5 px-1">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Service History</h3>
                <div className="space-y-4">
                    {userData.transactions.length === 0 ? (
                        <div className="bg-brand-card p-10 rounded-3xl border border-white/5 text-center text-[10px] text-gray-600 font-black uppercase tracking-widest italic">
                            No combat logs found
                        </div>
                    ) : userData.transactions.map(txn => (
                        <div key={txn.id} className="bg-brand-card px-5 py-4 rounded-[1.5rem] border border-white/5 flex justify-between items-center shadow-md">
                            <div className="flex items-center space-x-4">
                                <div className={`w-11 h-11 rounded-[0.8rem] flex items-center justify-center ${txn.type === "Deposit" ? "bg-green-500/10 border border-green-500/20" : "bg-brand-primary/10 border border-brand-primary/20"}`}>
                                    {txn.type === "Deposit" ? <Plus size={18} className="text-green-500" /> : <Trophy size={18} className="text-brand-primary" />}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase italic tracking-tight">{txn.type === "Deposit" ? "Wallet Topup" : "Tournament Entry"}</p>
                                    <p className="text-[8px] text-gray-500 uppercase mt-1 font-black tracking-widest">{new Date(txn.date).toLocaleDateString()} • {txn.id}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`text-sm font-black italic leading-none ${txn.type === "Deposit" ? "text-green-500" : "text-red-500"}`}>
                                    {txn.type === "Deposit" ? "+" : "-"} ₹{txn.amount}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

const ProfilePage = () => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-20 pb-24 px-4 space-y-10"
        >
            <div className="flex flex-col items-center">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full border-[3px] border-brand-primary p-1.5 bg-brand-bg relative overflow-hidden transition-transform group-hover:rotate-12 duration-500">
                        <img src="https://api.dicebear.com/7.x/pixel-art/svg?seed=Adept99" className="w-full h-full rounded-full bg-brand-card object-cover" alt="Avatar" />
                    </div>
                    <button className="absolute bottom-0 right-0 bg-brand-primary w-9 h-9 rounded-full flex items-center justify-center text-black border-4 border-brand-bg shadow-xl active:scale-90 transition-transform">
                        <Plus size={18} />
                    </button>
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase italic shadow-md">VIP</div>
                </div>
                <h2 className="mt-6 text-2xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">PLAYER_ADEPT_09</h2>
                <div className="mt-2 flex items-center space-x-2">
                    <span className="text-[10px] text-brand-primary font-black uppercase tracking-[0.2em]">Master Rank</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Elite Tier IV</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-card p-5 rounded-[1.8rem] border border-white/5 flex flex-col items-center text-center shadow-lg hover:border-brand-primary/20 transition-colors">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Wars Fought</p>
                    <p className="text-3xl font-black text-white italic mt-1 leading-none">42</p>
                </div>
                <div className="bg-brand-card p-5 rounded-[1.8rem] border border-white/5 flex flex-col items-center text-center shadow-lg hover:border-brand-primary/20 transition-colors">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Victories</p>
                    <p className="text-3xl font-black text-brand-primary italic mt-1 leading-none">12</p>
                </div>
            </div>

            <div className="bg-brand-card rounded-[2rem] border border-white/5 overflow-hidden divide-y divide-white/2 shadow-xl mb-4">
                {[
                    { icon: Shield, label: "Vault & Security", color: "text-blue-400" },
                    { 
                        icon: Share2, 
                        label: "Recruit Allies (Share)", 
                        color: "text-green-400",
                        onClick: () => {
                            const url = `${window.location.origin}/download`;
                            navigator.clipboard.writeText(url);
                            alert(`Recruitment Link Copied: ${url}`);
                        }
                    },
                    { icon: User, label: "Personal Dossier", color: "text-purple-400" },
                    { icon: LogIn, label: "Extract (Logout)", color: "text-red-500" },
                ].map((item, idx) => (
                    <button 
                        key={idx} 
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between p-5 active:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded-lg bg-white/3 flex items-center justify-center transition-transform group-hover:scale-110">
                                <item.icon size={18} className={item.color} />
                            </div>
                            <span className="text-xs font-black text-white px-1 uppercase tracking-wider">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className="text-gray-700 transition-transform group-hover:translate-x-1" />
                    </button>
                ))}
            </div>
            
            <p className="text-center text-[9px] text-gray-700 font-black uppercase tracking-[0.4em] pt-4">Adept Play v2.4.0 • 2026</p>
        </motion.div>
    )
}

const AdminPanel = () => {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [editData, setEditData] = useState<any>(null);

    useEffect(() => {
        fetch("/api/tournaments")
            .then(res => res.json())
            .then(data => setTournaments(data));
    }, []);

    const resetForm = () => setEditData(null);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-20 pb-40 px-4 space-y-10"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Command Center</h2>
                    <p className="text-white font-black text-lg italic uppercase mt-1">Admin Dashboard</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-card p-5 rounded-3xl border border-white/5 shadow-lg">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Combatants</p>
                    <p className="text-2xl font-black text-white mt-1 italic">1,242</p>
                </div>
                <div className="bg-brand-card p-5 rounded-3xl border border-white/5 shadow-lg">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Missions</p>
                    <p className="text-2xl font-black text-brand-primary mt-1 italic">{tournaments.length}</p>
                </div>
            </div>

            <div className="bg-brand-card rounded-[2rem] border border-white/5 p-6 shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] flex items-center space-x-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${editData ? "bg-blue-500 shadow-[0_0_10px_#3B82F6]" : "bg-brand-primary shadow-[0_0_10px_#FF6B00]"}`}></div>
                        <span>{editData ? `Editing Mission: ${editData.id}` : "Commission New War"}</span>
                    </h3>
                    {editData && (
                        <button onClick={resetForm} className="text-[9px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Cancel Mission Edit</button>
                    )}
                </div>
                
                <form action={editData ? "/api/admin/edit-tournament" : "/api/admin/create-tournament"} method="POST" className="space-y-4">
                    {editData && <input type="hidden" name="id" value={editData.id} />}
                    
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Tournament Name</label>
                        <input name="name" type="text" required defaultValue={editData?.name || ""} placeholder="e.g. Pro Masters Qualifier" className="w-full bg-brand-bg border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder-gray-700 outline-none focus:border-brand-primary transition-colors" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Game Universe</label>
                            <select name="game" required defaultValue={editData?.game || "Free Fire"} className="w-full bg-brand-bg border border-white/10 rounded-xl p-3 text-xs font-bold text-white outline-none focus:border-brand-primary transition-colors appearance-none decoration-transparent">
                                <option value="Free Fire">Free Fire Max</option>
                                <option value="BGMI">BGMI</option>
                                <option value="COD Mobile">COD Mobile</option>
                                <option value="Standoff 2">Standoff 2</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Max Players</label>
                            <input name="maxPlayers" type="number" required defaultValue={editData?.maxPlayers || ""} placeholder="50" className="w-full bg-brand-bg border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder-gray-700 outline-none focus:border-brand-primary transition-colors" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Entry Fee (₹)</label>
                            <input name="entryFee" type="number" required defaultValue={editData?.entry || ""} placeholder="50" className="w-full bg-brand-bg border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder-gray-700 outline-none focus:border-brand-primary transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">Prize Pool (₹)</label>
                            <input name="prizePool" type="number" required defaultValue={editData?.prize || ""} placeholder="5000" className="w-full bg-brand-bg border border-white/10 rounded-xl p-3 text-xs font-bold text-white placeholder-gray-700 outline-none focus:border-brand-primary transition-colors" />
                        </div>
                    </div>

                    <button type="submit" className={`w-full text-black font-black py-4 rounded-2xl uppercase tracking-tighter active:scale-95 transition-all shadow-xl mt-2 ${editData ? "bg-blue-500 shadow-blue-500/20" : "bg-brand-primary shadow-brand-primary/30"}`}>
                        {editData ? "Update Mission Specs" : "Deploy Tournament"}
                    </button>
                </form>
            </div>

            <div className="space-y-5 px-1">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Live War Logs (Manage)</h3>
                <div className="space-y-4">
                    {tournaments.length === 0 ? (
                        <div className="bg-brand-card p-10 rounded-3xl border border-white/5 text-center text-[10px] text-gray-600 font-black uppercase tracking-widest italic animate-pulse">Scanning Archive...</div>
                    ) : tournaments.map(t => (
                        <div key={t.id} className="bg-brand-card p-5 rounded-[1.8rem] border border-white/5 flex justify-between items-center shadow-md">
                            <div className="flex-1">
                                <h4 className="text-xs font-black text-white uppercase italic truncate pr-4">{t.name}</h4>
                                <p className="text-[8px] text-gray-500 uppercase mt-1 font-black tracking-widest">{t.game} • {t.maxPlayers} Slots</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button 
                                    onClick={() => {
                                        setEditData(t);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                    className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 active:scale-90 transition-transform hover:bg-blue-500 hover:text-black"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <form action="/api/admin/delete-tournament" method="POST" onSubmit={(e) => !confirm(`Erase Tournament: ${t.name}?`) && e.preventDefault()}>
                                    <input type="hidden" name="id" value={t.id} />
                                    <button 
                                        type="submit"
                                        className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 active:scale-90 transition-transform hover:bg-red-500 hover:text-black"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="bg-red-500/5 rounded-3xl p-5 border border-red-500/10 mb-8">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">Security Level: Maximum Alpha</p>
            </div>
        </motion.div>
    )
}

const DownloadPage = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Detect iOS
        const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(ios);

        // Detect if already installed / running as standalone PWA
        if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
            setIsInstalled(true);
        }

        // Capture Chrome's native install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else if (isIOS) {
            alert("Apple users: Tap the Share button (↑) at the bottom of Safari and select 'Add to Home Screen'.");
        } else {
            alert("To install: Tap the 3 dots menu (⋮) in Chrome and select 'Install App' or 'Add to Home Screen'.");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col min-h-screen bg-brand-bg relative overflow-hidden"
        >
            {/* Massive Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[500px] bg-brand-primary/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center space-y-12 relative z-10 py-12">
                <motion.div 
                    initial={{ scale: 0.8, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="w-36 h-36 rounded-[2.5rem] bg-gradient-to-br from-[#FF8A00] to-brand-primary flex items-center justify-center font-black text-6xl text-black italic shadow-[0_20px_60px_rgba(255,107,0,0.4)] border border-white/20"
                >
                    AP
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h1 className="font-black text-white text-5xl italic tracking-tight leading-none">
                        ADEPT<br/><span className="text-brand-primary">PLAY</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.3em]">The Elite Arena</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-sm"
                >
                    {isInstalled ? (
                        <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-[2rem] w-full backdrop-blur-xl">
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-500 w-6 h-6" />
                            </div>
                            <p className="text-green-500 font-black uppercase tracking-widest text-sm mb-2">Systems Active</p>
                            <p className="text-gray-400 text-xs">App is installed and running natively.</p>
                            <Link to="/" className="mt-6 block w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-sm">
                                Enter Arena
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <button 
                                onClick={handleInstallClick}
                                className="w-full bg-brand-primary text-black font-black py-6 rounded-[2rem] uppercase tracking-widest text-xl shadow-[0_10px_40px_rgba(255,107,0,0.4)] active:scale-95 transition-all outline outline-offset-4 outline-transparent hover:outline-brand-primary/50"
                            >
                                {deferredPrompt ? "Install App Now" : "Get The App"}
                            </button>
                            
                            <div className="bg-brand-card/50 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 text-left">
                                <h3 className="text-white font-black uppercase text-xs tracking-widest mb-5 flex items-center gap-2 text-center justify-center">
                                    <Terminal className="w-4 h-4 text-brand-primary" />
                                    Installation Guide
                                </h3>
                                {isIOS ? (
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-brand-primary">1</div>
                                            <p className="text-[11px] text-gray-400 font-bold flex-1">Open this link in <span className="text-white">Safari</span></p>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-brand-primary">2</div>
                                            <p className="text-[11px] text-gray-400 font-bold flex-1">Tap the central <span className="text-white">Share (↑)</span> icon</p>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-brand-primary">3</div>
                                            <p className="text-[11px] text-gray-400 font-bold flex-1">Scroll down & tap <span className="text-brand-primary">"Add to Home Screen"</span></p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-brand-primary">1</div>
                                            <p className="text-[11px] text-gray-400 font-bold flex-1">Open this link in <span className="text-white">Google Chrome</span></p>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-brand-primary">2</div>
                                            <p className="text-[11px] text-gray-400 font-bold flex-1">Tap the <span className="text-white">3 dots (⋮)</span> top right</p>
                                        </div>
                                        <div className="flex gap-4 items-center">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-brand-primary">3</div>
                                            <p className="text-[11px] text-gray-400 font-bold flex-1">Select <span className="text-brand-primary">"Install App"</span></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
                
                {!isInstalled && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <Link to="/" className="text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest pt-4 block border-b border-gray-500/30 pb-1 pb-4">
                            Proceed to Web Prototype
                        </Link>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Disable zoom and context menu as requested
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
            e.preventDefault();
        }
    }
    document.addEventListener('keydown', handleKeyDown);

    // Skip loading screen if directly on download page
    if (window.location.pathname === "/download") {
        setLoading(false);
    } else {
        setTimeout(() => setLoading(false), 2500);
    }

    return () => {
        document.removeEventListener("contextmenu", handleContextMenu);
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <BrowserRouter>
      <AppContent loading={loading} />
    </BrowserRouter>
  );
}

const AppContent = ({ loading }: { loading: boolean }) => {
    const location = useLocation();

    return (
      <AnimatePresence mode="wait">
        {loading ? (
            <motion.div 
                key="loader"
                exit={{ opacity: 0, scale: 1.1 }}
                className="fixed inset-0 bg-brand-bg flex items-center justify-center z-[100]"
            >
                <div className="flex flex-col items-center">
                    <motion.div 
                        initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            repeat: Infinity, 
                            duration: 1.5, 
                            repeatType: "mirror" 
                        }}
                        className="w-20 h-20 rounded-[1.5rem] bg-brand-primary flex items-center justify-center font-bold text-4xl text-black italic shadow-[0_0_50px_rgba(255,107,0,0.4)]"
                    >
                        AP
                    </motion.div>
                    <motion.h1 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 font-black text-white tracking-[0.3em] uppercase text-xl italic"
                    >
                        Adept Play
                    </motion.h1>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: 120 }}
                        transition={{ duration: 2, ease: "linear" }}
                        className="h-1 bg-brand-primary mt-4 rounded-full opacity-50"
                    ></motion.div>
                </div>
            </motion.div>
        ) : (
            <div key="content" className="max-w-md mx-auto min-h-screen bg-brand-bg relative outline outline-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                {location.pathname !== "/download" && <Header />}
                
                <AnimatePresence mode="wait">
                    <Routes location={location} key={location.pathname}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/download" element={<DownloadPage />} />
                        <Route path="/download/" element={<DownloadPage />} />
                        <Route path="/tournament/:id" element={<TournamentDetail />} />
                        <Route path="/wallet" element={<WalletPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/admin" element={<AdminPanel />} />
                        <Route path="/my-tournaments" element={<div className="pt-28 px-4 text-center text-gray-700 text-[10px] uppercase font-black tracking-[0.3em]">Sector Empty • No Active Ops</div>} />
                        <Route path="*" element={<HomePage />} />
                    </Routes>
                </AnimatePresence>
                
                {location.pathname !== "/download" && <BottomNav />}
            </div>
        )}
      </AnimatePresence>
    )
}
