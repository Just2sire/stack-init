"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Database, Server, ShieldCheck } from "lucide-react";

export function DatabaseStep() {
  const { stack, expressOptions, setExpressOptions, nestOptions, setNestOptions, fastapiOptions, setFastAPIOptions } = useWizardStore();

  const isExpress = stack === 'express' || stack === 'express+react';
  const isFastAPI = stack === 'fastapi' || stack === 'fastapi+react' || stack === 'fastapi+nextjs';

  const jsOrms = [
    { id: 'prisma',    title: 'Prisma',     desc: 'Type-safe ORM with automated migrations.',          icon: <img src="/icons/prisma.svg"      alt="Prisma"     className="w-5 h-5" /> },
    { id: 'drizzle',   title: 'Drizzle',    desc: 'Lightweight SQL-first ORM with great performance.', icon: <img src="/icons/drizzle-orm.svg" alt="Drizzle"    className="w-5 h-5" /> },
    { id: 'sequelize', title: 'Sequelize',  desc: 'Mature ORM supporting multiple dialects.',           icon: <img src="/icons/sequelize.svg"   alt="Sequelize"  className="w-5 h-5" /> },
    { id: 'typeorm',   title: 'TypeORM',    desc: 'Decorator-based ORM inspired by Hibernate.',         icon: <img src="/icons/typeorm.svg"     alt="TypeORM"    className="w-5 h-5" /> },
    { id: 'mongoose',  title: 'Mongoose',   desc: 'Elegant MongoDB object modeling.',                   icon: <img src="/icons/mongoose.svg"    alt="Mongoose"   className="w-5 h-5" /> },
  ];

  const pyOrms = [
    { id: 'sqlmodel',     title: 'SQLModel',     desc: 'FastAPI-native ORM built on SQLAlchemy + Pydantic.', icon: <Database size={20} /> },
    { id: 'sqlalchemy',   title: 'SQLAlchemy',   desc: 'The Python SQL toolkit and full-featured ORM.',      icon: <Server   size={20} /> },
    { id: 'tortoise-orm', title: 'Tortoise-ORM', desc: 'Easy async ORM inspired by the Django ORM.',         icon: <Database size={20} /> },
    { id: 'beanie',       title: 'Beanie',       desc: 'Async MongoDB ODM built on Motor and Pydantic.',     icon: <Server   size={20} /> },
  ];

  const orms = isFastAPI ? pyOrms : jsOrms;

  const engines = [
    { id: 'postgresql', title: 'PostgreSQL', icon: <img src="/icons/postgresql.svg" alt="PostgreSQL" className="w-6 h-6" /> },
    { id: 'mysql',      title: 'MySQL',      icon: <img src="/icons/mysql.svg"       alt="MySQL"      className="w-6 h-6" /> },
    { id: 'sqlite',     title: 'SQLite',     icon: <img src="/icons/sqlite.svg"      alt="SQLite"     className="w-6 h-6" /> },
    { id: 'mongodb',    title: 'MongoDB',    icon: <img src="/icons/mongodb.svg"     alt="MongoDB"    className="w-6 h-6" /> },
  ];

  const currentOrm    = isFastAPI ? fastapiOptions.orm       : (isExpress ? expressOptions.database : nestOptions.database);
  const currentEngine = isFastAPI ? fastapiOptions.db_engine : (isExpress ? expressOptions.db_engine : nestOptions.db_engine);

  const setOrm = (id: string) => {
    if (isFastAPI)      setFastAPIOptions({ orm: id as any });
    else if (isExpress) setExpressOptions({ database: id as any });
    else                setNestOptions({ database: id as any });
  };

  const setEngine = (id: string) => {
    if (isFastAPI)      setFastAPIOptions({ db_engine: id as any });
    else if (isExpress) setExpressOptions({ db_engine: id as any });
    else                setNestOptions({ db_engine: id as any });
  };

  const recommendation = isFastAPI
    ? <><strong>SQLModel + PostgreSQL</strong> for the best FastAPI developer experience with full type safety.</>
    : <><strong>Prisma + PostgreSQL</strong> for the best developer experience and type safety.</>;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">Database & ORM</h2>
        <p className="si-subtitle mt-2">Configure how your application interacts with data.</p>
      </div>

      {/* ORM Selection */}
      <section>
        <div className="si-section-label">Object-Relational Mapping</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orms.map((orm) => (
            <div
              key={orm.id}
              onClick={() => setOrm(orm.id)}
              className={[
                "si-stack-card p-4",
                currentOrm === orm.id ? "selected" : ""
              ].join(" ")}
              style={{
                opacity: currentOrm && currentOrm !== orm.id ? 0.6 : 1,
                background: currentOrm === orm.id ? "var(--gold-subtle)" : "var(--bg3)",
                borderColor: currentOrm === orm.id ? "var(--gold)" : undefined,
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-sm mb-2" style={{ color: currentOrm === orm.id ? "var(--gold)" : "var(--text)" }}>
                  {orm.icon}
                  {orm.title}
                </div>
                <p className="text-[11px] text-text3 leading-normal">{orm.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Engine Selection */}
      <section>
        <div className="si-section-label">Database Engine</div>
        <div className="flex flex-wrap gap-3">
          {engines.map((engine) => (
            <div
              key={engine.id}
              onClick={() => setEngine(engine.id)}
              className={[
                "si-opt-chip flex items-center gap-3",
                currentEngine === engine.id ? "selected" : ""
              ].join(" ")}
            >
              <span className="text-lg">{engine.icon}</span>
              {engine.title}
            </div>
          ))}
        </div>
      </section>

      <div className="si-info-card">
        <div className="flex gap-3">
          <ShieldCheck className="text-gold shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Recommendation</p>
            <p className="text-sm text-text2">
              For most {stack} projects, we recommend {recommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
