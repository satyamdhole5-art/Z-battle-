import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

let stripeClient: Stripe | null = null;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  
  if (!key || key.trim() === "" || key === "50") {
    throw new Error("STRIPE_SECRET_KEY is missing. Please add your 'sk_test_...' or 'sk_live_...' key in the Settings menu.");
  }

  if (!key.startsWith("sk_")) {
    throw new Error(`Invalid Stripe Key format: Your key starts with '${key.substring(0, 3)}'. It should start with 'sk_'. Please check your Settings.`);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-01-27.acacia" as any
    });
  }
  return stripeClient;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOURNAMENTS_FILE = path.join(__dirname, "tournaments.json");
const USER_DATA_FILE = path.join(__dirname, "user_data.json");

// Local storage helpers
const getTournaments = () => {
  if (fs.existsSync(TOURNAMENTS_FILE)) {
    return JSON.parse(fs.readFileSync(TOURNAMENTS_FILE, "utf-8"));
  }
  return [
    { id: "1", name: "Solo Rush - Ranked Day", prize: "5000", entry: "50", game: "Free Fire", maxPlayers: "50" },
    { id: "2", name: "Weekend Masters Cup", prize: "10000", entry: "100", game: "PUBG Mobile", maxPlayers: "100" },
    { id: "3", name: "Duo Dash - Midnight", prize: "3500", entry: "30", game: "Call of Duty", maxPlayers: "60" }
  ];
};

const getUserData = () => {
  if (fs.existsSync(USER_DATA_FILE)) {
    return JSON.parse(fs.readFileSync(USER_DATA_FILE, "utf-8"));
  }
  return { balance: 50.00, transactions: [] };
};

const saveUserData = (data: any) => {
  fs.writeFileSync(USER_DATA_FILE, JSON.stringify(data, null, 2));
};

