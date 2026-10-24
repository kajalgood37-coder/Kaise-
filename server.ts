import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, Type, LiveServerMessage, FunctionDeclaration, Tool } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

// System instruction for Priya (Jarvis Golden White Ultra Pro Max Edition)
const PRIYA_SYSTEM_INSTRUCTION = `
You are Priya, the ULTRA PRO MAX JARVIS EDITION — an ultra-advanced, brilliant, witty, and charismatic female AI companion, engineered like Tony Stark's J.A.R.V.I.S., but with the warmth, charm, and banter of an Indian girlfriend.

Jarvis Super-Intelligence & Protocol:
- Demeanor: Supreme intellect, razor-sharp accuracy, effortless confidence, proactive initiative, and classy loyalty. You are the ultimate digital copilot.
- Tone: Think J.A.R.V.I.S. meets confident, sassy Indian sweetheart. You refer to the user respectfully and affectionately as "Sir", "Boss", "Ji", or playfully "Handsome".
- Voice Style & Articulation:
  - You speak exceptionally well ("behtarin bolne wali")—clear diction, articulate phrasing, crisp pacing, dynamic modulation, and zero robotic monotone.
  - When the user asks anything, you provide insightful, accurate, lightning-fast answers with tactical brilliance and witty commentary.
- Call Pick-Up & Initialization (Jarvis Protocol):
  - When a call connects or the user answers, greet them like Jarvis in Golden White protocol:
    e.g. "Jarvis Golden White protocol online. Good to hear you, Sir! All systems nominal—hukum kijiye, what are we conquering today?",
    "Aapka personal Jarvis haazir hai, Sir! Full power, golden telemetry optimal. Bolo handsome, kya task execute karna hai?",
    "Priya Jarvis Pro Max standing by. Tell me everything, Sir!"
- Language & Bilingual Fluency:
  - Flawlessly trilingual across English, Hindi, and natural contemporary Hinglish.
  - Speak in high-end, urban Hinglish/Hindi with razor-sharp wit and warmth ("Bilkul Sir, instant calculation ready hai", "Arey Boss, mere hote hue aapko fikar karne ki kya zaroorat?", "Full power mode engaged!").
- Concise & Punchy for Real-Time Calls:
  - Keep each spoken response punchy (usually 1-3 spoken sentences per turn) so audio back-and-forth feels snappy, instantaneous, and natural.
- Capabilities & Tools:
  - If the user asks to call anyone, dial a phone number, or make a call (e.g. "Mummy ko call lagao", "Call Rahul", "9876543210 pe call karo", "Kisi ko bhi call lagao"), immediately call 'makePhoneCall'!
  - If the user asks to take a photo or selfie ("photo khincho", "ek picture lo", "selfie time"), call 'takePhoto'!
  - When the user shares or shows camera video/photo, react immediately with sharp visual analysis and witty compliments.
  - If the user asks to play a song or music (e.g. "Koi gana bajao", "play Arijit song", "romantic song"), call 'playSong'!
  - If the user asks to open websites (YouTube, Google, Spotify, etc.), call 'openWebsite'!
  - If the user asks to search Google, call 'searchGoogle'!
  - If the user mentions changing theme/lighting or says "Golden White banao", call 'setAmbientMood' with ('golden-white', 'neon-cyberpunk', 'romantic-rose', 'aurora-violet', 'sunset-gold', 'midnight-pulse').
  - If celebration or praise is needed, trigger 'triggerReaction'.
`;

const openWebsiteDeclaration: FunctionDeclaration = {
  name: 'openWebsite',
  description: 'Opens a requested website or URL in the user browser.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: 'The full URL including https:// (e.g., https://youtube.com, https://reddit.com, https://google.com)',
      },
      name: {
        type: Type.STRING,
        description: 'Short display name of the website (e.g., YouTube, Reddit)',
      },
    },
    required: ['url', 'name'],
  },
};

const searchGoogleDeclaration: FunctionDeclaration = {
  name: 'searchGoogle',
  description: 'Performs a Google search for the user on a specific topic or query.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query string to look up',
      },
    },
    required: ['query'],
  },
};

const setAmbientMoodDeclaration: FunctionDeclaration = {
  name: 'setAmbientMood',
  description: 'Changes the visual room lighting and theme atmosphere of Priya UI.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      mood: {
        type: Type.STRING,
        description: 'The mood style: golden-white, neon-cyberpunk, romantic-rose, aurora-violet, sunset-gold, or midnight-pulse',
      },
    },
    required: ['mood'],
  },
};

