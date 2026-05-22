#!/usr/bin/env bash
set -euo pipefail

# ─── HermesHire — One-command install ───
# curl -fsSL https://hermes-hire.xyz/install.sh | bash

BOLD='\033[1m'
DIM='\033[2m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
GOLD='\033[38;5;214m'
NC='\033[0m' # No Color

echo ""
echo -e "${GOLD}  ╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${GOLD}  ║                                                     ║${NC}"
echo -e "${GOLD}  ║   ██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗${NC}"
echo -e "${GOLD}  ║   ██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝${NC}"
echo -e "${GOLD}  ║   ███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗${NC}"
echo -e "${GOLD}  ║   ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║${NC}"
echo -e "${GOLD}  ║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║${NC}"
echo -e "${GOLD}  ║   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝${NC}"
echo -e "${GOLD}  ║                                                     ║${NC}"
echo -e "${GOLD}  ║        ◈  Autonomous AI Hiring Copilot  ◈           ║${NC}"
echo -e "${GOLD}  ╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ─── Detect OS ───
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

echo -e "${DIM}Detected: ${OS} ${ARCH}${NC}"

# ─── Check Node.js ───
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js not found. Installing via fnm...${NC}"
  curl -fsSL https://fnm.vercel.app/install | bash
  export PATH="$HOME/.local/share/fnm:$PATH"
  export FNM_DIR="$HOME/.local/share/fnm"
  if [ -f "$HOME/.local/share/fnm/fnm" ]; then
    "$HOME/.local/share/fnm/fnm" install 20
    "$HOME/.local/share/fnm/fnm" use 20
    export PATH="$HOME/.local/share/fnm/aliases/default/bin:$PATH"
  fi
fi

NODE_VERSION=$(node -v 2>/dev/null || echo "none")
echo -e "Node.js: ${GREEN}${NODE_VERSION}${NC}"

# ─── Install Dir ───
INSTALL_DIR="${INSTALL_DIR:-$HOME/.hermeshire}"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

mkdir -p "$INSTALL_DIR"

# ─── Download CLI ───
echo -e "${DIM}Downloading HermesHire CLI...${NC}"

# Clone the repo (lightweight, no history)
if [ ! -d "$INSTALL_DIR/repo" ]; then
  git clone --depth 1 https://github.com/shivanandasai-altir/hermes-hire.git "$INSTALL_DIR/repo" 2>/dev/null || {
    echo -e "${RED}Failed to download. Check your internet connection.${NC}"
    exit 1
  }
else
  cd "$INSTALL_DIR/repo" && git pull --ff-only 2>/dev/null || true
fi

cd "$INSTALL_DIR/repo"

# ─── Install Dependencies ───
echo -e "${DIM}Installing dependencies...${NC}"
npm install

# ─── Make CLI executable ───
mkdir -p "$BIN_DIR"
cat > "$BIN_DIR/hermes" << 'SCRIPT'
#!/usr/bin/env bash
DIR="$(cd "$(dirname "$0")/../.hermeshire/repo" && pwd)"
exec node "$DIR/bin/hermes.mjs" "$@"
SCRIPT
chmod +x "$BIN_DIR/hermes"

# ─── Add to PATH ───
SHELL_CONFIG=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_CONFIG="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_CONFIG="$HOME/.bashrc"
elif [ -f "$HOME/.bash_profile" ]; then
  SHELL_CONFIG="$HOME/.bash_profile"
fi

if [ -n "$SHELL_CONFIG" ]; then
  if ! grep -q "$BIN_DIR" "$SHELL_CONFIG" 2>/dev/null; then
    echo "" >> "$SHELL_CONFIG"
    echo "# HermesHire CLI" >> "$SHELL_CONFIG"
    echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$SHELL_CONFIG"
    echo -e "${DIM}Added $BIN_DIR to PATH in $SHELL_CONFIG${NC}"
  fi
fi

# ─── Verify ───
echo ""
if command -v hermes &> /dev/null || [ -f "$BIN_DIR/hermes" ]; then
  echo -e "${GREEN}✅ HermesHire installed successfully!${NC}"
  echo ""
  echo -e "Next steps:"
  echo -e "  ${GOLD}1.${NC} Restart your terminal or run: ${BOLD}export PATH=\"\$PATH:$BIN_DIR\"${NC}"
  echo -e "  ${GOLD}2.${NC} Set your API key:     ${BOLD}hermes auth --key sk-nous-...${NC}"
  echo -e "  ${GOLD}3.${NC} Switch to HR role:    ${BOLD}hermes auth --as alice${NC}"
  echo -e "  ${GOLD}4.${NC} See all commands:     ${BOLD}hermes --help${NC}"
  echo ""
  echo -e "Or try voice mode:"
  echo -e "  ${DIM}hermes voice \"add rahul as candidate\"${NC}"
  echo ""
else
  echo -e "${RED}Installation failed. Please try again.${NC}"
  exit 1
fi
