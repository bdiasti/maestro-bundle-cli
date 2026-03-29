#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync, cpSync, readdirSync, readFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import chalk from "chalk";
import ora from "ora";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================
// BUNDLES
// ============================================================
const BUNDLES = {
  "ai-agents": {
    name: "Sistema Multi-Agente com AI",
    desc: "Python + LangChain + LangGraph + FastAPI + pgvector",
  },
  "jhipster-monorepo": {
    name: "JHipster Monorepo",
    desc: "Java 21 + Spring Boot + Angular + PostgreSQL + Liquibase",
  },
  "jhipster-microservices": {
    name: "JHipster Microservices",
    desc: "Java 21 + Spring Boot + Angular + Kafka + Consul + K8s",
  },
  "data-pipeline": {
    name: "Pipeline de Dados e ML",
    desc: "Python + Pandas + Scikit-learn + MLflow + Airflow",
  },
  "frontend-spa": {
    name: "Frontend SPA",
    desc: "React + TypeScript + Tailwind + Vite",
  },
  "ai-agents-deep": {
    name: "Deep Agent (tipo Claude Code)",
    desc: "Python + Deep Agents SDK + LangGraph + Subagentes + Skills",
  },
};

// ============================================================
// EDITORS — paths corretos para cada editor
//
// Claude Code:
//   Instruções:  CLAUDE.md (raiz) com @AGENTS.md
//   Skills:      .claude/skills/<nome>/SKILL.md
//   Rules:       .claude/rules/<nome>.md
//
// Cursor:
//   Instruções:  .cursor/rules/ (rules .mdc ou .md)
//   Também lê:   AGENTS.md (raiz)
//
// Codex (OpenAI):
//   Instruções:  AGENTS.md (raiz)
//   Sem pasta de skills/rules
//
// Copilot:
//   Instruções:  .github/copilot-instructions.md
//   Rules:       .github/instructions/<nome>.instructions.md
//
// Windsurf:
//   Instruções:  .windsurfrules (raiz)
//   Sem pasta de skills/rules
// ============================================================
const EDITORS = {
  claude: {
    name: "Claude Code",
    instructionsFile: "CLAUDE.md",
    skillsDir: ".claude/skills",         // Skills como SKILL.md com frontmatter
    rulesDir: ".claude/rules",           // Rules curtas (padrões gerais)
    needsAgentsMd: true,                 // CLAUDE.md faz @AGENTS.md
  },
  cursor: {
    name: "Cursor",
    instructionsFile: null,              // Cursor lê AGENTS.md na raiz
    skillsDir: ".cursor/skills",         // Skills como SKILL.md (mesmo formato do Claude)
    rulesDir: null,                      // Não usar rules, usar skills
    needsAgentsMd: true,                 // Cursor lê AGENTS.md na raiz
  },
  codex: {
    name: "OpenAI Codex",
    instructionsFile: "AGENTS.md",
    skillsDir: null,
    rulesDir: null,
    needsAgentsMd: false,                // AGENTS.md É o arquivo principal
  },
  copilot: {
    name: "GitHub Copilot",
    instructionsFile: ".github/copilot-instructions.md",
    skillsDir: null,
    rulesDir: ".github/instructions",    // .instructions.md com frontmatter
    needsAgentsMd: false,
  },
  windsurf: {
    name: "Windsurf",
    instructionsFile: ".windsurfrules",
    skillsDir: null,
    rulesDir: null,
    needsAgentsMd: false,
  },
  all: {
    name: "Todos os editores",
  },
};