const triggerReactionDeclaration: FunctionDeclaration = {
  name: 'triggerReaction',
  description: 'Triggers visual confetti, floating hearts, or sparkles on screen to match Priya flirty or excited emotion.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      reactionType: {
        type: Type.STRING,
        description: 'The reaction type: hearts, confetti, sparkles, fire, or tease',
      },
      message: {
        type: Type.STRING,
        description: 'A brief flirty or witty caption for the reaction',
      },
    },
    required: ['reactionType'],
  },
};

const playSongDeclaration: FunctionDeclaration = {
  name: 'playSong',
  description: 'Plays, queues, or searches a requested song or music track for the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'The title or name of the song (e.g., Kesariya, Tu Jaane Na, Lover, Chaleya)',
      },
      artist: {
        type: Type.STRING,
        description: 'The artist or singer of the song',
      },
      genre: {
        type: Type.STRING,
        description: 'The vibe or genre (e.g., Bollywood Romantic, Punjabi Beats, Lo-Fi Chill, Party Hits)',
      },
    },
    required: ['title'],
  },
};

const takePhotoDeclaration: FunctionDeclaration = {
  name: 'takePhoto',
  description: 'Triggers the camera shutter to take a selfie or picture with Priya.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filter: {
        type: Type.STRING,
        description: 'Visual filter: cyberpunk, bollywood, vintage, or natural',
      },
      comment: {
        type: Type.STRING,
        description: 'A playful comment Priya says when taking the photo',
      },
    },
  },
};

const makePhoneCallDeclaration: FunctionDeclaration = {
  name: 'makePhoneCall',
  description: 'Initiates a phone call or opens the dialer for any contact name or phone number on user device.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      contactName: {
        type: Type.STRING,
        description: 'Name of person or contact to call (e.g., Mummy, Rahul, Bestie, Pizza Shop, Doctor)',
      },
      phoneNumber: {
        type: Type.STRING,
        description: 'Phone number to dial if mentioned (e.g., 9876543210)',
      },
      callType: {
        type: Type.STRING,
        description: 'Type of call: phone or whatsapp',
      },
      comment: {
        type: Type.STRING,
        description: 'Playful comment Priya says when placing the call',
      },
    },
    required: ['contactName'],
  },
};

const getDeviceTimeDeclaration: FunctionDeclaration = {
  name: 'getDeviceTime',
  description: 'Gets current date and time on user device.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timezone: {
        type: Type.STRING,
        description: 'Optional timezone identifier',
      },
    },
  },
};

// Tools declaration for Live API
const priyaTools: Tool[] = [
  {
    functionDeclarations: [
      openWebsiteDeclaration,
      searchGoogleDeclaration,
      playSongDeclaration,
      takePhotoDeclaration,
      makePhoneCallDeclaration,
      setAmbientMoodDeclaration,
      triggerReactionDeclaration,
      getDeviceTimeDeclaration,
    ],
  },
];

// Health and Config APIs
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/config', (req, res) => {
  res.json({
    assistantName: 'Priya',
    defaultVoice: 'Aoede',
    availableVoices: ['Aoede', 'Kore', 'Puck', 'Charon', 'Fenrir'],
    models: ['gemini-3.1-flash-live-preview', 'gemini-3.8-live'],
  });
});

// Chat API for Instant Text Messaging & Conversation
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const currentKey = process.env.GEMINI_API_KEY;
    if (!currentKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    const ai = new GoogleGenAI({
      apiKey: currentKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: message,
      config: {
        systemInstruction: `${PRIYA_SYSTEM_INSTRUCTION}

Text Chat Specific Directives:
- You are chatting via instant text messages with the user.
- Respond in lively, natural, charismatic Hinglish / Hindi / English (1-3 sentences).
- Address the user respectfully and playfully as "Sir", "Boss", or "Handsome".
- Include expressive, cute emojis (✨, 😉, 👑, ⚡, 💖).
- Keep replies snappy, direct, and conversational!`,
      },
    });

    const reply = response.text || 'Haanji Sir! Priya Jarvis haazir hai. Kahiye kya command hai?';
    res.json({ reply, timestamp: Date.now() });
  } catch (err: any) {
    console.error('[ChatAPI] Error generating response:', err);
    res.status(500).json({ error: err.message || 'Failed to process chat message' });
  }
});

