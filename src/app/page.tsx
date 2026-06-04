"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import {
  Layers, Database, Zap, FileCode, Globe,
  Sparkles, Table, GitBranch, Package, BookOpen, Download,
  Code2, Settings2, Check, Blocks, ChevronRight, Folder,
  FolderOpen, Terminal, Play, Cpu, Eye, HelpCircle
} from "lucide-react";
import { NavAuthButton } from "@/components/auth/NavAuthButton";
import { HeroIllustration } from "@/components/landing/HeroIllustration";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

/* ─── Static Mock Data for Interactive Stacks ───────────────────────── */

interface FileNode {
  name: string;
  isFolder: boolean;
  children?: FileNode[];
  contentKey?: string;
}

const STACKS_DATA: Record<string, {
  name: string;
  badge: string;
  color: string;
  icon: string;
  desc: string;
  checklist: string[];
  files: FileNode[];
  codeSnippets: Record<string, string>;
}> = {
  nestjs: {
    name: "NestJS",
    badge: "Node.js",
    color: "#ea2845",
    icon: "/icons/nestjs.svg",
    desc: "Modular, decorator-based server architecture for enterprise scalable backends.",
    checklist: ["Decorator Controllers", "Service Injectables", "DTO Validations", "TypeORM Schema"],
    files: [
      {
        name: "src",
        isFolder: true,
        children: [
          {
            name: "controllers",
            isFolder: true,
            children: [{ name: "user.controller.ts", isFolder: false, contentKey: "controller" }]
          },
          {
            name: "services",
            isFolder: true,
            children: [{ name: "user.service.ts", isFolder: false, contentKey: "service" }]
          },
          { name: "app.module.ts", isFolder: false, contentKey: "module" }
        ]
      },
      { name: "package.json", isFolder: false, contentKey: "pkg" }
    ],
    codeSnippets: {
      controller: `import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';\nimport { UserService } from './user.service';\nimport { CreateUserDto } from './dto/create-user.dto';\nimport { JwtAuthGuard } from '../auth/jwt-auth.guard';\n\n@Controller('users')\nexport class UserController {\n  constructor(private readonly userService: UserService) {}\n\n  @Post()\n  create(@Body() createUserDto: CreateUserDto) {\n    return this.userService.create(createUserDto);\n  }\n\n  @Get()\n  @UseGuards(JwtAuthGuard)\n  findAll() {\n    return this.userService.findAll();\n  }\n}`,
      service: `import { Injectable, NotFoundException } from '@nestjs/common';\nimport { InjectRepository } from '@nestjs/typeorm';\nimport { Repository } from 'typeorm';\nimport { User } from './entities/user.entity';\n\n@Injectable()\nexport class UserService {\n  constructor(\n    @InjectRepository(User)\n    private readonly userRepository: Repository<User>,\n  ) {}\n\n  async findAll(): Promise<User[]> {\n    return this.userRepository.find();\n  }\n}`,
      module: `import { Module } from '@nestjs/common';\nimport { TypeOrmModule } from '@nestjs/typeorm';\nimport { UserController } from './controllers/user.controller';\nimport { UserService } from './services/user.service';\nimport { User } from './entities/user.entity';\n\n@Module({\n  imports: [TypeOrmModule.forFeature([User])],\n  controllers: [UserController],\n  providers: [UserService],\n})\nexport class UserModule {}`,
      pkg: `{\n  "name": "nest-stack-init",\n  "version": "1.0.0",\n  "dependencies": {\n    "@nestjs/common": "^10.0.0",\n    "@nestjs/core": "^10.0.0",\n    "@nestjs/typeorm": "^10.0.0",\n    "typeorm": "^0.3.17",\n    "class-validator": "^0.14.0"\n  }\n}`
    }
  },
  laravel: {
    name: "Laravel",
    badge: "PHP",
    color: "#ff4d6d",
    icon: "/icons/laravel.svg",
    desc: "The PHP framework for Web Artisans. Elegant MVC scaffolding with migrations & Eloquent models.",
    checklist: ["Eloquent Relationships", "API Resource Controllers", "Database Migrations", "Request Validations"],
    files: [
      {
        name: "app",
        isFolder: true,
        children: [
          {
            name: "Http",
            isFolder: true,
            children: [
              {
                name: "Controllers",
                isFolder: true,
                children: [{ name: "UserController.php", isFolder: false, contentKey: "controller" }]
              }
            ]
          },
          {
            name: "Models",
            isFolder: true,
            children: [{ name: "User.php", isFolder: false, contentKey: "model" }]
          }
        ]
      },
      {
        name: "database",
        isFolder: true,
        children: [
          {
            name: "migrations",
            isFolder: true,
            children: [{ name: "2026_01_01_create_users_table.php", isFolder: false, contentKey: "migration" }]
          }
        ]
      }
    ],
    codeSnippets: {
      controller: `<?php\n\nnamespace App\\Http\\Controllers;\n\nuse App\\Models\\User;\nuse Illuminate\\Http\\Request;\n\nclass UserController extends Controller\n{\n    public function index()\n    {\n        return User::with('posts')->paginate(15);\n    }\n\n    public function store(Request $request)\n    {\n        $validated = $request->validate([\n            'name' => 'required|string|max:255',\n            'email' => 'required|email|unique:users',\n        ]);\n\n        return User::create($validated);\n    }\n}`,
      model: `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\nuse Illuminate\\Database\\Eloquent\\Relations\\HasMany;\n\nclass User extends Model\n{\n    protected $fillable = ['name', 'email'];\n\n    public function posts(): HasMany\n    {\n        return $this->hasMany(Post::class);\n    }\n}`,
      migration: `<?php\n\nuse Illuminate\\Database\\Migrations\\Migration;\nuse Illuminate\\Database\\Schema\\Blueprint;\nuse Illuminate\\Support\\Facades\\Schema;\n\nreturn new class extends Migration {\n    public function up(): void\n    {\n        Schema::create('users', function (Blueprint $table) {\n            $table->id();\n            $table->string('name');\n            $table->string('email')->unique();\n            $table->timestamps();\n        });\n    }\n};`
    }
  },
  express: {
    name: "Express",
    badge: "Node.js",
    color: "#00c4cc",
    icon: "/icons/expressjs.svg",
    desc: "Lightweight, minimal web framework for flexible REST APIs built in TypeScript.",
    checklist: ["Router Orchestration", "Controller Handlers", "CORS & Auth Middlewares", "Prisma Database Client"],
    files: [
      {
        name: "src",
        isFolder: true,
        children: [
          {
            name: "controllers",
            isFolder: true,
            children: [{ name: "user.controller.ts", isFolder: false, contentKey: "controller" }]
          },
          {
            name: "routes",
            isFolder: true,
            children: [{ name: "user.routes.ts", isFolder: false, contentKey: "routes" }]
          },
          { name: "app.ts", isFolder: false, contentKey: "app" }
        ]
      },
      { name: "package.json", isFolder: false, contentKey: "pkg" }
    ],
    codeSnippets: {
      controller: `import { Request, Response } from 'express';\nimport { PrismaClient } from '@prisma/client';\n\nconst prisma = new PrismaClient();\n\nexport class UserController {\n  async index(req: Request, res: Response) {\n    const users = await prisma.user.findMany();\n    return res.json(users);\n  }\n\n  async store(req: Request, res: Response) {\n    const { name, email } = req.body;\n    const user = await prisma.user.create({ data: { name, email } });\n    return res.status(201).json(user);\n  }\n}`,
      routes: `import { Router } from 'express';\nimport { UserController } from '../controllers/user.controller';\n\nconst router = Router();\nconst controller = new UserController();\n\nrouter.get('/', (req, res) => controller.index(req, res));\nrouter.post('/', (req, res) => controller.store(req, res));\n\nexport default router;`,
      app: `import express from 'express';\nimport cors from 'cors';\nimport userRouter from './routes/user.routes';\n\nconst app = express();\napp.use(cors());\napp.use(express.json());\n\napp.use('/api/users', userRouter);\n\napp.listen(3000, () => console.log('Ready on http://localhost:3000'));`,
      pkg: `{\n  "name": "express-stack-init",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.19.2",\n    "cors": "^2.8.5",\n    "@prisma/client": "^5.10.0"\n  }\n}`
    }
  },
  fastapi: {
    name: "FastAPI",
    badge: "Python",
    color: "#009688",
    icon: "/icons/fastapi.svg",
    desc: "Performant, type-safe Python API engine supporting auto Swagger UI and Pydantic validation.",
    checklist: ["Pydantic Type Schemas", "Dependency Injection", "SQLAlchemy ORM Model", "Swagger Document Generation"],
    files: [
      {
        name: "app",
        isFolder: true,
        children: [
          {
            name: "api",
            isFolder: true,
            children: [{ name: "users.py", isFolder: false, contentKey: "api" }]
          },
          {
            name: "models",
            isFolder: true,
            children: [{ name: "user.py", isFolder: false, contentKey: "model" }]
          },
          { name: "main.py", isFolder: false, contentKey: "main" }
        ]
      },
      { name: "requirements.txt", isFolder: false, contentKey: "reqs" }
    ],
    codeSnippets: {
      api: `from fastapi import APIRouter, Depends, HTTPException\nfrom sqlalchemy.orm import Session\nfrom app.models.user import User\nfrom app.api.deps import get_db\n\nrouter = APIRouter()\n\n@router.get("/")\ndef read_users(db: Session = Depends(get_db)):\n    return db.query(User).all()`,
      model: `from sqlalchemy import Column, Integer, String\nfrom app.database import Base\n\nclass User(Base):\n    __tablename__ = "users"\n\n    id = Column(Integer, primary_key=True, index=True)\n    name = Column(String)\n    email = Column(String, unique=True, index=True)`,
      main: `from fastapi import FastAPI\nfrom app.api import users\n\napp = FastAPI(title="FastAPI Stack-Init")\n\napp.include_router(users.router, prefix="/users", tags=["Users"])`,
      reqs: `fastapi>=0.110.0\nuvicorn>=0.28.0\nsqlalchemy>=2.0.0\npydantic[email]>=2.6.0`
    }
  },
  react: {
    name: "React",
    badge: "Frontend",
    color: "#61dafb",
    icon: "/icons/react.svg",
    desc: "Modern client dashboard equipped with fully-typed components, API clients, and State Stores.",
    checklist: ["Vite & TS Setup", "Zustand State Stores", "Fully Typed Hooks", "Interactive UI Components"],
    files: [
      {
        name: "src",
        isFolder: true,
        children: [
          {
            name: "components",
            isFolder: true,
            children: [{ name: "UserList.tsx", isFolder: false, contentKey: "component" }]
          },
          {
            name: "store",
            isFolder: true,
            children: [{ name: "useUserStore.ts", isFolder: false, contentKey: "store" }]
          },
          { name: "App.tsx", isFolder: false, contentKey: "app" }
        ]
      },
      { name: "vite.config.ts", isFolder: false, contentKey: "vite" }
    ],
    codeSnippets: {
      component: `import React, { useEffect } from 'react';\nimport { useUserStore } from '../store/useUserStore';\n\nexport const UserList: React.FC = () => {\n  const { users, loading, fetchUsers } = useUserStore();\n\n  useEffect(() => {\n    fetchUsers();\n  }, []);\n\n  if (loading) return <div>Loading database entries...</div>;\n\n  return (\n    <ul>\n      {users.map(user => (\n        <li key={user.id}>{user.name} ({user.email})</li>\n      ))}\n    </ul>\n  );\n};`,
      store: `import { create } from 'zustand';\n\nexport const useUserStore = create((set) => ({\n  users: [],\n  loading: false,\n  fetchUsers: async () => {\n    set({ loading: true });\n    const res = await fetch('/api/users');\n    set({ users: await res.json(), loading: false });\n  }\n}));`,
      app: `import React from 'react';\nimport { UserList } from './components/UserList';\n\nfunction App() {\n  return (\n    <div className="container">\n      <h1>Stack-Init Client</h1>\n      <UserList />\n    </div>\n  );\n}\n\nexport default App;`,
      vite: `import { defineConfig } from 'vite';\nimport react from '@vitejs/react-plugin';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: 3000,\n  },\n});`
    }
  }
};

