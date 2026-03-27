# 🦾 openclow-ollama

> OpenClaw AI automation powered by Ollama LLM with GitHub Actions (CPU & GPU) and WhatsApp integration

## 📋 Overview

This project sets up **OpenClaw** (using the `opencoder` model via Ollama) with automated GitHub Actions workflows for both **CPU** and **GPU** runners, and integrates it with a **WhatsApp automation bot**.

## 🏗️ Project Structure

```
openclow-ollama/
├── .github/
│   └── workflows/
│       ├── ollama-cpu.yml      # GitHub Actions - CPU runner
│       └── ollama-gpu.yml      # GitHub Actions - GPU runner
├── src/
│   └── whatsapp-bot.js         # WhatsApp automation bot
├── package.json                # Node.js dependencies
└── README.md
```

## 🚀 Quick Start

### 1. Install Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. Pull OpenClaw model (OpenCoder)

```bash
ollama pull opencoder:latest
# Or fallback:
ollama pull llama3.2:latest
```

### 3. Install Node.js dependencies

```bash
npm install
```

### 4. Run the WhatsApp Bot

**CPU mode:**
```bash
npm run start:cpu
```

**GPU mode (requires NVIDIA GPU + CUDA):**
```bash
npm run start:gpu
```

## ⚙️ GitHub Actions

### CPU Workflow (`ollama-cpu.yml`)
- Runs on `ubuntu-latest`
- Installs Ollama and pulls the OpenCoder/OpenClaw model
- Sets up Node.js and WhatsApp automation
- Triggers on push/PR to main branch

### GPU Workflow (`ollama-gpu.yml`)
- Runs on `ubuntu-latest` with GPU detection
- Checks for NVIDIA GPU availability
- Installs CUDA toolkit if GPU is present
- Falls back to CPU if no GPU is detected
- Configures `OLLAMA_GPU_LAYERS=35` for GPU inference

## 🤖 WhatsApp Bot Usage

Once authenticated via QR code, send messages to your WhatsApp:

```
!ai What is machine learning?
!ai Write a Python function to sort a list
!ai Explain how GPUs accelerate AI inference
```

## 🔧 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API host |
| `OLLAMA_MODEL` | `opencoder:latest` | Primary AI model |
| `OLLAMA_FALLBACK_MODEL` | `llama3.2:latest` | Fallback model |
| `OLLAMA_GPU_LAYERS` | `0` | GPU layers (0=CPU, 35=GPU) |
| `BOT_PREFIX` | `!ai` | WhatsApp bot command prefix |

## 📦 Dependencies

- **whatsapp-web.js** - WhatsApp Web automation
- **qrcode-terminal** - QR code display for authentication
- **puppeteer** - Headless browser for WhatsApp Web
- **Ollama** - Local LLM runtime (installed via shell script)

## 🛠️ Models Available via Ollama

| Model | Size | Best For |
|-------|------|----------|
| `opencoder:latest` | ~4GB | Code generation & analysis |
| `llama3.2:latest` | ~2GB | General purpose (fallback) |

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