// ============================================================
// HELP
// ============================================================
function showHelp() {
  console.log("");
  console.log(chalk.bold("  maestro-bundle") + " — Instala bundles de governança para projetos com AI");
  console.log("");
  console.log(chalk.dim("  Uso:"));
  console.log(`    npx maestro-bundle ${chalk.green("<bundle>")} ${chalk.yellow("<editor>")} ${chalk.dim("[diretório]")}`);
  console.log("");
  console.log(chalk.dim("  Bundles:"));
  for (const [key, info] of Object.entries(BUNDLES)) {
    console.log(`    ${chalk.green(key.padEnd(26))} ${info.desc}`);
  }
  console.log("");
  console.log(chalk.dim("  Editores:"));
  console.log(`    ${chalk.yellow("claude".padEnd(12))} CLAUDE.md + .claude/skills/<nome>/SKILL.md`);
  console.log(`    ${chalk.yellow("cursor".padEnd(12))} AGENTS.md + .cursor/skills/<nome>/SKILL.md`);
  console.log(`    ${chalk.yellow("codex".padEnd(12))} AGENTS.md (tudo em um arquivo)`);
  console.log(`    ${chalk.yellow("copilot".padEnd(12))} .github/copilot-instructions.md + .github/instructions/`);
  console.log(`    ${chalk.yellow("windsurf".padEnd(12))} .windsurfrules (tudo em um arquivo)`);
  console.log(`    ${chalk.yellow("all".padEnd(12))} Instala para todos os editores no mesmo repo`);
  console.log("");
  console.log(chalk.dim("  Exemplos:"));
  console.log(`    npx maestro-bundle ai-agents claude`);
  console.log(`    npx maestro-bundle jhipster-monorepo cursor ./meu-projeto`);
  console.log(`    npx maestro-bundle frontend-spa all`);
  console.log("");
}

// ============================================================
// UTILS
// ============================================================
function ensureDir(dir) { mkdirSync(dir, { recursive: true }); }
function copyDir(src, dest) { if (existsSync(src)) cpSync(src, dest, { recursive: true }); }
function readFile(path) { return existsSync(path) ? readFileSync(path, "utf-8") : ""; }

function getSkillDirs(templatesDir, bundleName) {
  const baseSkills = join(templatesDir, "bundle-base", "skills");
  const bundleSkills = join(templatesDir, `bundle-${bundleName}`, "skills");
  return [baseSkills, bundleSkills].filter(existsSync);
}

function listSkills(skillDirs) {
  const skills = [];
  for (const dir of skillDirs) {
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory() && existsSync(join(dir, item.name, "SKILL.md"))) {
        skills.push({ name: item.name, dir: join(dir, item.name) });
      }
    }
  }
  return skills;
}

