import JSZip from 'jszip';
import type { ProjectConfig } from '@stack-init/schema';
import { generateCommonReadme } from './common';
import { generateExpressProject } from './express';
import { generateNestProject } from './nest';
import { generateNextjsProject } from './nextjs';
import { generateReactProject } from './react';
import { generateFastAPIProject } from './fastapi';
import { generateIntegration } from './integration';
import { buildYamlContent, buildGettingStarted } from './yaml';
import { generateDockerCompose, generateGithubCI, generateDockerfile, generateDockerIgnore, generateNginxConf } from './docker'
import { generateVueProject } from './vue';
import { generateAngularProject } from './angular';
import { generateT3Project } from './t3';
import { generateDjangoProject } from './django';

function generateDevScripts(zip: JSZip, config: ProjectConfig): void {
  const { stack, name } = config;
  const isFastAPI = stack.includes('fastapi');
  const isNestJS  = stack.includes('nestjs');

  // Ports: FastAPI on 8000 (no conflict), Node.js on 3000 → frontend on 3001
  const backendPort  = isFastAPI ? 8000 : 3000;
  const frontendPort = isFastAPI ? 3000 : 3001;
  const backendUrl   = `http://localhost:${backendPort}`;
  const frontendUrl  = `http://localhost:${frontendPort}`;
  const frontendPortEnv = isFastAPI ? '' : `PORT=${frontendPort} `;

  // Backend commands
  const backendInstall = isFastAPI
    ? [ 'python3 -m venv .venv',
        'source .venv/bin/activate',
        'pip install -r requirements.txt',
        'deactivate' ]
    : [ 'npm install' ];

  const backendStart = isFastAPI
    ? `source .venv/bin/activate && uvicorn app.main:app --reload --port ${backendPort}`
    : isNestJS
    ? 'npm run start:dev'
    : 'npm run dev';

  const backendInstallWin = isFastAPI
    ? [ 'python -m venv .venv',
        'call .venv\\Scripts\\activate.bat',
        'pip install -r requirements.txt',
        'deactivate' ]
    : [ 'npm install' ];

  const backendStartWin = isFastAPI
    ? `.venv\\Scripts\\activate.bat && uvicorn app.main:app --reload --port ${backendPort}`
    : isNestJS
    ? 'npm run start:dev'
    : 'npm run dev';

  // ── dev.sh ────────────────────────────────────────────────────────────────

  const backendInstalledCheck = isFastAPI
    ? '[ -d "backend/.venv" ]'
    : '[ -d "backend/node_modules" ]';

  const devSh = `#!/usr/bin/env bash
set -euo pipefail

CYAN='\\033[0;36m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
GRAY='\\033[0;90m'
RESET='\\033[0m'

echo -e "\${CYAN}=== ${name} ===\${RESET}"
echo ""

# ── Install backend ──────────────────────────────────────────────────────────
if ${backendInstalledCheck}; then
  echo -e "\${GRAY}[backend] Already installed, skipping.\${RESET}"
else
  echo -e "\${YELLOW}[backend]\${RESET} Installing dependencies..."
  cd backend
${backendInstall.map(l => '  ' + l).join('\n')}
  cd ..
  echo -e "\${GREEN}[backend] Done.\${RESET}"
fi

# ── Install frontend ─────────────────────────────────────────────────────────
if [ -d "frontend/node_modules" ]; then
  echo -e "\${GRAY}[frontend] Already installed, skipping.\${RESET}"
else
  echo -e "\${YELLOW}[frontend]\${RESET} npm install..."
  (cd frontend && npm install)
  echo -e "\${GREEN}[frontend] Done.\${RESET}"
fi

echo ""
echo -e "\${GREEN}✅ Starting services...\${RESET}"
echo -e "  Backend  → \${CYAN}${backendUrl}\${RESET}${isFastAPI ? ' · Swagger: ' + backendUrl + '/docs' : ''}"
echo -e "  Frontend → \${CYAN}${frontendUrl}\${RESET}"
echo ""
echo "Press Ctrl+C to stop all services."
echo ""

# ── Start backend (background) ────────────────────────────────────────────────
(cd backend && ${backendStart}) &
BACK_PID=$!

# Kill backend when this script exits (Ctrl+C or frontend crash)
trap 'kill "$BACK_PID" 2>/dev/null || true' EXIT INT TERM

# ── Start frontend (foreground) ───────────────────────────────────────────────
(cd frontend && ${frontendPortEnv}npm run dev)
`;

  // ── dev.bat ───────────────────────────────────────────────────────────────

  const backendInstalledCheckWin = isFastAPI
    ? 'backend\\.venv\\'
    : 'backend\\node_modules\\';

  const devBat = `@echo off
chcp 65001 > nul
echo === ${name} — dev setup ===
echo.

if exist "${backendInstalledCheckWin}" (
  echo [backend] Already installed, skipping.
) else (
  echo [backend] Installing dependencies...
  cd backend
  ${backendInstallWin.join('\r\n  ')}
  cd ..
  echo [backend] Done.
)
echo.

if exist "frontend\\node_modules\\" (
  echo [frontend] Already installed, skipping.
) else (
  echo [frontend] Installing dependencies...
  cd frontend
  npm install
  cd ..
  echo [frontend] Done.
)
echo.

echo Starting services in separate windows...
echo   Backend  -^> ${backendUrl}${isFastAPI ? ' (Swagger: ' + backendUrl + '/docs)' : ''}
echo   Frontend -^> ${frontendUrl}
echo.

start "${name} — backend"  cmd /k "cd /d %~dp0backend && ${backendStartWin}"
start "${name} — frontend" cmd /k "cd /d %~dp0frontend && ${frontendPortEnv}npm run dev"

echo Both services started. Close the windows to stop them.
`;

  zip.file('dev.sh', devSh);
  zip.file('dev.bat', devBat);
}