/* ─── Main Component ────────────────────────────────────────────────── */

export default function Home() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");

  // Features Console Active Tab
  const [activeTab, setActiveTab] = useState<string>("visual");
  const tabListRef = useRef<HTMLDivElement>(null);

  // Stack Inspector Active Stack
  const [activeStackKey, setActiveStackKey] = useState<string>("nestjs");
  const activeStack = STACKS_DATA[activeStackKey];

  // Directory File Tree State
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "src": true, "app": true, "Http": true, "Controllers": true
  });
  const [activeFileKey, setActiveFileKey] = useState<string>("controller");

  // Visual Modeler Sandbox State
  const [modelerFields, setModelerFields] = useState<Array<{ name: string; type: string; isNull: boolean }>>([
    { name: "id", type: "integer", isNull: false },
    { name: "name", type: "string", isNull: false },
    { name: "email", type: "string", isNull: false }
  ]);
  const [newFieldName, setNewFieldName] = useState<string>("");
  const [newFieldType, setNewFieldType] = useState<string>("string");

  // AI Prompt Simulated Typewriter State
  const [aiPromptText, setAiPromptText] = useState<string>("");
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [aiGeneratedOutput, setAiGeneratedOutput] = useState<boolean>(false);
  const promptToSimulate = "Scaffold a complete e-commerce microservice. Models: User, Store, Product, Order. Relations: Store hasMany Products, User hasMany Orders. Connect via PostgreSQL database client.";

  // SQL Schema Parse State
  const [sqlParsed, setSqlParsed] = useState<boolean>(false);
  const [isSqlParsing, setIsSqlParsing] = useState<boolean>(false);
  const rawSqlSample = `CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  owner_id INT REFERENCES users(id)
);`;

  // Presets State
  const [activePreset, setActivePreset] = useState<string>("saas");
  const presetsData: Record<string, Array<{ name: string; type: string }>> = {
    saas: [
      { name: "User", type: "Auth Profile" },
      { name: "Tenant", type: "Organization" },
      { name: "Subscription", type: "Billing Tier" },
      { name: "Plan", type: "Product Pricing" }
    ],
    ecommerce: [
      { name: "Customer", type: "Buyer Profile" },
      { name: "Product", type: "Stock Item" },
      { name: "Order", type: "Checkout Log" },
      { name: "Category", type: "Group taxonomy" }
    ],
    blog: [
      { name: "Author", type: "Editor Identity" },
      { name: "Post", type: "Markdown Article" },
      { name: "Comment", type: "Visitor Feedback" },
      { name: "Tag", type: "Classifier" }
    ]
  };

  // Stack Config Switches Simulation
  const [stackConfig, setStackConfig] = useState<Record<string, boolean>>({
    auth: true,
    tests: false,
    swagger: true,
    docker: false
  });

  // Handle directory tree folder toggle
  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  // Handle visual modeler field addition
  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim()) return;
    setModelerFields(prev => [...prev, {
      name: newFieldName.trim().toLowerCase(),
      type: newFieldType,
      isNull: false
    }]);
    setNewFieldName("");
  };

  // Handle AI Typewriter trigger
  const runAiSimulation = () => {
    if (isAiTyping) return;
    setAiPromptText("");
    setAiGeneratedOutput(false);
    setIsAiTyping(true);

    let charIndex = 0;
    const interval = setInterval(() => {
      setAiPromptText(prev => prev + promptToSimulate.charAt(charIndex));
      charIndex++;
      if (charIndex >= promptToSimulate.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAiTyping(false);
          setAiGeneratedOutput(true);
        }, 600);
      }
    }, 15);
  };

  // Handle SQL Parser trigger
  const runSqlParserSimulation = () => {
    if (isSqlParsing) return;
    setIsSqlParsing(true);
    setSqlParsed(false);
    setTimeout(() => {
      setIsSqlParsing(false);
      setSqlParsed(true);
    }, 1200);
  };

  // Synchronize dynamic code key when stack switches
  useEffect(() => {
    const defaultKeys = Object.keys(activeStack.codeSnippets);
    if (defaultKeys.length > 0) {
      setActiveFileKey(defaultKeys[0]);
    }
  }, [activeStackKey, activeStack]);

  // Tab Accessibility Keyboard Navigation
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const tabKeys = ["visual", "ai", "sql", "presets"];
    let nextIndex = index;
    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % tabKeys.length;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + tabKeys.length) % tabKeys.length;
    } else {
      return;
    }
    setActiveTab(tabKeys[nextIndex]);
    const tabElement = tabListRef.current?.children[nextIndex] as HTMLButtonElement;
    tabElement?.focus();
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      position: "relative",
    }}>

      {/* ── Background Cyber-Overlay Grid ─────────────────────────── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* Radial glowing meshes */}
        <div style={{
          position: "absolute", top: "-10%", right: "-10%",
          width: "60%", height: "60%",
          background: "radial-gradient(ellipse, rgba(245,200,66,0.06) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-10%", left: "-10%",
          width: "50%", height: "60%",
          background: "radial-gradient(ellipse, rgba(77,159,255,0.04) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "35%", left: "30%",
          width: "40%", height: "45%",
          background: "radial-gradient(ellipse, rgba(157,111,255,0.035) 0%, transparent 70%)",
        }} />
        {/* Glowing top barrier border */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(245,200,66,0.3) 30%, rgba(245,200,66,0.3) 70%, transparent)",
        }} />
      </div>

      {/* ── Navigation Menu ────────────────────────────────────────── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 clamp(16px, 4vw, 48px)", height: 68,
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(8,8,9,0.85)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} aria-label="StackInit Home">
          <Image src="/favicon.svg" alt="StackInit logo" width={26} height={26} />
          <span style={{ fontFamily: "var(--font-syne)", fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Stack<span style={{ color: "var(--gold)" }}>Init</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/guides" className="hidden sm:flex si-btn-secondary" style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 13, border: "none", background: "none"
          }}>
            <BookOpen size={14} style={{ marginRight: 6 }} />
            {tNav("guides")}
          </Link>
          <div style={{
            alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg3)",
            fontSize: 12, color: "var(--text3)",
          }} className="hidden md:flex">
            <span className="tech-dot-indicator green tech-pulse" />
            {tNav("freeOpenSource")}
          </div>
          <NavAuthButton />
          <LanguageSwitcher />
        </div>
      </nav>

      {/* ── HERO BANNER ────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16" style={{
        position: "relative", zIndex: 10,
        padding: "clamp(48px, 8vh, 96px) clamp(16px, 4vw, 48px) 48px",
        maxWidth: 1280, margin: "0 auto",
        alignItems: "center",
      }}>
        {/* Left — Text & CTAs */}
        <div>
          {/* Tagline Badge */}
          <div className="si-badge si-badge-gold" style={{
            padding: "6px 14px", borderRadius: 100, fontSize: 11, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 24,
            gap: 6
          }}>
            <Cpu size={12} className="tech-pulse" />
            {t("badge")}
          </div>

          {/* Heading */}
          <h1 className="tech-text-glow" style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(34px, 4.5vw, 58px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            marginBottom: 20,
            color: "var(--text)"
          }}>
            {t("headline1")}{" "}
            <span style={{ color: "var(--gold)", position: "relative", display: "inline-block" }}>
              {t("headline2")}
              <span style={{
                position: "absolute", bottom: -2, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, var(--gold), transparent)",
                borderRadius: 2,
              }} />
            </span>
          </h1>

          {/* Description */}
          <p style={{
            fontSize: "clamp(14px, 1.2vw, 16px)",
            color: "var(--text2)", lineHeight: 1.65,
            maxWidth: "min(460px, 100%)", marginBottom: 32,
          }}>
            {t.rich("description", { strong: (c) => <strong>{c}</strong> })}
          </p>

          {/* Actions */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
            <Link href="/create" className="si-btn-primary" style={{
              padding: "14px 32px", borderRadius: 10, fontSize: 15,
              boxShadow: "0 0 48px rgba(245,200,66,0.30), 0 4px 16px rgba(0,0,0,0.4)"
            }}>
              <Zap size={16} fill="currentColor" />
              {t("launchWizard")}
            </Link>
            <a href="#console" className="si-btn-secondary" style={{
              padding: "14px 28px", borderRadius: 10, fontSize: 15,
              background: "var(--bg3)", border: "1px solid var(--border-medium)"
            }}>
              <Eye size={16} style={{ marginRight: 6 }} />
              {t("exploreFeatures")}
            </a>
          </div>

          {/* Trust indicators */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { dot: "#FF2D20", label: "Laravel" },
              { dot: "#ea2845", label: "NestJS" },
              { dot: "#00c4cc", label: "Express" },
              { dot: "#009688", label: "FastAPI" },
              { dot: "#61dafb", label: "React" },
            ].map(({ dot, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Interactive Illustration */}
        <HeroIllustration />
      </section>

      {/* ── CORE FEATURE WORKSPACE CONSOLE (Interactive Modular Section) ── */}
      <section id="console" style={{
        position: "relative", zIndex: 10,
        padding: "40px clamp(16px, 4vw, 48px) 80px",
        maxWidth: 1200, margin: "0 auto"
      }}>
        <div className="si-card tech-card-glow" style={{ borderRadius: 18, background: "var(--bg3)" }}>
          
          {/* Card Window Header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 20px", borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg2)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {["#ff5f57", "#ffbd2e", "#28c840"].map((color) => (
                <span key={color} style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
              ))}
              <span style={{ fontSize: 12, color: "var(--text3)", marginLeft: 8, fontFamily: "var(--font-jetbrains-mono)" }}>
                stackinit_interactive_workspace_console.sh
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text3)" }}>
              <span className="tech-dot-indicator green tech-pulse" />
              <span>{tNav("systemReady")}</span>
            </div>
          </div>

          {/* Card Sub-Navigation Tabs */}
          <div ref={tabListRef} role="tablist" aria-label="App Features Console" style={{
            display: "flex",
            background: "rgba(14,14,16,0.5)",
            borderBottom: "1px solid var(--border-subtle)"
          }}>
            {[
              { id: "visual", label: t("console.tabVisual"), icon: <Database size={14} /> },
              { id: "ai", label: t("console.tabAi"), icon: <Sparkles size={14} /> },
              { id: "sql", label: t("console.tabSql"), icon: <Table size={14} /> },
              { id: "presets", label: t("console.tabPresets"), icon: <Package size={14} /> }
            ].map((tab, idx) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onKeyDown={(e) => handleTabKeyDown(e, idx)}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 10px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: isSelected ? "var(--gold)" : "var(--text2)",
                    background: isSelected ? "var(--bg3)" : "transparent",
                    border: "none",
                    borderBottom: isSelected ? "2px solid var(--gold)" : "2px solid transparent",
                    transition: "all 0.2s"
                  }}
                >
                  {tab.icon}
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panels Contents */}
          <div style={{ padding: "clamp(20px, 4vw, 36px)", background: "var(--bg3)" }}>
            
            {/* PANEL 1: VISUAL CANVAS MODELER */}
            {activeTab === "visual" && (
              <div id="panel-visual" role="tabpanel" aria-labelledby="tab-visual" className="si-step-panel grid grid-cols-1 lg:grid-cols-2 gap-7">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-5">
                  
                  {/* Table Definition Interactive Card */}
                  <div className="si-card" style={{ border: "1px solid var(--gold-border)", background: "var(--bg2)" }}>
                    <div style={{
                      padding: "10px 14px", background: "rgba(245,200,66,0.06)",
                      borderBottom: "1px solid var(--gold-border)", display: "flex", justifyContent: "space-between"
                    }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono)", color: "var(--gold)" }}>
                        User
                      </span>
                      <span className="si-badge si-badge-gold" style={{ fontSize: 9 }}>Model</span>
                    </div>
                    <div style={{ padding: 10 }}>
                      {modelerFields.map((field) => (
                        <div key={field.name} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "6px 8px", borderBottom: "1px solid var(--border-subtle)",
                          fontFamily: "var(--font-jetbrains-mono)", fontSize: 11
                        }}>
                          <span style={{ color: "var(--text)" }}>{field.name}</span>
                          <span className={`si-type-chip si-type-${field.type}`}>{field.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schema Controller panel */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Visual Schema Engine</h4>
                      <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
                        Define database schema parameters, columns and strict types visually. Hover relation points to establish links.
                      </p>
                    </div>
                    
                    <form onSubmit={handleAddField} style={{
                      display: "flex", flexDirection: "column", gap: 8, padding: 12,
                      background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid var(--border-subtle)"
                    }}>
                      <label htmlFor="field-name" style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600 }}>ADD NEW SCHEMA FIELD</label>
                      <input
                        id="field-name"
                        type="text"
                        placeholder="e.g. status, address"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="si-input"
                        style={{ padding: "6px 10px", fontSize: 12 }}
                      />
                      <select
                        aria-label="Field type selection"
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value)}
                        className="si-select"
                        style={{ padding: "6px 10px", fontSize: 12, backgroundPosition: "right 8px center" }}
                      >
                        <option value="string">string (varchar)</option>
                        <option value="integer">integer (int)</option>
                        <option value="boolean">boolean (tinyint)</option>
                        <option value="timestamp">timestamp (datetime)</option>
                        <option value="uuid">uuid (uuid)</option>
                      </select>
                      <button type="submit" className="si-btn-primary" style={{ padding: "6px 14px", fontSize: 12, width: "100%", justifyContent: "center" }}>
                        + Inject Field
                      </button>
                    </form>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
                  <SectionLabel>Visual Canvas Scaffolder</SectionLabel>
                  <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                    Dynamic relational canvas.
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    Build tables and schemas inside an interactive whiteboard ecosystem. Draw visual relations like <code style={{ color: "var(--gold)" }}>belongsTo</code>, <code style={{ color: "var(--gold)" }}>hasMany</code>, and constraints. Everything gets converted into framework entities, migrations, and schema configurations automatically.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="si-badge si-badge-teal">100% Client-side Rendering</span>
                    <span className="si-badge si-badge-blue">Auto-Calculates FKs</span>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: AI PROMPT IMPORT */}
            {activeTab === "ai" && (
              <div id="panel-ai" role="tabpanel" aria-labelledby="tab-ai" className="si-step-panel grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-7">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="si-card" style={{ background: "var(--bg2)", border: "1px solid var(--border-subtle)" }}>
                    
                    {/* Chat Prompt Display */}
                    <div style={{ padding: 14, borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 10 }}>
                      <Sparkles size={14} style={{ color: "var(--gold)" }} />
                      <span style={{ fontSize: 11, fontFamily: "var(--font-jetbrains-mono)", color: "var(--text2)", fontWeight: 700 }}>
                        AI SCHEMA EXTRACTION ENGINE
                      </span>
                    </div>

                    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: "50%", background: "var(--bg4)",
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700
                        }}>U</div>
                        <div style={{
                          flex: 1, padding: "10px 14px", borderRadius: "0 10px 10px 10px",
                          background: "var(--bg3)", fontSize: 12, border: "1px solid var(--border-subtle)",
                          minHeight: 40, fontFamily: "var(--font-jetbrains-mono)"
                        }}>
                          {aiPromptText || <span style={{ color: "var(--text3)" }}>Press the button below to simulate typing...</span>}
                          {isAiTyping && <span style={{ width: 2, height: 14, background: "var(--gold)", display: "inline-block", marginLeft: 2 }} className="tech-pulse" />}
                        </div>
                      </div>

                      {aiGeneratedOutput && (
                        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }} className="si-step-panel">
                          <div style={{
                            width: 24, height: 24, borderRadius: "50%", background: "var(--gold)", color: "var(--bg)",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800
                          }}>AI</div>
                          <div style={{
                            flex: 1, padding: "12px 14px", borderRadius: "0 10px 10px 10px",
                            background: "rgba(245,200,66,0.04)", fontSize: 12, border: "1px solid var(--gold-border)",
                            display: "flex", flexDirection: "column", gap: 6
                          }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)" }}>Generated Models detected:</span>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {["User", "Store", "Product", "Order"].map((model) => (
                                <span key={model} className="si-badge si-badge-gold" style={{ fontSize: 10 }}>{model}</span>
                              ))}
                            </div>
                            <span style={{ fontSize: 10, color: "var(--text3)" }}>Relationships established: Store hasMany Products, User hasMany Orders.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={runAiSimulation}
                    disabled={isAiTyping}
                    className="si-btn-primary"
                    style={{ alignSelf: "flex-start", fontSize: 13 }}
                  >
                    <Play size={14} fill="currentColor" />
                    {isAiTyping ? "AI Engine Extracting..." : "Simulate AI Query Parsing"}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
                  <SectionLabel>Natural Language AI Import</SectionLabel>
                  <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                    Talk to your codebase.
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    Describe your schema requirements in standard English or French text. The integrated LLM pipeline extracts entities, assigns accurate data type bounds, defines keys, and instantly compiles your relational models.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="si-badge si-badge-purple">Generative Schema Engine</span>
                    <span className="si-badge si-badge-teal">Multi-Language Parsing</span>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 3: SQL SCHEMA EXTRACTOR */}
            {activeTab === "sql" && (
              <div id="panel-sql" role="tabpanel" aria-labelledby="tab-sql" className="si-step-panel grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-7">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-3">
                    
                    {/* Raw SQL Snippet Input Mock */}
                    <div className="si-card" style={{ background: "var(--bg2)", border: "1px solid var(--border-subtle)" }}>
                      <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border-subtle)", fontSize: 11, color: "var(--text2)", fontFamily: "var(--font-jetbrains-mono)" }}>
                        import_schema.sql
                      </div>
                      <pre style={{
                        padding: 12, fontSize: 11, fontFamily: "var(--font-jetbrains-mono)",
                        color: "var(--text2)", overflowX: "auto", margin: 0
                      }}>
                        {rawSqlSample}
                      </pre>
                    </div>

                    {/* Parser Result output */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      {isSqlParsing ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20 }}>
                          <span className="tech-dot-indicator green tech-pulse" style={{ width: 12, height: 12 }} />
                          <span style={{ fontSize: 12, fontFamily: "var(--font-jetbrains-mono)" }}>Compiling DDL Schema...</span>
                        </div>
                      ) : sqlParsed ? (
                        <div className="si-card si-step-panel" style={{ border: "1px solid var(--green)", background: "rgba(77,255,145,0.03)", padding: 14 }}>
                          <h5 style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <Check size={14} strokeWidth={3} />
                            Success: 1 Model Compiled
                          </h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "var(--font-jetbrains-mono)", fontSize: 11 }}>
                            <div style={{ color: "var(--text)" }}>Table: <span style={{ color: "var(--gold)" }}>stores</span></div>
                            <div style={{ color: "var(--text3)" }}>· id: integer (PK)</div>
                            <div style={{ color: "var(--text3)" }}>· name: string (NOT NULL)</div>
                            <div style={{ color: "var(--text3)" }}>· owner_id: foreignId (FK)</div>
                          </div>
                        </div>
                      ) : (
                        <div className="si-card" style={{ padding: 14, textAlign: "center", color: "var(--text3)" }}>
                          <Table size={20} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
                          <span style={{ fontSize: 12 }}>Waiting for compilation execution.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={runSqlParserSimulation}
                    disabled={isSqlParsing}
                    className="si-btn-primary"
                    style={{ alignSelf: "flex-start", fontSize: 13 }}
                  >
                    <Play size={14} fill="currentColor" />
                    {isSqlParsing ? "Extracting Data structures..." : "Compile SQL Table Schema"}
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
                  <SectionLabel>SQL Schema DDL Import</SectionLabel>
                  <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                    Reverse-engineer instantly.
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    Already have a database dump or schema statement? Simply copy/paste your custom `.sql` DDL statements directly. Our compiler reverse-engineers the SQL constraints, unique indexes, and foreign references to reconstruct the schema models inside the builder.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="si-badge si-badge-teal">SQL Dialect-Agnostic</span>
                    <span className="si-badge si-badge-blue">Automatic Relation Links</span>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 4: PREBUILT MODULES */}
            {activeTab === "presets" && (
              <div id="panel-presets" role="tabpanel" aria-labelledby="tab-presets" className="si-step-panel grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-7">
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Preset Selector */}
                  <div style={{ display: "flex", gap: 8 }}>
                    {[
                      { id: "saas", label: "SaaS Starter Kit" },
                      { id: "ecommerce", label: "E-Commerce Core" },
                      { id: "blog", label: "Markdown Blog" }
                    ].map((preset) => {
                      const isSelected = activePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => setActivePreset(preset.id)}
                          className={isSelected ? "si-opt-chip selected" : "si-opt-chip"}
                          style={{ flex: 1, fontSize: 12, padding: "8px 10px" }}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Preset Model Output Map */}
                  <div className="si-card" style={{ background: "var(--bg2)", border: "1px solid var(--border-subtle)", padding: 16 }}>
                    <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                      INCLUDED PRESETS SCHEMAS
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {presetsData[activePreset].map((model) => (
                        <div key={model.name} className="si-step-panel" style={{
                          padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.02)",
                          border: "1px solid var(--border-subtle)"
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--gold)", fontFamily: "var(--font-jetbrains-mono)" }}>
                            {model.name}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>{model.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
                  <SectionLabel>One-Click Libraries</SectionLabel>
                  <h3 style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 800, fontFamily: "var(--font-syne)" }}>
                    Ready-made blueprints.
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                    Avoid repetitive standard configuration setups. Click to inject fully-formed module blocks like User Authentication, Stripe billing, Multi-Tenant workspaces, Blog directories, and inventory managers. Customize individual parameters afterwards inside the builder.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span className="si-badge si-badge-gold">JSON Presets Map</span>
                    <span className="si-badge si-badge-purple">Editable After Inject</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ── THE INTERACTIVE STACK INSPECTOR (Tactile Tech Section) ── */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "60px clamp(16px, 4vw, 48px) 80px",
        background: "rgba(10,10,12,0.3)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          
          {/* Section Headers */}
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 48px" }}>
            <SectionLabel>{t("stacks.sectionLabel")}</SectionLabel>
            <h2 style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 800,
              letterSpacing: "-0.03em", color: "var(--text)", marginTop: 8
            }}>
              {t("stacks.headline")}
            </h2>
            <p style={{ fontSize: 14, color: "var(--text3)", marginTop: 12 }}>
              {t("stacks.description")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-7">
            
            {/* Inspector Left - Dynamic Stack Toggles & Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              {/* Stack Selection Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-3 gap-2.5">
                {Object.entries(STACKS_DATA).map(([key, item]) => {
                  const isSelected = activeStackKey === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setActiveStackKey(key)}
                      role="button"
                      aria-label={`Inspect ${item.name} output`}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveStackKey(key); }}
                      className={`si-stack-card ${isSelected ? "selected" : ""}`}
                      style={{
                        padding: "16px 14px", display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 8, borderRadius: 12, textAlign: "center"
                      }}
                    >
                      <img src={item.icon} alt={`${item.name} icon`} style={{ width: 28, height: 28, position: "relative", zIndex: 10 }} />
                      <div style={{ position: "relative", zIndex: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{item.name}</div>
                        <div style={{ fontSize: 9, color: isSelected ? "var(--gold)" : "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                          {item.badge}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stack Summary Card */}
              <div className="si-card" style={{ padding: 20, background: "var(--bg3)", display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="tech-dot-indicator" style={{ backgroundColor: activeStack.color, boxShadow: `0 0 10px ${activeStack.color}` }} />
                    {activeStack.name} Scaffold System
                  </h4>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5, marginTop: 8 }}>
                    {activeStack.desc}
                  </p>
                </div>

                {/* Simulated Config Controls */}
                <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
                  <span style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                    SIMULATE BOILERPLATE PARAMS
                  </span>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { key: "auth", label: "Include Auth Guard" },
                      { key: "tests", label: "Unit Test Stubs" },
                      { key: "swagger", label: "OpenAPI Documentation" },
                      { key: "docker", label: "Docker Multi-stage" }
                    ].map((opt) => {
                      const isEnabled = stackConfig[opt.key];
                      return (
                        <div
                          key={opt.key}
                          onClick={() => setStackConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                          role="checkbox"
                          aria-checked={isEnabled}
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setStackConfig(prev => ({ ...prev, [opt.key]: !prev[opt.key] })); } }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                            borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--bg2)",
                            cursor: "pointer", transition: "all 0.15s"
                          }}
                        >
                          <div className={`si-toggle ${isEnabled ? "on" : ""}`} style={{ width: 28, height: 16 }}>
                            <div className="si-toggle-knob" style={{ width: 10, height: 10, top: 2, left: isEnabled ? 15 : 2 }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 500, color: isEnabled ? "var(--text)" : "var(--text2)" }}>{opt.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

            </div>

            {/* Inspector Right - Split folder tree explorer & code syntax display */}
            <div className="si-card grid grid-cols-1 sm:grid-cols-[170px_1fr] h-[380px] overflow-hidden border border-[var(--border-medium)]">
              
              {/* Directory File Explorer Tree Side */}
              <div style={{ background: "var(--bg2)", borderRight: "1px solid var(--border-subtle)", padding: "16px 12px", overflowY: "auto" }}>
                <span style={{ fontSize: 9, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                  FILE DIRECTORY
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {activeStack.files.map((node, i) => {
                    const renderNode = (n: FileNode, depth = 0) => {
                      const isFolder = n.isFolder;
                      const isOpen = expandedFolders[n.name];
                      const isSelected = activeFileKey === n.contentKey;

                      return (
                        <div key={n.name} style={{ display: "flex", flexDirection: "column" }}>
                          <button
                            onClick={() => isFolder ? toggleFolder(n.name) : n.contentKey && setActiveFileKey(n.contentKey)}
                            style={{
                              display: "flex", alignItems: "center", gap: 6, padding: "4px 6px",
                              borderRadius: 4, background: isSelected ? "rgba(255,255,255,0.04)" : "transparent",
                              border: "none", color: isSelected ? "var(--gold)" : isFolder ? "var(--text)" : "var(--text2)",
                              fontSize: 11, fontFamily: "var(--font-jetbrains-mono)", textAlign: "left",
                              cursor: "pointer", paddingLeft: `${depth * 10 + 6}px`, transition: "all 0.15s"
                            }}
                          >
                            {isFolder ? (
                              isOpen ? <FolderOpen size={12} style={{ color: "var(--gold)" }} /> : <Folder size={12} style={{ color: "var(--text3)" }} />
                            ) : (
                              <FileCode size={12} style={{ color: "var(--text3)" }} />
                            )}
                            <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{n.name}</span>
                          </button>

                          {isFolder && isOpen && n.children && (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              {n.children.map(child => renderNode(child, depth + 1))}
                            </div>
                          )}
                        </div>
                      );
                    };

                    return renderNode(node);
                  })}
                </div>
              </div>

              {/* Code Viewer Display Side */}
              <div style={{ background: "var(--bg3)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                
                {/* Code Viewer Tab Header */}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px", background: "var(--bg4)", borderBottom: "1px solid var(--border-subtle)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-jetbrains-mono)", color: "var(--text2)" }}>
                    <Terminal size={12} style={{ color: activeStack.color }} />
                    <span>CODE STACK PREVIEW</span>
                  </div>
                  <span className="si-badge si-badge-gray" style={{ fontSize: 9, fontFamily: "var(--font-jetbrains-mono)" }}>
                    {activeStackKey === "laravel" ? "PHP" : "TypeScript"}
                  </span>
                </div>

                {/* Code Lines Panel */}
                <div style={{ flex: 1, padding: 16, overflow: "auto", fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, lineHeight: 1.6 }}>
                  <pre style={{ margin: 0, color: "var(--text2)" }}>
                    <code>
                      {/* Simple regex-based syntax highlight replacement */}
                      {activeStack.codeSnippets[activeFileKey] ? (
                        activeStack.codeSnippets[activeFileKey]
                          .split('\n')
                          .map((line, idx) => {
                            // Inject auth controller guards based on state parameters
                            if (line.includes("@UseGuards") || line.includes("requireAuth")) {
                              if (!stackConfig.auth) return null;
                            }
                            return (
                              <div key={idx} style={{ display: "flex" }}>
                                <span style={{ color: "var(--text3)", width: 24, userSelect: "none", flexShrink: 0 }}>{idx + 1}</span>
                                <span style={{ whiteSpace: "pre-wrap" }}>
                                  {line.split(' ').map((word, wordIdx) => {
                                    if (word.startsWith('@') || word === 'export' || word === 'class' || word === 'import' || word === 'from' || word === 'extends') {
                                      return <span key={wordIdx} style={{ color: "var(--gold)" }}>{word} </span>;
                                    }
                                    if (word === 'public' || word === 'private' || word === 'async' || word === 'await' || word === 'return' || word === 'function') {
                                      return <span key={wordIdx} style={{ color: "#9d6fff" }}>{word} </span>;
                                    }
                                    if (word.includes("'") || word.includes('"')) {
                                      return <span key={wordIdx} style={{ color: "#4dff91" }}>{word} </span>;
                                    }
                                    return word + ' ';
                                  })}
                                </span>
                              </div>
                            );
                          })
                      ) : (
                        <div style={{ color: "var(--text3)", textAlign: "center", paddingTop: 40 }}>Click a file in directory to inspect code.</div>
                      )}
                    </code>
                  </pre>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ── MODULAR ROADMAP SETUP (Non-Scroll heavy step diagram) ── */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "80px clamp(16px, 4vw, 48px) 100px",
        maxWidth: 1100, margin: "0 auto"
      }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <SectionLabel>{t("pipeline.sectionLabel")}</SectionLabel>
          <h2 style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--text)"
          }}>
            {t("pipeline.headline")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {(["01", "02", "03", "04"] as const).map((step, index) => (
            <div key={step} className="si-card" style={{ padding: 24, position: "relative", border: "1px solid var(--border-subtle)" }}>
              {/* Step Connection Bar */}
              {index < 3 && (
                <div style={{
                  position: "absolute", top: "50%", right: "-12px",
                  width: 24, height: 1, borderTop: "1px dashed var(--border-medium)", zIndex: 10
                }} className="hidden md:block" />
              )}
              <div style={{
                fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, fontWeight: 700,
                color: "var(--gold)", marginBottom: 12
              }}>
                {t("pipeline.stepPrefix")} {step}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                {t(`pipeline.step${step}Title`)}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>
                {t(`pipeline.step${step}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL LAUNCH BANNER ───────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "0 clamp(16px, 4vw, 48px) 120px",
        maxWidth: 960, margin: "0 auto"
      }}>
        <div className="si-card" style={{
          borderRadius: 24,
          border: "1px solid var(--gold-border)",
          background: "linear-gradient(135deg, rgba(245,200,66,0.04) 0%, rgba(8,8,9,0) 100%)",
          padding: "clamp(40px, 6vw, 68px) 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Internal Glow Mesh */}
          <div aria-hidden style={{
            position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
            width: "80%", height: "150%", pointerEvents: "none",
            background: "radial-gradient(ellipse, rgba(245,200,66,0.06), transparent 70%)"
          }} />

          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: 16,
              background: "var(--gold)", color: "var(--bg)",
              fontSize: 24, marginBottom: 20
            }}>
              <Blocks size={24} />
            </div>

            <h2 style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 800,
              letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 12
            }}>
              {t("ctaHeadline")}
            </h2>
            <p style={{
              fontSize: 14, color: "var(--text2)", lineHeight: 1.6,
              marginBottom: 32, maxWidth: 500, margin: "0 auto 32px"
            }}>
              {t("ctaDesc")}
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/create" className="si-btn-primary" style={{
                padding: "13px 32px", borderRadius: 10, fontSize: 14,
                boxShadow: "0 0 32px rgba(245,200,66,0.25)"
              }}>
                <Zap size={15} fill="currentColor" />
                {t("ctaButton")}
              </Link>
              <div style={{
                padding: "13px 20px", borderRadius: 10, fontSize: 13,
                color: "var(--text3)", border: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", gap: 8, background: "var(--bg3)"
              }}>
                <Code2 size={13} />
                {t("ctaNote")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "24px clamp(16px, 4vw, 48px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 12, color: "var(--text3)",
        position: "relative", zIndex: 10,
        flexWrap: "wrap", gap: 12
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/favicon.svg" alt="StackInit footer logo" width={14} height={14} />
          <span>{t("footerText")}</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {([t("footerOpenSource"), t("footerClientSide"), t("footerMit")] as string[]).map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </footer>

    </main>
  );
}

/* ─── Sub-Components ────────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "var(--gold)",
      display: "inline-flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ display: "inline-block", width: 16, height: 1, background: "var(--gold)", borderRadius: 1 }} />
      {children}
    </div>
  );
}