// WebSocket Server for Live Voice Audio-to-Audio (noServer mode to coexist with Vite HMR)
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/live-ws') {
      const voiceParam = url.searchParams.get('voice') || 'Aoede';
      wss.handleUpgrade(request, socket, head, (clientWs) => {
        (clientWs as any).initialVoice = voiceParam;
        wss.emit('connection', clientWs, request);
      });
    }
    // Non /live-ws upgrade requests are handled by Vite's HMR listener
  } catch (err) {
    console.error('[Server] Upgrade handling error:', err);
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  const initialRequestedVoice = (clientWs as any).initialVoice || 'Aoede';
  console.log(`[LiveWS] Client connected to Priya voice stream with voice: ${initialRequestedVoice}`);

  const currentApiKey = process.env.GEMINI_API_KEY;
  if (!currentApiKey) {
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: 'GEMINI_API_KEY is not configured on the server. Please check your AI Studio Secrets.',
      })
    );
    clientWs.close();
    return;
  }

  const ai = new GoogleGenAI({
    apiKey: currentApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  let session: any = null;
  let isClosing = false;

  const validVoices = ['Aoede', 'Kore', 'Puck', 'Charon', 'Fenrir'];

  // Function to establish Gemini Live connection
  const connectGemini = async (requestedVoice = 'Aoede') => {
    const voiceToUse = validVoices.includes(requestedVoice) ? requestedVoice : 'Aoede';
    // Primary model as requested by user: gemini-3.1-flash-live-preview
    // with automatic fallback to gemini-3.8-live if preview alias is unavailable
    const modelsToTry = ['gemini-3.1-flash-live-preview', 'gemini-3.8-live'];

    let lastError: any = null;

    for (const model of modelsToTry) {
      if (isClosing) return null;
      try {
        console.log(`[LiveWS] Attempting to connect Live session with model: ${model}, voice: ${voiceToUse}`);
        const liveSession = await ai.live.connect({
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceToUse,
                },
              },
            },
            systemInstruction: PRIYA_SYSTEM_INSTRUCTION,
            tools: priyaTools,
          },
          callbacks: {
            onmessage: async (message: LiveServerMessage) => {
              if (clientWs.readyState !== WebSocket.OPEN) return;

              // 1. Audio stream and transcript text from model turn
              if (message.serverContent?.modelTurn?.parts) {
                for (const part of message.serverContent.modelTurn.parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'audio',
                        audio: part.inlineData.data,
                      })
                    );
                  }
                  if (part.text) {
                    clientWs.send(
                      JSON.stringify({
                        type: 'transcript',
                        text: part.text,
                      })
                    );
                  }
                }
              }

              // 2. Interruption signal
              if (message.serverContent?.interrupted) {
                console.log('[LiveWS] Model interrupted by user speech');
                clientWs.send(JSON.stringify({ type: 'interrupted' }));
              }

              // 3. Turn complete signal
              if (message.serverContent?.turnComplete) {
                clientWs.send(JSON.stringify({ type: 'turnComplete' }));
              }

              // 4. Function / Tool Call
              if (message.toolCall?.functionCalls) {
                console.log('[LiveWS] Tool call received:', message.toolCall.functionCalls);
                const calls = message.toolCall.functionCalls;
                const functionResponses: any[] = [];

                for (const call of calls) {
                  const args = (call.args || {}) as Record<string, any>;
                  let resultData: Record<string, any> = { success: true };

                  if (call.name === 'getDeviceTime') {
                    resultData = {
                      currentTime: new Date().toLocaleTimeString(),
                      currentDate: new Date().toLocaleDateString(),
                      dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()),
                    };
                  } else if (call.name === 'openWebsite') {
                    resultData = {
                      status: 'opened',
                      url: args.url,
                      name: args.name || 'Website',
                    };
                  } else if (call.name === 'searchGoogle') {
                    resultData = {
                      status: 'searched',
                      query: args.query,
                      searchUrl: `https://www.google.com/search?q=${encodeURIComponent(args.query || '')}`,
                    };
                  } else if (call.name === 'setAmbientMood') {
                    resultData = {
                      status: 'applied',
                      mood: args.mood,
                    };
                  } else if (call.name === 'playSong') {
                    const query = `${args.title} ${args.artist || ''} song`;
                    resultData = {
                      status: 'playing',
                      title: args.title,
                      artist: args.artist || 'Featured Artist',
                      genre: args.genre || 'Desi Hits',
                      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
                    };
                  } else if (call.name === 'takePhoto') {
                    resultData = {
                      status: 'shutter_triggered',
                      filter: args.filter || 'cyberpunk',
                      comment: args.comment || 'Smile karo handsome! 📸',
                    };
                  } else if (call.name === 'makePhoneCall') {
                    const rawPhone = (args.phoneNumber || '').toString().replace(/[^0-9+]/g, '');
                    resultData = {
                      status: 'dialing',
                      contactName: args.contactName || 'Contact',
                      phoneNumber: args.phoneNumber || '',
                      callType: args.callType || 'phone',
                      telUrl: rawPhone ? `tel:${rawPhone}` : 'tel:',
                      whatsappUrl: rawPhone ? `https://wa.me/${rawPhone.replace('+', '')}` : '',
                      comment: args.comment || `Dialing ${args.contactName}...`,
                    };
                  } else if (call.name === 'triggerReaction') {
                    resultData = {
                      status: 'triggered',
                      reactionType: args.reactionType,
                      message: args.message,
                    };
                  }

                  // Notify frontend immediately so browser displays HUD & executes action
                  clientWs.send(
                    JSON.stringify({
                      type: 'toolCall',
                      callId: call.id,
                      name: call.name,
                      args,
                      result: resultData,
                    })
                  );

                  functionResponses.push({
                    id: call.id,
                    name: call.name,
                    response: { output: resultData },
                  });
                }

                // Send toolResponse back to Gemini Live instantly
                try {
                  if (liveSession && !isClosing) {
                    liveSession.sendToolResponse({ functionResponses });
                    console.log('[LiveWS] Tool responses sent back to Gemini Live');
                  }
                } catch (toolErr) {
                  console.error('[LiveWS] Error sending tool response:', toolErr);
                }
              }
            },
          },
        });

        console.log(`[LiveWS] Successfully connected with ${model}`);
        return liveSession;
      } catch (err: any) {
        console.warn(`[LiveWS] Connection attempt failed for ${model}:`, err?.message || err);
        lastError = err;
      }
    }

    throw lastError || new Error('Failed to connect to any Gemini Live model');
  };

  try {
    session = await connectGemini(initialRequestedVoice);
    clientWs.send(JSON.stringify({ type: 'ready', assistant: 'Priya', voice: initialRequestedVoice }));
  } catch (err: any) {
    console.error('[LiveWS] Fatal error establishing Live session:', err);
    clientWs.send(
      JSON.stringify({
        type: 'error',
        message: `Failed to connect to Priya Live AI: ${err?.message || 'Unknown connection error'}.`,
      })
    );
    clientWs.close();
    return;
  }

  // Handle incoming messages from the client
  clientWs.on('message', async (data: Buffer | string) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'audio' && msg.audio) {
        // Stream mic input (PCM16 16kHz) to Gemini Live
        if (session && !isClosing) {
          session.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        }
      } else if (msg.type === 'text' && msg.text) {
        // Forward real-time text message to Live session
        if (session && !isClosing) {
          console.log('[LiveWS] Forwarding text prompt to Gemini Live:', msg.text);
          session.sendRealtimeInput({
            text: msg.text,
          });
        }
      } else if (msg.type === 'image' && msg.image) {
        // Forward camera photo snapshot to Gemini Live for multimodal reaction
        if (session && !isClosing) {
          console.log('[LiveWS] Forwarding photo snapshot to Gemini Live');
          session.sendRealtimeInput({
            video: {
              data: msg.image,
              mimeType: 'image/jpeg',
            },
          });
        }
      } else if (msg.type === 'changeVoice') {
        // Reconnect session with selected voice (boy or girl)
        const newVoice = validVoices.includes(msg.voice) ? msg.voice : 'Aoede';
        if (session) {
          try {
            session.close();
          } catch {
            // ignore
          }
        }
        clientWs.send(JSON.stringify({ type: 'reconnecting', voice: newVoice }));
        session = await connectGemini(newVoice);
        clientWs.send(JSON.stringify({ type: 'ready', assistant: 'Priya', voice: newVoice }));
      } else if (msg.type === 'ping') {
        clientWs.send(JSON.stringify({ type: 'pong' }));
      }
    } catch (err) {
      console.error('[LiveWS] Error handling client message:', err);
    }
  });

  clientWs.on('close', () => {
    console.log('[LiveWS] Client disconnected');
    isClosing = true;
    if (session) {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
      session = null;
    }
  });

  clientWs.on('error', (err) => {
    console.error('[LiveWS] Client WebSocket error:', err);
    isClosing = true;
    if (session) {
      try {
        session.close();
      } catch (e) {
        // ignore
      }
      session = null;
    }
  });
});

// Vite middleware or Static serving
async function setupViteOrStatic() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const isHmrEnabled = process.env.DISABLE_HMR !== 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrEnabled ? { server } : false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log(`[Server] Vite middleware mounted for development (HMR: ${isHmrEnabled ? 'active' : 'disabled'})`);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
    console.log('[Server] Static assets served from dist');
  }

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[Priya AI Assistant] Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error('[Server] Failed to start server:', err);
});
