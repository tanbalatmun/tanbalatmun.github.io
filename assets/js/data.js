/*
 * Data layer. The rest of the site only talks to TM.data — it never cares
 * whether we're in demo mode (browser storage) or live mode (Supabase).
 */
(function () {
  const cfg = window.TM_CONFIG || {};
  const LIVE = Boolean(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);
  const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  const DEMO_CONTENT = "tm_demo_content";
  const DEMO_APPS = "tm_demo_applications";
  const DEMO_SESSION = "tm_demo_session";

  let clientPromise = null;
  function client() {
    if (!clientPromise) {
      clientPromise = new Promise((resolve, reject) => {
        const done = () => resolve(window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY));
        if (window.supabase) return done();
        const s = document.createElement("script");
        s.src = SUPABASE_CDN;
        s.onload = done;
        s.onerror = () => reject(new Error("Could not load Supabase"));
        document.head.appendChild(s);
      });
    }
    return clientPromise;
  }

  const clone = (o) => JSON.parse(JSON.stringify(o));

  // Fill in anything missing from saved content with the defaults,
  // so adding a new field to defaults.js never breaks an older database row.
  function withDefaults(saved, defaults) {
    if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : clone(defaults);
    if (defaults && typeof defaults === "object") {
      const out = {};
      const src = saved && typeof saved === "object" ? saved : {};
      for (const k of Object.keys(defaults)) out[k] = withDefaults(src[k], defaults[k]);
      for (const k of Object.keys(src)) if (!(k in out)) out[k] = src[k];
      return out;
    }
    return saved === undefined || saved === null ? defaults : saved;
  }

  function readLocal(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function writeLocal(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function pbkdf2Hex(password, salt) {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: enc.encode(salt), iterations: 200000 },
      key,
      256
    );
    return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  let contentCache = null;

  window.TM = window.TM || {};
  TM.data = {
    live: LIVE,

    async getContent() {
      if (contentCache) return contentCache;
      let saved = null;
      if (LIVE) {
        try {
          const sb = await client();
          const { data, error } = await sb.from("site_content").select("data").eq("id", 1).maybeSingle();
          if (error) throw error;
          saved = data && data.data;
        } catch (e) {
          console.error("Could not load content, using defaults", e);
        }
      } else {
        saved = readLocal(DEMO_CONTENT, null);
      }
      contentCache = withDefaults(saved, window.TM_DEFAULT_CONTENT);
      return contentCache;
    },

    async saveContent(content) {
      if (LIVE) {
        const sb = await client();
        const { error } = await sb
          .from("site_content")
          .upsert({ id: 1, data: content, updated_at: new Date().toISOString() });
        if (error) throw error;
      } else {
        writeLocal(DEMO_CONTENT, content);
      }
      contentCache = clone(content);
    },

    defaultContent() {
      return clone(window.TM_DEFAULT_CONTENT);
    },

    async submitApplication(app) {
      if (LIVE) {
        const sb = await client();
        const { error } = await sb.from("applications").insert(app);
        if (error) throw error;
      } else {
        const apps = readLocal(DEMO_APPS, []);
        const id = apps.reduce((m, a) => Math.max(m, a.id), 0) + 1;
        apps.push({ id, created_at: new Date().toISOString(), ...app });
        writeLocal(DEMO_APPS, apps);
      }
    },

    async listApplications() {
      if (LIVE) {
        const sb = await client();
        const { data, error } = await sb.from("applications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data;
      }
      return readLocal(DEMO_APPS, []).slice().reverse();
    },

    async deleteApplication(id) {
      if (LIVE) {
        const sb = await client();
        const { error } = await sb.from("applications").delete().eq("id", id);
        if (error) throw error;
      } else {
        writeLocal(DEMO_APPS, readLocal(DEMO_APPS, []).filter((a) => a.id !== id));
      }
    },

    // ---- organizer login ----
    async signIn(password) {
      if (LIVE) {
        const sb = await client();
        const { error } = await sb.auth.signInWithPassword({ email: cfg.ORGANIZER_EMAIL, password });
        if (error) TM.data.lastAuthError = error.code || error.message;
        return !error;
      }
      const hash = await pbkdf2Hex(password, cfg.DEMO_PASSWORD_SALT);
      if (hash !== cfg.DEMO_PASSWORD_HASH) return false;
      sessionStorage.setItem(DEMO_SESSION, "1");
      return true;
    },

    async isSignedIn() {
      if (LIVE) {
        const sb = await client();
        const { data } = await sb.auth.getSession();
        return Boolean(data.session);
      }
      return sessionStorage.getItem(DEMO_SESSION) === "1";
    },

    async signOut() {
      if (LIVE) {
        const sb = await client();
        await sb.auth.signOut();
      } else {
        sessionStorage.removeItem(DEMO_SESSION);
      }
    },

    // Upload a file to a storage bucket; returns its public URL. Live mode only.
    async uploadFile(bucket, file, folder) {
      if (!LIVE) throw new Error("Uploading files needs the live database. In demo mode, paste a link instead.");
      const sb = await client();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const dir = String(folder || "file").toLowerCase().replace(/[^a-z0-9-]/g, "-") || "file";
      const path = `${dir}/${Date.now()}-${safeName}`;
      const { error } = await sb.storage.from(bucket).upload(path, file, { upsert: false });
      if (error) throw error;
      return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },
    uploadGuide(file, committeeId) { return TM.data.uploadFile("study-guides", file, committeeId); },
    uploadLogo(file, sponsorName) { return TM.data.uploadFile("sponsor-logos", file, sponsorName); },
  };
})();