// ============================================================
// INSTALL PER EDITOR
// ============================================================
function installForEditor(editorKey, agentsMd, skills, targetDir) {
  const editor = EDITORS[editorKey];
  const installed = [];

  // --- AGENTS.md (universal) ---
  if (editor.needsAgentsMd || editorKey === "codex") {
    writeFileSync(join(targetDir, "AGENTS.md"), agentsMd);
    installed.push("AGENTS.md");
  }

  // --- Arquivo de instruções principal ---
  if (editor.instructionsFile) {
    const filePath = join(targetDir, editor.instructionsFile);
    ensureDir(dirname(filePath));

    if (editorKey === "claude") {
      // CLAUDE.md aponta para @AGENTS.md (sem duplicar conteúdo)
      writeFileSync(filePath, "@AGENTS.md\n");
      installed.push("CLAUDE.md → @AGENTS.md");
    } else if (editorKey === "codex") {
      // AGENTS.md já foi escrito acima
    } else {
      // Copilot, Windsurf: copiar conteúdo completo
      writeFileSync(filePath, agentsMd);
      installed.push(editor.instructionsFile);
    }
  }

  // --- Skills (Claude Code: .claude/skills/<nome>/SKILL.md) ---
  if (editor.skillsDir) {
    const skillsPath = join(targetDir, editor.skillsDir);
    ensureDir(skillsPath);
    for (const skill of skills) {
      const destDir = join(skillsPath, skill.name);
      copyDir(skill.dir, destDir);
    }
    installed.push(`${skills.length} skills em ${editor.skillsDir}/`);
  }

  // --- Rules por editor ---
  if (editor.rulesDir) {
    const rulesPath = join(targetDir, editor.rulesDir);
    ensureDir(rulesPath);

    for (const skill of skills) {
      const content = readFileSync(join(skill.dir, "SKILL.md"), "utf-8");

      if (editorKey === "copilot") {
        // Copilot: .instructions.md
        writeFileSync(join(rulesPath, `${skill.name}.instructions.md`), content);

      } else if (editorKey === "claude") {
        // Claude rules: regras curtas derivadas do AGENTS.md
        // Skills já vão em .claude/skills/, rules é só para padrões gerais
        // Não duplicar skills como rules
      }
    }

    if (editorKey !== "claude") {
      const ruleFiles = readdirSync(rulesPath).length;
      installed.push(`${ruleFiles} rules em ${editor.rulesDir}/`);
    }
  }

  return installed;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { description: "", body: content };

  const fm = match[1];
  const body = match[2];
  const descMatch = fm.match(/description:\s*(.+)/);
  const description = descMatch ? descMatch[1].trim() : "";
  return { description, body };
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes("--help") || args.includes("-h")) {
    showHelp();
    process.exit(args.length < 2 && !args.includes("--help") ? 1 : 0);
  }

  const bundleName = args[0];
  const editorArg = args[1];
  const targetDir = resolve(args[2] || ".");

  if (!BUNDLES[bundleName]) {
    console.error(chalk.red(`\n  Bundle "${bundleName}" não encontrado.\n`));
    showHelp();
    process.exit(1);
  }
  if (!EDITORS[editorArg]) {
    console.error(chalk.red(`\n  Editor "${editorArg}" não encontrado.\n`));
    showHelp();
    process.exit(1);
  }

  const bundleInfo = BUNDLES[bundleName];
  const templatesDir = join(__dirname, "..", "templates");
  const baseDir = join(templatesDir, "bundle-base");
  const bundleDir = join(templatesDir, `bundle-${bundleName}`);

  if (!existsSync(bundleDir)) {
    console.error(chalk.red(`\n  Templates de "${bundleName}" não encontrados.\n`));
    process.exit(1);
  }

  // Montar AGENTS.md (base + bundle)
  let agentsMd = readFile(join(baseDir, "AGENTS.md"));
  const bundleAgents = readFile(join(bundleDir, "AGENTS.md"));
  if (bundleAgents) agentsMd += "\n\n---\n\n" + bundleAgents;

  // Listar skills
  const skillDirs = getSkillDirs(templatesDir, bundleName);
  const skills = listSkills(skillDirs);

  // Editores a instalar
  const editorsToInstall = editorArg === "all"
    ? ["claude", "cursor", "codex", "copilot", "windsurf"]
    : [editorArg];

  const editorNames = editorsToInstall.map(e => EDITORS[e].name).join(", ");

  console.log("");
  console.log(chalk.bold(`  Bundle:  ${chalk.green(bundleInfo.name)}`));
  console.log(chalk.bold(`  Editor:  ${chalk.yellow(editorNames)}`));
  console.log(chalk.dim(`  Destino: ${targetDir}`));
  console.log("");

  // 1. Instalar para cada editor
  for (const editorKey of editorsToInstall) {
    const spinner = ora(`Instalando para ${EDITORS[editorKey].name}`).start();
    const results = installForEditor(editorKey, agentsMd, skills, targetDir);
    spinner.succeed(`${EDITORS[editorKey].name}: ${results.join(", ")}`);
  }

  // 2. PRD template
  const prdTemplate = join(bundleDir, "PRD_TEMPLATE.md");
  if (existsSync(prdTemplate)) {
    const prdDest = join(targetDir, "PRD.md");
    if (!existsSync(prdDest)) {
      cpSync(prdTemplate, prdDest);
      const spinnerPrd = ora("PRD.md template instalado").start();
      spinnerPrd.succeed("PRD.md template instalado (preencha com os requisitos do produto)");
    }
  }

  // 3. Skills canônicas (sempre, para Deep Agents e referência)
  const spinner2 = ora("Instalando skills canônicas").start();
  const skillsDest = join(targetDir, "skills");
  ensureDir(skillsDest);
  for (const skill of skills) {
    copyDir(skill.dir, join(skillsDest, skill.name));
  }
  spinner2.succeed(`${skills.length} skills canônicas em skills/`);

  // 3. LangChain Skills (para bundles de AI)
  if (bundleName === "ai-agents" || bundleName === "ai-agents-deep") {
    const spinnerLc = ora("Instalando LangChain Skills (langchain-ai/langchain-skills)").start();
    try {
      // Instalar todas as 11 skills do LangChain para o editor escolhido
      const agentFlag = primaryEditor === "cursor" ? "cursor" : primaryEditor === "codex" ? "codex" : "claude-code";
      execSync(
        `npx skills add langchain-ai/langchain-skills --agent ${agentFlag} --skill "*" --yes`,
        { stdio: "pipe", timeout: 120000, cwd: targetDir, shell: true }
      );
      spinnerLc.succeed("11 LangChain Skills instaladas (framework-selection, langchain-*, langgraph-*, deep-agents-*)");
    } catch {
      // Fallback: tentar sem --agent
      try {
        execSync(
          `npx skills add langchain-ai/langchain-skills --skill "*" --yes`,
          { stdio: "pipe", timeout: 120000, cwd: targetDir, shell: true }
        );
        spinnerLc.succeed("11 LangChain Skills instaladas");
      } catch {
        spinnerLc.warn("Instale manualmente as LangChain Skills:");
        console.log(chalk.dim("    npx skills add langchain-ai/langchain-skills --skill '*' --yes"));
      }
    }
  }

  // 4. References
  const spinner3 = ora("Instalando references").start();
  const refsSrc = join(bundleDir, "references");
  ensureDir(join(targetDir, "references"));
  if (existsSync(refsSrc)) {
    copyDir(refsSrc, join(targetDir, "references"));
  }
  spinner3.succeed("references/ pronto");

  // 4. GitHub Spec Kit — instalar CLI + inicializar no projeto
  // Mapear editor para flag --ai do specify
  const aiFlags = {
    claude: "claude",
    cursor: "cursor-agent",
    codex: "codex",
    copilot: "copilot",
    windsurf: "windsurf",
  };
  // Usar o primeiro editor como --ai (ou claude como default)
  const primaryEditor = editorsToInstall[0];
  const aiFlag = aiFlags[primaryEditor] || "claude";

  // 4a. Instalar specify-cli
  const SPECKIT_VERSION = "v0.4.3";
  const spinner4 = ora("Instalando GitHub Spec Kit (specify-cli)").start();
  let specifyInstalled = false;

  // Verificar se já está instalado (specify não aceita --version, usar --help)
  try {
    execSync("specify --help", { stdio: "ignore" });
    specifyInstalled = true;
    spinner4.succeed("specify-cli já instalado");
  } catch {
    // Não instalado — instalar
    try {
      execSync(`uv tool install specify-cli --from "git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}"`, {
        stdio: "pipe", timeout: 120000,
      });
      specifyInstalled = true;
      spinner4.succeed(`specify-cli ${SPECKIT_VERSION} instalado`);
    } catch (err) {
      // Pode já estar instalado mas uv retorna erro, checar de novo
      try {
        execSync("specify --help", { stdio: "ignore" });
        specifyInstalled = true;
        spinner4.succeed("specify-cli já instalado");
      } catch {
        spinner4.warn("Não foi possível instalar. Rode manualmente:");
        console.log(chalk.dim(`    uv tool install specify-cli --from "git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}"`));
      }
    }
  }

  // 4b. Rodar specify init no projeto para criar .specify/ e registrar /speckit.* commands
  if (specifyInstalled) {
    const spinner4c = ora(`Inicializando Spec Kit no projeto (--ai ${aiFlag})`).start();
    const specifyEnv = { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" };
    let specInitOk = false;

    // Precisa de "y" piped pois specify pede confirmação se dir não vazio
    // --script sh para evitar dependência de pwsh no Windows
    // --ai-skills necessário para codex
    const extraFlags = primaryEditor === "codex" ? " --ai-skills" : "";
    const initCmds = [
      `echo y | specify init . --ai ${aiFlag}${extraFlags} --script sh --force`,
      `echo y | specify init . --ai ${aiFlag}${extraFlags} --script sh`,
      `echo y | specify init . --ai ${aiFlag}${extraFlags}`,
    ];
    for (const cmd of initCmds) {
      try {
        execSync(cmd, {
          stdio: "pipe",
          timeout: 60000,
          cwd: targetDir,
          env: specifyEnv,
          shell: true,
        });
        specInitOk = true;
        break;
      } catch { /* try next */ }
    }
    if (specInitOk) {
      spinner4c.succeed(`Spec Kit inicializado (/speckit.* commands disponíveis)`);
    } else {
      spinner4c.warn("Inicialize manualmente no terminal:");
      console.log(chalk.dim(`    cd ${targetDir}`));
      console.log(chalk.dim(`    specify init . --ai ${aiFlag} --script sh`));
    }

    // 4c. Copiar constitution.md do bundle para dentro do .specify/memory/
    const specifyMemoryDir = join(targetDir, ".specify", "memory");
    const bundleConstitution = join(bundleDir, ".spec", "constitution.md");
    if (existsSync(bundleConstitution)) {
      ensureDir(specifyMemoryDir);
      const constitutionDest = join(specifyMemoryDir, "constitution.md");
      // Append os princípios do bundle ao constitution gerado pelo specify
      if (existsSync(constitutionDest)) {
        const existing = readFileSync(constitutionDest, "utf-8");
        const bundleContent = readFileSync(bundleConstitution, "utf-8");
        writeFileSync(constitutionDest, existing + "\n\n---\n\n" + bundleContent);
      } else {
        cpSync(bundleConstitution, constitutionDest);
      }
      const spinner4d = ora("Constitution do bundle integrado ao Spec Kit").start();
      spinner4d.succeed("Constitution do bundle integrado ao Spec Kit");
    }
  }

  // Done
  console.log("");
  console.log(chalk.green.bold("  Pronto!"));
  console.log("");
  console.log("  Estrutura instalada:");

  for (const editorKey of editorsToInstall) {
    const e = EDITORS[editorKey];
    console.log(`    ${chalk.yellow(e.name)}:`);
    if (editorKey === "claude") {
      console.log(`      ${chalk.cyan("CLAUDE.md")} → @AGENTS.md`);
      console.log(`      ${chalk.cyan(".claude/skills/")} (${skills.length} skills com SKILL.md)`);
    } else if (editorKey === "cursor") {
      console.log(`      ${chalk.cyan("AGENTS.md")} (instruções gerais)`);
      console.log(`      ${chalk.cyan(".cursor/skills/")} (${skills.length} skills com SKILL.md)`);
    } else if (editorKey === "codex") {
      console.log(`      ${chalk.cyan("AGENTS.md")} (tudo em um arquivo)`);
    } else if (editorKey === "copilot") {
      console.log(`      ${chalk.cyan(".github/copilot-instructions.md")}`);
      console.log(`      ${chalk.cyan(".github/instructions/")} (${skills.length} .instructions.md)`);
    } else if (editorKey === "windsurf") {
      console.log(`      ${chalk.cyan(".windsurfrules")}`);
    }
  }
  console.log(`    ${chalk.cyan("skills/")} (${skills.length} canônicas para Deep Agents)`);
  console.log(`    ${chalk.cyan(".specify/")} (GitHub Spec Kit — /speckit.* commands)`);
  console.log("");
  console.log("  Comandos SDD disponíveis no editor:");
  console.log(`    ${chalk.cyan("/speckit.constitution")}  — Definir princípios do projeto`);
  console.log(`    ${chalk.cyan("/speckit.specify")}       — Especificar O QUE e POR QUÊ`);
  console.log(`    ${chalk.cyan("/speckit.plan")}          — Planejar arquitetura e stack`);
  console.log(`    ${chalk.cyan("/speckit.tasks")}         — Quebrar em tasks atômicas`);
  console.log(`    ${chalk.cyan("/speckit.implement")}     — Executar as tasks`);
  console.log("");
  console.log("  Próximo passo:");
  console.log("    Abra o projeto no editor AI e use " + chalk.cyan("/speckit.specify") + " para começar");
  console.log("");
}

main().catch((err) => {
  console.error(chalk.red(`\n  Erro: ${err.message}\n`));
  process.exit(1);
});
