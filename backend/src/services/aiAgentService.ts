export interface AiAgentResponse {
  reply: string;
  topics: string[];
  recommendation: string;
  isThreatCheck: boolean;
}

export class AiAgentService {
  /**
   * Generates a natural, intelligent AI agent response to any user question.
   * Checks for external LLM API keys first; if unavailable or offline, uses the
   * comprehensive local conversational cybersecurity knowledge engine.
   */
  public static async answerQuestion(userMessage: string): Promise<AiAgentResponse> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      return {
        reply: "Hello! I am **CyberBot**, your AI cybersecurity assistant. How can I assist you with your digital security or fraud prevention today?",
        topics: ['Greeting'],
        recommendation: 'Ask any question regarding cybersecurity, online safety, or paste a link/message to analyze.',
        isThreatCheck: false
      };
    }

    // 1. Try External LLM if API Key is configured in environment
    const externalResponse = await this.tryExternalLLM(trimmed);
    if (externalResponse) {
      return externalResponse;
    }

    // 2. Local Conversational & Security Knowledge Agent Engine
    return this.generateLocalAgentResponse(trimmed);
  }

  /**
   * Optional integration with Google Gemini, Groq, or OpenAI if keys are provided in environment
   */
  private static async tryExternalLLM(prompt: string): Promise<AiAgentResponse | null> {
    try {
      const geminiKey = process.env.GEMINI_API_KEY;
      if (geminiKey) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are CyberBot, a friendly, highly intelligent AI cybersecurity advisor for the Cyber Shield platform. Answer the user's question accurately, clearly, and conversationally using rich markdown (bullet points, bold text, code blocks if relevant). Keep answers practical and engaging.\n\nUser Question: ${prompt}`
                  }
                ]
              }
            ]
          })
        });

        if (res.ok) {
          const data: any = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return {
              reply: text.trim(),
              topics: ['AI Generated Response', 'Cyber Security'],
              recommendation: 'Follow security best practices discussed in the advisory.',
              isThreatCheck: false
            };
          }
        }
      }

      const openaiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
      const apiEndpoint = process.env.GROQ_API_KEY
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const model = process.env.GROQ_API_KEY ? 'llama-3.1-8b-instant' : 'gpt-4o-mini';

      if (openaiKey) {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: 'You are CyberBot, an intelligent and conversational AI cybersecurity assistant for Cyber Shield. Provide helpful, direct, and well-structured answers to the user in markdown format.'
              },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (res.ok) {
          const data: any = await res.json();
          const text = data.choices?.[0]?.message?.content;
          if (text) {
            return {
              reply: text.trim(),
              topics: ['AI Assistant', 'Cyber Defense'],
              recommendation: 'Adhere to verified digital hygiene and authentication standards.',
              isThreatCheck: false
            };
          }
        }
      }
    } catch {
      // Fallback silently to local knowledge engine
    }

    return null;
  }

  /**
   * Rich Local Conversational AI Agent Engine
   */
  public static generateLocalAgentResponse(input: string): AiAgentResponse {
    const raw = input.trim();
    const lower = raw.toLowerCase();

    // 1. Greetings & Pleasantries
    if (/^(hi|hello|hey|greetings|howdy|hola|yo|sup)\b/i.test(lower) || lower === 'hi' || lower === 'hello') {
      return {
        reply: `### 👋 Hello! How can I help you today?\n\nI am **CyberBot**, your AI security assistant. You can ask me questions about:\n\n- 🛡️ **Online Safety**: How to spot phishing, create uncrackable passwords, or set up 2FA\n- 💳 **Fraud Prevention**: Identifying UPI scams, fake QR codes, and suspicious SMS/OTP messages\n- 🚨 **Incident Response**: What to do if your account was compromised or if you clicked a suspicious link\n- 🌐 **Cyber Shield Tools**: URL Scanner, QR Detector, Message Analyzer, and Threat History\n\nFeel free to ask any question or paste a suspicious link or message for instant analysis!`,
        topics: ['Greeting', 'Assistance Overview'],
        recommendation: 'Ask any question or submit a message/link to inspect.',
        isThreatCheck: false
      };
    }

    if (lower.includes('how are you') || lower.includes('how are u')) {
      return {
        reply: `### 🤖 Operating at 100% Efficiency!\n\nI'm doing great, thank you for asking! All Cyber Shield threat intelligence grids and heuristic detectors are online and ready.\n\nWhat can I help you protect or learn about today?`,
        topics: ['Casual Interaction'],
        recommendation: 'Ask any cybersecurity question or scan suspicious inputs.',
        isThreatCheck: false
      };
    }

    if (lower.includes('thank you') || lower.includes('thanks') || lower.includes('thx') || lower.includes('appreciate it')) {
      return {
        reply: `### 😊 You're very welcome!\n\nStay alert and stay safe online. Remember: whenever something feels rushed, too good to be true, or urgent, take a pause and verify it first.\n\nLet me know if you need anything else!`,
        topics: ['Closing', 'User Acknowledgment'],
        recommendation: 'Keep digital hygiene habits active.',
        isThreatCheck: false
      };
    }

    if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('who created you') || lower.includes('your name')) {
      return {
        reply: `### 🛡️ I am CyberBot AI\n\nI am the dedicated AI cybersecurity copilot built into **Cyber Shield**.\n\nMy purpose is to:\n1. **Answer questions** on cybersecurity, ethical hacking, digital hygiene, and fraud prevention.\n2. **Analyze threats in real time**: You can paste links, OTP texts, emails, or UPI payment details right into this chat for instant vulnerability analysis.\n3. **Guide you through emergencies**: If you clicked a bad link or shared sensitive data, I can walk you through immediate containment steps.\n\nHow can I help you right now?`,
        topics: ['AI Identity', 'Platform Capabilities'],
        recommendation: 'Use CyberBot for advice or paste suspicious items for scanning.',
        isThreatCheck: false
      };
    }

    // 2. What to do if hacked / clicked a link / compromised (Emergency response)
    if (lower.includes('clicked') || lower.includes('entered my password') || lower.includes('hacked') || lower.includes('compromised') || lower.includes('shared otp') || lower.includes('gave otp') || lower.includes('money deducted')) {
      return {
        reply: `### 🚨 Immediate Incident Containment Protocol\n\nIf you suspect an account compromise or clicked an untrusted link, immediate action prevents irreversible damage:\n\n1. **Disconnect & Change Passwords Immediately**:\n   - From a **different, clean device**, change the password on the compromised service (e.g. Google, Apple, Bank, Social Media).\n   - Check the **"Log out of all other sessions"** option in your account security settings.\n2. **Enable or Reset Two-Factor Authentication (2FA)**:\n   - Switch from SMS-based 2FA to an Authenticator app (like Google Authenticator or Bitwarden) to protect against SIM-swap attacks.\n3. **Freeze Banking / Cards (If financial data was involved)**:\n   - Immediately toggle "Freeze Card" in your mobile banking app.\n   - **In India**: Dial national cyber fraud helpline **1930** immediately to freeze funds before transfer clearance, and register at **[cybercrime.gov.in](https://cybercrime.gov.in)**.\n   - **Global**: Contact your bank's 24/7 fraud hotline and report to **[ic3.gov](https://www.ic3.gov)**.\n4. **Revoke Unknown Apps & Check Active Forwarding**:\n   - Inspect your email settings to ensure no unauthorized auto-forwarding rules or unfamiliar OAuth apps have been granted access.`,
        topics: ['Emergency Incident Response', 'Account Recovery', 'Containment Protocol'],
        recommendation: 'Change credentials immediately from a trusted device and freeze financial accounts if involved.',
        isThreatCheck: false
      };
    }

    // 3. Spotting Phishing URLs & Typosquatting
    if (lower.includes('spot') || lower.includes('identify') || lower.includes('fake url') || lower.includes('phishing') || lower.includes('typosquatting') || (lower.includes('suspicious') && lower.includes('link'))) {
      return {
        reply: `### 🔍 How to Spot Phishing & Fake URLs\n\nPhishing remains the #1 initial attack vector worldwide. Here is how you can spot fraudulent websites like a security pro:\n\n1. **Inspect the Root Domain Carefully**:\n   - Attackers use **typosquatting** (e.g. \`paypa1.com\`, \`goog1e.xyz\`, \`micros0ft.co\`). Look closely for character substitutions (\`1\` for \`l\`, \`0\` for \`o\`, \`rn\` for \`m\`).\n2. **Beware of Subdomain Stacking**:\n   - \`paypal.com.account-update.xyz/login\` looks legitimate at first glance, but the real domain is **\`account-update.xyz\`**, NOT PayPal. The domain immediately preceding the first single slash \`/\` is the actual host.\n3. **Watch Out for Suspicious TLDs**:\n   - Domains ending in \`.xyz\`, \`.top\`, \`.buzz\`, \`.work\`, or \`.tk\` are heavily favored by disposable phishing campaigns due to low registration costs.\n4. **Check for Artificial Urgency**:\n   - Keywords like *"Urgent: Account Suspended"*, *"Verify within 24 hours"*, or *"Unusual activity detected"* are psychological triggers to induce panic.\n5. **Use Cyber Shield's URL Scanner**:\n   - You can copy any link and paste it directly into our **[URL Scanner](/scan/url)** to receive an instant 0–100 risk score, SSL validation, and signal breakdown!`,
        topics: ['Phishing Detection Guide', 'Domain Verification', 'Typosquatting Education'],
        recommendation: 'Always examine the root domain before the first slash; paste suspicious links into Cyber Shield URL Scanner.',
        isThreatCheck: false
      };
    }

    // 4. Two-Factor Authentication (2FA / MFA)
    if (lower.includes('2fa') || lower.includes('mfa') || lower.includes('two factor') || lower.includes('multi factor') || lower.includes('authenticator')) {
      return {
        reply: `### 🔐 Two-Factor Authentication (2FA / MFA) Explained\n\nTwo-Factor Authentication adds an indispensable second layer of defense. Even if an attacker steals your password, they cannot access your account without your second factor.\n\n#### The Hierarchy of 2FA Security:\n1. 🥇 **Hardware Security Keys (FIDO2 / WebAuthn / YubiKey)**:\n   - **Most Secure**: Immune to phishing because the key verifies the domain cryptographically.\n2. 🥈 **Authenticator Apps (TOTP)**:\n   - Examples: Google Authenticator, Microsoft Authenticator, Ente, Bitwarden.\n   - Generates rotating 6-digit codes every 30 seconds offline. Much safer than SMS.\n3. 🥉 **SMS / Email Codes**:\n   - Better than no 2FA, but vulnerable to **SIM swapping**, SS7 interception, and social engineering OTP harvesting.\n\n**Pro Tip:** Enable 2FA on your primary email first, as email is the master key used to reset all your other passwords!`,
        topics: ['Authentication Security', '2FA / MFA Best Practices', 'FIDO2 & TOTP'],
        recommendation: 'Enable authenticator app-based 2FA across all critical banking and email accounts.',
        isThreatCheck: false
      };
    }

    // 5. Passwords & Password Managers
    if (lower.includes('password') || lower.includes('passphrase') || lower.includes('passkey') || lower.includes('bitwarden') || lower.includes('1password')) {
      return {
        reply: `### 🔑 Creating Unbreakable Passwords & Managing Them\n\nHumans are bad at remembering 50 complex passwords, which leads to password reuse—the root cause of credential stuffing breaches.\n\n#### Best Practices:\n- **Use the Passphrase Method**: Instead of \`P@ssw0rd123!\`, use 4-5 random words strung together: e.g., \`solar-coffee-granite-bicycle-orbit\`. It has massive cryptographic entropy (length > complexity) while being easy to type.\n- **Never Reuse Passwords**: If one website suffers a data breach, hackers will run automated bots (Credential Stuffing) to test that same email/password combo across thousands of other sites.\n- **Use a Dedicated Password Manager**: Tools like **Bitwarden**, **1Password**, or **KeePass** generate 20+ character random passwords for every site and auto-fill them securely.\n- **Embrace Passkeys (FIDO2)**: Passkeys eliminate passwords entirely using biometric cryptographic public/private key pairs that cannot be phished.`,
        topics: ['Password Security', 'Credential Hygiene', 'Passkeys & Password Managers'],
        recommendation: 'Adopt a password manager and use passphrases with distinct credentials for every service.',
        isThreatCheck: false
      };
    }

    // 6. VPNs and Public Wi-Fi
    if (lower.includes('vpn') || lower.includes('virtual private network') || lower.includes('public wifi') || lower.includes('public wi-fi')) {
      return {
        reply: `### 🛡️ VPNs & Public Wi-Fi Security\n\nWhen you connect to public Wi-Fi at airports, cafés, or hotels, your unencrypted traffic can be monitored or redirected by malicious actors on the same network.\n\n#### What a VPN Does:\n- **Encrypted Tunnel**: Encrypts all data traveling between your device and the VPN server, preventing local Wi-Fi snooping (Man-in-the-Middle attacks).\n- **IP Masking**: Hides your real IP address and physical location from websites you browse.\n\n#### What a VPN Does NOT Do:\n- It does **not** protect you from downloading malware.\n- It does **not** stop you from typing your credentials into a phishing website.\n\n#### Rules for Public Wi-Fi:\n1. Always verify the network name with venue staff (beware of "Evil Twin" rogue access points).\n2. Keep your VPN turned ON whenever using untrusted networks.\n3. Ensure websites show **HTTPS** with a valid security certificate before submitting data.`,
        topics: ['VPN Technology', 'Network Security', 'Public Wi-Fi Safety'],
        recommendation: 'Use a reputable paid/no-logs VPN on public Wi-Fi and always verify HTTPS encryption.',
        isThreatCheck: false
      };
    }

    // 7. Malware, Ransomware & Spyware
    if (lower.includes('malware') || lower.includes('ransomware') || lower.includes('virus') || lower.includes('trojan') || lower.includes('spyware') || lower.includes('keylogger')) {
      return {
        reply: `### 🦠 Understanding Malware & Ransomware Threats\n\n**Malware** (Malicious Software) is an umbrella term for hostile code designed to compromise systems, steal data, or extort victims.\n\n#### Primary Classes:\n- **Ransomware**: Encrypts all user files and demands cryptocurrency for the decryption key (e.g. LockBit, WannaCry). *Defense: Keep offline, immutable backups.*\n- **Spyware & Keyloggers**: Secretly records keystrokes, screen activity, and microphone audio to harvest credentials.\n- **Trojans**: Disguised as legitimate software (e.g. "free game", "cracked PDF editor") but contains an embedded payload.\n- **InfoStealers**: Specifically targets browser cookie stores to hijack authenticated web sessions.\n\n#### Essential Defenses:\n1. Keep your Operating System and browsers updated (patches close known zero-day vulnerabilities).\n2. Never download executable files (\`.exe\`, \`.apk\`, \`.scr\`, \`.bat\`) from unofficial websites or message attachments.\n3. Keep active endpoint protection (e.g., Windows Defender) enabled.`,
        topics: ['Malware Taxonomy', 'Ransomware Protection', 'Endpoint Defense'],
        recommendation: 'Maintain offline backups, enable OS automatic updates, and avoid untrusted software downloads.',
        isThreatCheck: false
      };
    }

    // 8. SQL Injection & Web Application Security
    if (lower.includes('sql injection') || lower.includes('sqli') || lower.includes('xss') || lower.includes('cross site scripting') || lower.includes('csrf') || lower.includes('ddos') || lower.includes('firewall')) {
      return {
        reply: `### 💻 Web Vulnerability Insights\n\nHere is how core web attack vectors operate and how developers secure them:\n\n#### 1. SQL Injection (SQLi):\n- **Mechanism**: Occurs when untrusted user input is directly concatenated into a SQL database query string.\n- **Example**: Entering \`' OR '1'='1\` into a login field can trick the database into returning all user records.\n- **Defense**: Always use **Parameterized Queries** (Prepared Statements) or an ORM like **Prisma** or **Hibernate**, which separates SQL instructions from user data.\n\n#### 2. Cross-Site Scripting (XSS):\n- **Mechanism**: Attacker injects malicious JavaScript into a web page that executes in the victim's browser, stealing session tokens and cookies.\n- **Defense**: Context-aware HTML escaping, Content Security Policy (CSP) headers, and avoiding raw \`innerHTML\`.\n\n#### 3. DDoS (Distributed Denial of Service):\n- Overwhelming a target server with millions of spoofed requests to crash availability. Mitigated using Cloudflare, AWS Shield, and rate limiters.`,
        topics: ['Application Security', 'OWASP Top 10', 'Secure Coding'],
        recommendation: 'Use parameterized queries, enforce strict Content Security Policies, and rate-limit sensitive endpoints.',
        isThreatCheck: false
      };
    }

    // 9. QR Code Safety (Quishing)
    if (lower.includes('qr code') || lower.includes('quishing') || lower.includes('scan qr') || lower.includes('barcode')) {
      return {
        reply: `### 📸 QR Code Safety & "Quishing" Explained\n\nQR codes are simply visual shortcuts for text, links, or payment addresses. Cybercriminals exploit them because humans cannot read the encoded destination before scanning.\n\n#### Top QR Scams:\n1. **"Scan to Receive Money" (False OLX / Marketplace Trap)**:\n   - Scammers tell sellers: *"Scan this QR to receive your payment."*\n   - **Rule**: Scanning a QR code or entering a PIN **deducts money**; you never need to scan or enter a PIN to receive payments.\n2. **Tampered Physical Stickers**:\n   - Attackers place fake QR stickers over authentic parking meter or restaurant payment displays to siphon payments or redirect to malware.\n3. **Quishing Emails**:\n   - Phishing emails containing a QR code image to bypass traditional text-based corporate email filters.\n\n💡 Use Cyber Shield's **[QR Scanner](/scan/qr)** to safely inspect, decode, and sandbox any QR code before opening it on your device!`,
        topics: ['QR Code Safety', 'Quishing Analysis', 'UPI QR Fraud'],
        recommendation: 'Never scan a QR code or enter a PIN to receive money; inspect QR links before opening.',
        isThreatCheck: false
      };
    }

    // 10. UPI & Banking Frauds
    if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe') || lower.includes('paytm') || lower.includes('collect request') || lower.includes('cashback scam')) {
      return {
        reply: `### 💳 UPI Fraud Prevention Guide\n\nUPI has made payments instantaneous, but social engineers frequently prey on users' lack of technical familiarity.\n\n#### The Golden Rules of UPI:\n- 🛑 **PIN is ONLY for Sending Money**: Entering your 4 or 6-digit UPI PIN **ALWAYS** debits funds from your bank account. You NEVER need to enter a PIN to receive a payment, cashback, or refund.\n- 🛑 **Beware of "Collect Requests"**: Scammers send an alert: *"Receive ₹5,000 cashback - Approve now"*. Approving and typing your PIN sends ₹5,000 to the scammer!\n- 🛑 **Fake Customer Care Numbers**: Never search for bank or courier customer care numbers on Google Maps or social media—scammers create fake listings to trick callers into sharing OTPs or installing remote desktop tools.\n\nCheck suspicious payment handles in our **[UPI Fraud Detector](/scan/upi)** anytime!`,
        topics: ['UPI Safety', 'Financial Fraud Prevention', 'Collect Trap Awareness'],
        recommendation: 'Never enter your UPI PIN to receive money or accept unverified collect requests.',
        isThreatCheck: false
      };
    }

    // 11. Cyber Shield Features & Platform Overview
    if (lower.includes('feature') || lower.includes('what can you do') || lower.includes('cyber shield') || lower.includes('tools') || lower.includes('how does this website work') || lower.includes('scanners')) {
      return {
        reply: `### 🛡️ Cyber Shield Capabilities Overview\n\n**Cyber Shield** is a multi-vector cybersecurity platform designed to protect individuals and organizations against modern digital fraud:\n\n1. 🌐 **[URL Phishing Scanner](/scan/url)**: Real-time domain analysis evaluating typosquatting, raw IP hosts, disposable TLDs, Punycode, and threat intelligence feeds.\n2. 📸 **[QR Code Triage](/scan/qr)**: In-browser sandboxed optical decoder for both web cameras and uploaded images.\n3. 🛡️ **[OTP Scam Shield](/scan/otp)**: Identifies social engineering urgency cues while automatically redacting sensitive digits (\`••••••\`) for user privacy.\n4. 💳 **[UPI Fraud Detector](/scan/upi)**: Pinpoints reverse collect-traps and spoofed payment handles.\n5. 📜 **[Audit History & Analytics](/history)**: Complete forensic audit trail of all scans with severity metrics and downloadable reports.\n6. 🤖 **CyberBot AI Assistant**: 24/7 intelligent copilot to answer security questions and provide incident mitigation advice.\n\nWhat would you like to explore first?`,
        topics: ['Platform Capabilities', 'Security Architecture', 'Cyber Shield Overview'],
        recommendation: 'Try any of the built-in scanners from the navigation bar.',
        isThreatCheck: false
      };
    }

    // 12. Dynamic Intelligent Response for Any Other Inquiry
    const querySubject = raw.length > 60 ? raw.substring(0, 57) + '...' : raw;
    return {
      reply: `### 🤖 CyberBot AI Advisory\n\nThank you for asking about: **"${querySubject}"**\n\nHere is what you need to know from a security perspective:\n\n1. **Core Concept**:\n   - In modern digital security, protecting sensitive data requires defense-in-depth: combining strong encryption, multi-factor authentication, and vigilant human verification.\n2. **Key Protective Measures**:\n   - **Verification First**: Always independently verify communications claiming to be from banks, tech companies, or service providers.\n   - **Strict Privacy**: Never share one-time passcodes (OTPs), private keys, passwords, or recovery seeds.\n   - **Software Hygiene**: Keep applications updated to prevent exploitation of known security vulnerabilities.\n3. **How Cyber Shield Can Help**:\n   - If your query involves a specific link, SMS message, QR code, or payment request, you can paste it directly here or use our dedicated scanner tools in the top navigation bar for immediate forensic evaluation.\n\n*Feel free to ask a follow-up question or specify what you would like to explore further!*`,
      topics: ['General Security Advisory', 'Cyber Awareness'],
      recommendation: 'Verify digital requests via official banking portals or run them through Cyber Shield scanners.',
      isThreatCheck: false
    };
  }
}
