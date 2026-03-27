/**
 * OpenClaw WhatsApp Bot
 * Integrates WhatsApp automation with Ollama AI (OpenClaw/OpenCoder model)
 * 
 * Supports both CPU and GPU inference via Ollama
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// ── Configuration ──────────────────────────────────────────────────────────────
const CONFIG = {
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
  MODEL: process.env.OLLAMA_MODEL || 'opencoder:latest',
  FALLBACK_MODEL: process.env.OLLAMA_FALLBACK_MODEL || 'llama3.2:latest',
  BOT_PREFIX: process.env.BOT_PREFIX || '!ai',
  GPU_LAYERS: process.env.OLLAMA_GPU_LAYERS || '0',
};

// ── Ollama AI Query Function ───────────────────────────────────────────────────
async function queryOllama(prompt, useGpu = false) {
  try {
    const gpuFlag = useGpu ? `OLLAMA_GPU_LAYERS=${CONFIG.GPU_LAYERS}` : '';
    const command = `${gpuFlag} ollama run ${CONFIG.MODEL} "${prompt.replace(/"/g, '\\"')}"`;
    
    console.log(`[Ollama] Querying model: ${CONFIG.MODEL}`);
    const { stdout, stderr } = await execAsync(command, { timeout: 60000 });
    
    if (stderr && !stdout) {
      // Try fallback model
      console.log(`[Ollama] Trying fallback model: ${CONFIG.FALLBACK_MODEL}`);
      const fallbackCmd = `ollama run ${CONFIG.FALLBACK_MODEL} "${prompt.replace(/"/g, '\\"')}"`;
      const result = await execAsync(fallbackCmd, { timeout: 60000 });
      return result.stdout.trim();
    }
    
    return stdout.trim();
  } catch (error) {
    console.error('[Ollama] Error:', error.message);
    return `Error connecting to Ollama: ${error.message}`;
  }
}

// ── WhatsApp Client Setup ─────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'openclaw-bot'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
});

// ── QR Code Handler ────────────────────────────────────────────────────────────
client.on('qr', (qr) => {
  console.log('\n[WhatsApp] Scan the QR code below to authenticate:');
  qrcode.generate(qr, { small: true });
});

// ── Ready Handler ──────────────────────────────────────────────────────────────
client.on('ready', () => {
  console.log('[WhatsApp] OpenClaw Bot is ready!');
  console.log(`[Ollama] Using model: ${CONFIG.MODEL}`);
  console.log(`[Config] Bot prefix: ${CONFIG.BOT_PREFIX}`);
  console.log(`[Config] GPU layers: ${CONFIG.GPU_LAYERS}`);
});

// ── Message Handler ────────────────────────────────────────────────────────────
client.on('message', async (msg) => {
  const body = msg.body.trim();
  
  // Check for bot prefix
  if (!body.startsWith(CONFIG.BOT_PREFIX)) return;
  
  const prompt = body.slice(CONFIG.BOT_PREFIX.length).trim();
  
  if (!prompt) {
    await msg.reply('Please provide a prompt after !ai. Example: !ai What is machine learning?');
    return;
  }
  
  console.log(`[Message] From: ${msg.from}, Prompt: ${prompt}`);
  
  try {
    await msg.reply('Thinking... (powered by OpenClaw/Ollama AI)');
    
    const useGpu = CONFIG.GPU_LAYERS !== '0';
    const response = await queryOllama(prompt, useGpu);
    
    if (response) {
      // Split long responses
      const maxLength = 4000;
      if (response.length > maxLength) {
        const chunks = response.match(/.{1,${maxLength}}/gs) || [];
        for (const chunk of chunks) {
          await msg.reply(chunk);
        }
      } else {
        await msg.reply(response);
      }
    }
  } catch (error) {
    console.error('[Error]', error);
    await msg.reply('Sorry, an error occurred while processing your request.');
  }
});

// ── Authentication Handlers ────────────────────────────────────────────────────
client.on('auth_failure', (msg) => {
  console.error('[WhatsApp] Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('[WhatsApp] Client disconnected:', reason);
  process.exit(1);
});

// ── Start the Bot ──────────────────────────────────────────────────────────────
console.log('[OpenClaw] Starting WhatsApp Bot with Ollama AI...');
console.log('[OpenClaw] Ollama Host:', CONFIG.OLLAMA_HOST);
client.initialize();

module.exports = { client, queryOllama };
