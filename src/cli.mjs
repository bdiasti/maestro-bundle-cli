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
    name: "Multi-Agent AI System",
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
    name: "Data & ML Pipeline",
    desc: "Python + Pandas + Scikit-learn + MLflow + Airflow",
  },
  "frontend-spa": {
    name: "Frontend SPA",
    desc: "React + TypeScript + Tailwind + Vite",
  },
  "ai-agents-deep": {
    name: "Deep Agent (Claude Code-like)",
    desc: "Python + Deep Agents SDK + LangGraph + Subagents + Skills",
  },
};

// ============================================================
// EDITORS — paths corretos para cada editor
//
// Claude Code:
//   Instruções:  CLAUDE.md (raiz) com @AGENTS.md
//   Skills:      .claude/skills/name/SKILL.md
//   Rules:       .claude/rules/name.md
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
//   Rules:       .github/instructions/name.instructions.md
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
  console.log(chalk.bold("  maestro-bundle") + " — Install governance bundles for AI-powered projects");
  console.log("");
  console.log(chalk.dim("  Usage:"));
  console.log(`    npx maestro-bundle ${chalk.green("<bundle>")} ${chalk.yellow("<editor>")} ${chalk.dim("[directory]")}`);
  console.log(`    npx maestro-bundle ${chalk.green("<bundle>")} ${chalk.yellow("<editor>")} ${chalk.dim("[directory]")} --no-sdd`);
  console.log("");
  console.log(chalk.dim("  Bundles:"));
  for (const [key, info] of Object.entries(BUNDLES)) {
    console.log(`    ${chalk.green(key.padEnd(26))} ${info.desc}`);
  }
  console.log("");
  console.log(chalk.dim("  Editors:"));
  console.log(`    ${chalk.yellow("claude".padEnd(12))} CLAUDE.md + .claude/skills/name/SKILL.md`);
  console.log(`    ${chalk.yellow("cursor".padEnd(12))} AGENTS.md + .cursor/skills/name/SKILL.md`);
  console.log(`    ${chalk.yellow("codex".padEnd(12))} AGENTS.md (all in one file)`);
  console.log(`    ${chalk.yellow("copilot".padEnd(12))} .github/copilot-instructions.md + .github/instructions/`);
  console.log(`    ${chalk.yellow("windsurf".padEnd(12))} .windsurfrules (all in one file)`);
  console.log(`    ${chalk.yellow("all".padEnd(12))} Install for all editors in the same repo`);
  console.log("");
  console.log(chalk.dim("  Options:"));
  console.log(`    ${chalk.dim("--no-sdd")}     Skip GitHub Spec Kit (no /speckit.* commands, just AGENTS.md + skills)`);
  console.log("");
  console.log(chalk.dim("  Examples:"));
  console.log(`    npx maestro-bundle ai-agents claude`);
  console.log(`    npx maestro-bundle ai-agents claude --no-sdd        ${chalk.dim("# Without SDD")}`);
  console.log(`    npx maestro-bundle jhipster-monorepo cursor ./my-project`);
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

  // --- Skills (Claude Code: .claude/skills/name/SKILL.md) ---
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

  const noSdd = args.includes("--no-sdd");
  const filteredArgs = args.filter(a => a !== "--no-sdd");
  const bundleName = filteredArgs[0];
  const editorArg = filteredArgs[1];
  const targetDir = resolve(filteredArgs[2] || ".");

  if (!BUNDLES[bundleName]) {
    console.error(chalk.red(`\n  Bundle "${bundleName}" not found.\n`));
    showHelp();
    process.exit(1);
  }
  if (!EDITORS[editorArg]) {
    console.error(chalk.red(`\n  Editor "${editorArg}" not found.\n`));
    showHelp();
    process.exit(1);
  }

  const bundleInfo = BUNDLES[bundleName];
  const templatesDir = join(__dirname, "..", "templates");
  const baseDir = join(templatesDir, "bundle-base");
  const bundleDir = join(templatesDir, `bundle-${bundleName}`);

  if (!existsSync(bundleDir)) {
    console.error(chalk.red(`\n  Templates for "${bundleName}" not founds.\n`));
    process.exit(1);
  }

  // Build AGENTS.md (base + bundle)
  let agentsMd = readFile(join(baseDir, "AGENTS.md"));
  const bundleAgents = readFile(join(bundleDir, "AGENTS.md"));
  if (bundleAgents) agentsMd += "\n\n---\n\n" + bundleAgents;

  // If --no-sdd, strip SDD sections from AGENTS.md
  if (noSdd) {
    agentsMd = agentsMd
      .replace(/## FUNDAMENTAL RULE: Specification-Driven Development[\s\S]*?(?=\n## )/g, "")
      .replace(/## Specification-Driven Development[\s\S]*?(?=\n## )/g, "")
      .replace(/The fundamental SDD rule[\s\S]*?(?=\n## )/g, "");
  }

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
  console.log(chalk.dim(`  Target:  ${targetDir}`));
  console.log("");

  // 1. Install for each editor
  for (const editorKey of editorsToInstall) {
    const spinner = ora(`Installing for ${EDITORS[editorKey].name}`).start();
    const results = installForEditor(editorKey, agentsMd, skills, targetDir);
    spinner.succeed(`${EDITORS[editorKey].name}: ${results.join(", ")}`);
  }

  // 2. PRD template
  const prdTemplate = join(bundleDir, "PRD_TEMPLATE.md");
  if (existsSync(prdTemplate)) {
    const prdDest = join(targetDir, "PRD.md");
    if (!existsSync(prdDest)) {
      cpSync(prdTemplate, prdDest);
      const spinnerPrd = ora("PRD.md template installed").start();
      spinnerPrd.succeed("PRD.md template installed (fill in your product requirements)");
    }
  }

  // 3. LangChain Skills (for AI bundles)
  if (bundleName === "ai-agents" || bundleName === "ai-agents-deep") {
    const spinnerLc = ora("Installing LangChain Skills (langchain-ai/langchain-skills)").start();
    try {
      // Install all 11 LangChain skills for the chosen editor
      const agentFlag = primaryEditor === "cursor" ? "cursor" : primaryEditor === "codex" ? "codex" : "claude-code";
      execSync(
        `npx skills add langchain-ai/langchain-skills --agent ${agentFlag} --skill "*" --yes`,
        { stdio: "pipe", timeout: 120000, cwd: targetDir, shell: true }
      );
      spinnerLc.succeed("11 LangChain Skills installed (framework-selection, langchain-*, langgraph-*, deep-agents-*)");
    } catch {
      // Fallback: try without --agent
      try {
        execSync(
          `npx skills add langchain-ai/langchain-skills --skill "*" --yes`,
          { stdio: "pipe", timeout: 120000, cwd: targetDir, shell: true }
        );
        spinnerLc.succeed("11 LangChain Skills installed");
      } catch {
        spinnerLc.warn("Install LangChain Skills manually:");
        console.log(chalk.dim("    npx skills add langchain-ai/langchain-skills --skill '*' --yes"));
      }
    }
  }

  // 4. References
  const spinner3 = ora("Installing references").start();
  const refsSrc = join(bundleDir, "references");
  ensureDir(join(targetDir, "references"));
  if (existsSync(refsSrc)) {
    copyDir(refsSrc, join(targetDir, "references"));
  }
  spinner3.succeed("references/ ready");

  // 4. GitHub Spec Kit — install CLI + initialize in project (skip with --no-sdd)
  if (noSdd) {
    const spinnerSkip = ora("Skipping Spec Kit (--no-sdd)").start();
    spinnerSkip.info("Spec Kit skipped. Using AGENTS.md + skills only.");
  } else {
  // Map editor to specify --ai flag
  const aiFlags = {
    claude: "claude",
    cursor: "cursor-agent",
    codex: "codex",
    copilot: "copilot",
    windsurf: "windsurf",
  };
  // Use first editor as --ai (claude as default)
  const primaryEditor = editorsToInstall[0];
  const aiFlag = aiFlags[primaryEditor] || "claude";

  // 4a. Install specify-cli
  const SPECKIT_VERSION = "v0.4.3";
  const spinner4 = ora("Installing GitHub Spec Kit (specify-cli)").start();
  let specifyInstalled = false;

  // Check if already installed (specify doesn't accept --version, use --help)
  try {
    execSync("specify --help", { stdio: "ignore" });
    specifyInstalled = true;
    spinner4.succeed("specify-cli already installed");
  } catch {
    // Not installed — installing
    try {
      execSync(`uv tool install specify-cli --from "git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}"`, {
        stdio: "pipe", timeout: 120000,
      });
      specifyInstalled = true;
      spinner4.succeed(`specify-cli ${SPECKIT_VERSION} instalado`);
    } catch (err) {
      // May already be installed but uv returned error, check again
      try {
        execSync("specify --help", { stdio: "ignore" });
        specifyInstalled = true;
        spinner4.succeed("specify-cli already installed");
      } catch {
        spinner4.warn("Could not install automatically. Run manually:");
        console.log(chalk.dim(`    uv tool install specify-cli --from "git+https://github.com/github/spec-kit.git@${SPECKIT_VERSION}"`));
      }
    }
  }

  // 4b. Run specify init to create .specify/ and register /speckit.* commands
  if (specifyInstalled) {
    const spinner4c = ora(`Initializing Spec Kit in project (--ai ${aiFlag})`).start();
    const specifyEnv = { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1" };
    let specInitOk = false;

    // Need "y" piped because specify asks confirmation if dir not empty
    // --script sh to avoid pwsh dependency on Windows
    // --ai-skills required for codex
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
      spinner4c.succeed(`Spec Kit initialized (/speckit.* commands available)`);
    } else {
      spinner4c.warn("Initialize manually in your terminal:");
      console.log(chalk.dim(`    cd ${targetDir}`));
      console.log(chalk.dim(`    specify init . --ai ${aiFlag} --script sh`));
    }

    // 4c. Copy bundle constitution.md to .specify/memory/
    const specifyMemoryDir = join(targetDir, ".specify", "memory");
    const bundleConstitution = join(bundleDir, ".spec", "constitution.md");
    if (existsSync(bundleConstitution)) {
      ensureDir(specifyMemoryDir);
      const constitutionDest = join(specifyMemoryDir, "constitution.md");
      // Append bundle principles to constitution generated by specify
      if (existsSync(constitutionDest)) {
        const existing = readFileSync(constitutionDest, "utf-8");
        const bundleContent = readFileSync(bundleConstitution, "utf-8");
        writeFileSync(constitutionDest, existing + "\n\n---\n\n" + bundleContent);
      } else {
        cpSync(bundleConstitution, constitutionDest);
      }
      const spinner4d = ora("Bundle constitution integrated with Spec Kit").start();
      spinner4d.succeed("Bundle constitution integrated with Spec Kit");
    }
  }
  } // end if (!noSdd)

  // Done
  console.log("");
  console.log(chalk.green.bold("  Pronto!"));
  console.log("");
  console.log("  Files installed:");

  for (const editorKey of editorsToInstall) {
    const e = EDITORS[editorKey];
    console.log(`    ${chalk.yellow(e.name)}:`);
    if (editorKey === "claude") {
      console.log(`      ${chalk.cyan("CLAUDE.md")} → @AGENTS.md`);
      console.log(`      ${chalk.cyan(".claude/skills/")} (${skills.length} skills with SKILL.md)`);
    } else if (editorKey === "cursor") {
      console.log(`      ${chalk.cyan("AGENTS.md")} (general instructions)`);
      console.log(`      ${chalk.cyan(".cursor/skills/")} (${skills.length} skills with SKILL.md)`);
    } else if (editorKey === "codex") {
      console.log(`      ${chalk.cyan("AGENTS.md")} (all in one file)`);
    } else if (editorKey === "copilot") {
      console.log(`      ${chalk.cyan(".github/copilot-instructions.md")}`);
      console.log(`      ${chalk.cyan(".github/instructions/")} (${skills.length} .instructions.md)`);
    } else if (editorKey === "windsurf") {
      console.log(`      ${chalk.cyan(".windsurfrules")}`);
    }
  }

  if (!noSdd) {
    console.log(`    ${chalk.cyan(".specify/")} (GitHub Spec Kit — /speckit.* commands)`);
    console.log("");
    console.log("  SDD commands available in your editor:");
    console.log(`    ${chalk.cyan("/speckit.specify")}       — Specify WHAT and WHY`);
    console.log(`    ${chalk.cyan("/speckit.plan")}          — Plan architecture and stack`);
    console.log(`    ${chalk.cyan("/speckit.tasks")}         — Break into atomic tasks`);
    console.log(`    ${chalk.cyan("/speckit.implement")}     — Execute tasks`);
  }

  console.log("");
  console.log("  Next step:");
  if (noSdd) {
    console.log("    1. Fill in PRD.md with your product requirements");
    console.log("    2. Open the project in your AI editor and start coding");
  } else {
    console.log("    1. Fill in PRD.md with your product requirements");
    console.log("    2. Open the project in your AI editor");
    console.log("    3. Use " + chalk.cyan("/speckit.specify") + " to start your first feature");
  }
  console.log("");
}

main().catch((err) => {
  console.error(chalk.red(`\n  Erro: ${err.message}\n`));
  process.exit(1);
});