export async function generateZip(config: ProjectConfig): Promise<void> {
  const zip = new JSZip();
  const { stack, name: projectName } = config;

  const isMixed = ['laravel+react', 'laravel+nextjs', 'express+react', 'nestjs+react', 'fastapi+react', 'fastapi+nextjs', 'mern', 'pern', 'mevn', 'mean'].includes(stack as any);

  if (stack === 'express' || stack === 'express+react' || stack === 'mern' || stack === 'pern' || stack === 'mevn' || stack === 'mean') {
    await generateExpressProject(isMixed ? zip.folder('backend')! : zip, config);
  } else if (stack === 'nestjs' || stack === 'nestjs+react') {
    await generateNestProject(isMixed ? zip.folder('backend')! : zip, config);
  } else if (stack === 'fastapi' || stack === 'fastapi+react' || stack === 'fastapi+nextjs') {
    await generateFastAPIProject(isMixed ? zip.folder('backend')! : zip, config);
  } else if (stack === 'nextjs') {
    await generateNextjsProject(zip, config);
  } else if (stack === 'react') {
    await generateReactProject(zip, config);
  } else if (stack === 't3') {
    await generateT3Project(zip, config);
  } else if (stack === 'django') {
    await generateDjangoProject(zip, config);
  }

  if (isMixed) {
    // MEVN uses Vue, MEAN uses Angular, all other mixed stacks use React
    if (stack === 'mevn') {
      await generateVueProject(zip.folder('frontend')!, config);
    } else if (stack === 'mean') {
      await generateAngularProject(zip.folder('frontend')!, config);
    } else {
      await generateReactProject(zip.folder('frontend')!, config);
    }
    await generateIntegration(zip, config, 'frontend');
    // Laravel backend is PHP — no Node dev scripts applicable
    if (!stack.includes('laravel')) {
      generateDevScripts(zip, config);
    }
  }

  // Embed YAML config and common README inside the ZIP
  zip.file('stack-init.yaml', buildYamlContent(config));
  zip.file('README.md', generateCommonReadme(config));

  // DevOps files — pure frontend stacks (no server) don't get docker-compose
  if (stack !== 'nextjs' && stack !== 'react') {
    zip.file('docker-compose.yml', generateDockerCompose(config));
  }

  // Dockerfiles per component
  const backendFolder = isMixed ? zip.folder('backend')! : zip;
  const frontendFolder = isMixed ? zip.folder('frontend')! : null;

  if (stack.includes('fastapi')) {
    backendFolder.file('Dockerfile', generateDockerfile('fastapi', config));
    backendFolder.file('.dockerignore', generateDockerIgnore('fastapi'));
  } else if (stack.includes('laravel')) {
    backendFolder.file('Dockerfile', generateDockerfile('laravel', config));
    backendFolder.file('.dockerignore', generateDockerIgnore('laravel'));
  } else if (stack.includes('express') || stack.includes('nestjs') || stack === 'mern' || stack === 'pern' || stack === 'mevn') {
    backendFolder.file('Dockerfile', generateDockerfile('node', config));
    backendFolder.file('.dockerignore', generateDockerIgnore('node'));
  } else if (stack === 't3') {
    zip.file('Dockerfile', generateDockerfile('t3', config));
    zip.file('.dockerignore', generateDockerIgnore('node'));
  } else if (stack === 'django') {
    zip.file('Dockerfile', generateDockerfile('django', config));
    zip.file('.dockerignore', generateDockerIgnore('fastapi'));
  } else if (stack === 'nextjs') {
    zip.file('Dockerfile', generateDockerfile('nextjs', config));
    zip.file('.dockerignore', generateDockerIgnore('node'));
  } else if (stack === 'react') {
    zip.file('Dockerfile', generateDockerfile('react-spa', config));
    zip.file('.dockerignore', generateDockerIgnore('node'));
    zip.file('nginx.conf', generateNginxConf());
  }

  if (isMixed && frontendFolder) {
    if (stack === 'mevn') {
      frontendFolder.file('Dockerfile', generateDockerfile('react-spa', config));
      frontendFolder.file('nginx.conf', generateNginxConf());
    } else if (stack === 'mean') {
      frontendFolder.file('Dockerfile', generateDockerfile('angular', config));
      frontendFolder.file('nginx.conf', generateNginxConf());
    } else if (stack.includes('nextjs')) {
      frontendFolder.file('Dockerfile', generateDockerfile('nextjs', config));
    } else {
      frontendFolder.file('Dockerfile', generateDockerfile('react-spa', config));
      frontendFolder.file('nginx.conf', generateNginxConf());
    }
    frontendFolder.file('.dockerignore', generateDockerIgnore('node'));
  }

  zip.folder('.github/workflows')!.file('ci.yml', generateGithubCI(config));

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName || 'project'}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Download GETTING_STARTED.md separately after the ZIP
  setTimeout(() => {
    const md = buildGettingStarted(config, true);
    const mdBlob = new Blob([md], { type: 'text/markdown' });
    const mdUrl = URL.createObjectURL(mdBlob);
    const mdLink = document.createElement('a');
    mdLink.href = mdUrl;
    mdLink.download = 'GETTING_STARTED.md';
    document.body.appendChild(mdLink);
    mdLink.click();
    document.body.removeChild(mdLink);
    URL.revokeObjectURL(mdUrl);
  }, 500);
}