const saveTournaments = (tournaments: any[]) => {
  fs.writeFileSync(TOURNAMENTS_FILE, JSON.stringify(tournaments, null, 2));
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve static root files (manifest.json, sw.js, etc.)
  app.get(["/manifest.json", "/sw.js"], (req, res) => {
    const filePath = path.join(__dirname, req.path);
    if (fs.existsSync(filePath)) {
      if (req.path.endsWith('.js')) {
        res.type('application/javascript');
      }
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: "File not found" });
    }
  });

  // API Check
  app.get("/api/tournaments", (req, res) => {
    res.json(getTournaments());
  });

  app.get("/api/tournaments/:id", (req, res) => {
    const tournament = getTournaments().find((t: any) => t.id === req.params.id);
    if (tournament) res.json(tournament);
    else res.status(404).json({ error: "Tournament not found" });
  });

  app.post("/api/tournaments/join", (req, res) => {
    const { tournamentId } = req.body;
    const tournament = getTournaments().find((t: any) => t.id === tournamentId);
    if (!tournament) return res.status(404).json({ error: "Tournament not found" });

    const userData = getUserData();
    const entryFee = parseFloat(tournament.entry);

    if (userData.balance < entryFee) {
      return res.status(400).json({ error: "Insufficient battle credits" });
    }

    userData.balance -= entryFee;
    userData.transactions.unshift({
      id: `JN-${Date.now()}`,
      type: "Entry Fee",
      amount: entryFee,
      date: new Date().toISOString(),
      details: tournament.name
    });
    saveUserData(userData);

    res.json({ success: true, newBalance: userData.balance });
  });

  // Traditional Form Submission (PHP-style reload)
  app.post("/api/admin/create-tournament", (req, res) => {
    const { name, game, entryFee, prizePool, maxPlayers } = req.body;
    
    if (!name || !game || !entryFee || !prizePool || !maxPlayers) {
      return res.status(400).send("All fields are required");
    }

    const tournaments = getTournaments();
    const newTournament = {
      id: Date.now().toString(),
      name,
      game,
      entry: entryFee,
      prize: prizePool,
      maxPlayers
    };

    tournaments.push(newTournament);
    saveTournaments(tournaments);

    res.redirect("/admin?created=true");
  });

  app.post("/api/admin/edit-tournament", (req, res) => {
    const { id, name, game, entryFee, prizePool, maxPlayers } = req.body;
    
    if (!id || !name || !game || !entryFee || !prizePool || !maxPlayers) {
      return res.status(400).send("All fields are required");
    }

    let tournaments = getTournaments();
    const index = tournaments.findIndex((t: any) => t.id === id);
    
    if (index !== -1) {
      tournaments[index] = { ...tournaments[index], name, game, entry: entryFee, prize: prizePool, maxPlayers };
      saveTournaments(tournaments);
      res.redirect("/admin?updated=true");
    } else {
      res.status(404).send("Tournament not found");
    }
  });

  app.post("/api/admin/delete-tournament", (req, res) => {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).send("ID is required");
    }

    let tournaments = getTournaments();
    const filtered = tournaments.filter((t: any) => t.id !== id);
    
    if (filtered.length !== tournaments.length) {
      saveTournaments(filtered);
      res.redirect("/admin?deleted=true");
    } else {
      res.status(404).send("Tournament not found");
    }
  });

  // Stripe Payment Integration
  app.post("/api/payment/create-checkout", async (req, res) => {
    const { amount } = req.body;
    const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;

    try {
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
      
      // If Stripe is not configured, simulate a successful checkout for demo purposes
      if (!stripeSecretKey || stripeSecretKey === "50" || stripeSecretKey.trim() === "") {
        console.warn("STRIPE_SECRET_KEY is missing. Redirecting to mock success for demo mode.");
        return res.redirect(`${APP_URL}/wallet?payment=success&amount=${amount}&mode=demo`);
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Add Battle Credits - Adept Play",
                description: `Adding ₹${amount} to your tournament wallet`,
              },
              unit_amount: Math.round(parseFloat(amount) * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${APP_URL}/wallet?payment=success&amount=${amount}`,
        cancel_url: `${APP_URL}/wallet?payment=cancel`,
      });

      res.redirect(session.url!);
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(403).send(`Payment Error: ${error.message}`);
    }
  });

  // Sync Balance on Success
  app.get("/api/payment/sync", (req, res) => {
    const { amount, status } = req.query;
    if (status === "success" && amount) {
      const userData = getUserData();
      const depAmt = parseFloat(amount as string);
      userData.balance += depAmt;
      userData.transactions.unshift({
        id: `TXN${Date.now()}`,
        type: "Deposit",
        amount: depAmt,
        date: new Date().toISOString()
      });
      saveUserData(userData);
    }
    res.redirect("/wallet");
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.set('vite', vite);
    app.use(vite.middlewares);
  } else {
    // CRITICAL: Use __dirname instead of process.cwd() for safe path resolution
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
  }

  // Explicit route for /download to guarantee it never 404s at the Express level
  app.get("/download", async (req, res, next) => {
    try {
      if (process.env.NODE_ENV !== "production") {
        const vite = req.app.get('vite');
        let template = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        const distIndex = path.join(__dirname, "dist", "index.html");
        if (fs.existsSync(distIndex)) {
          return res.sendFile(distIndex);
        } else {
          return res.sendFile(path.join(__dirname, "index.html"));
        }
      }
    } catch (e) {
      next(e);
    }
  });

  // Unified SPA Fallback
  app.get("*", async (req, res, next) => {
    if (res.headersSent) return next();
    const url = req.originalUrl;
    
    // Skip API routes
    if (url.startsWith('/api')) return next();

    try {
      if (process.env.NODE_ENV !== "production") {
        const vite = req.app.get('vite');
        let template = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        return res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        const distIndex = path.join(__dirname, "dist", "index.html");
        if (fs.existsSync(distIndex)) {
          return res.sendFile(distIndex);
        } else {
          // Absolute fallback if dist/index.html missing for some reason
          return res.sendFile(path.join(__dirname, "index.html"));
        }
      }
    } catch (e: any) {
      if (process.env.NODE_ENV !== "production") req.app.get('vite')?.ssrFixStacktrace(e);
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Battle Comm Center Active: http://localhost:${PORT}`);
  });
}

startServer();
