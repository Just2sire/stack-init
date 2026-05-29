import JSZip from 'jszip';
import type { ProjectConfig } from '@stack-init/schema';
import { slugify } from './common';

function toPythonType(type: string): string {
  const map: Record<string, string> = {
    string: 'str', char: 'str', text: 'str', tinyText: 'str', mediumText: 'str', longText: 'str',
    integer: 'int', tinyInteger: 'int', smallInteger: 'int', mediumInteger: 'int',
    bigInteger: 'int', unsignedInteger: 'int', unsignedBigInteger: 'int',
    boolean: 'bool',
    float: 'float', double: 'float', decimal: 'float',
    date: 'date', dateTime: 'datetime', timestamp: 'datetime', timestampTz: 'datetime',
    json: 'dict', jsonb: 'dict', uuid: 'UUID', ulid: 'str',
    foreignId: 'int', foreignUuid: 'str',
    enum: 'str',
  };
  return map[type] ?? 'str';
}

export async function generateFastAPIProject(zip: JSZip, config: ProjectConfig) {
  const { models, name: projectName } = config;
  const opts = config.fastapi || {
    architecture: 'layered', orm: 'sqlmodel', db_engine: 'postgresql',
    cors: true, swagger: true, migrations: true, auth: 'none',
    async_mode: true, python_version: '3.11', runner: 'makefile',
  } as any;

  const asyncMode      = opts.async_mode ?? true;
  const asyncKw        = asyncMode ? 'async ' : '';
  const awaitKw        = asyncMode ? 'await ' : '';
  const authMode: string = opts.auth || 'none';
  const useAuth        = authMode !== 'none';
  const useJwt         = authMode === 'jwt' || authMode === 'oauth2';
  const useApiKey      = authMode === 'api-key';
  const useOAuth2      = authMode === 'oauth2';
  const useRateLimit   = opts.rate_limiting === true;
  const useBgTasks     = opts.background_tasks === true;
  const useWebsockets  = opts.websockets === true;
  const useMigrations  = opts.migrations === true;
  const orm: string    = opts.orm || 'sqlmodel';
  const dbEngine: string = opts.db_engine || 'postgresql';
  const runner: string        = opts.runner        || 'makefile';
  const architecture: string  = opts.architecture  || 'layered';
  const pythonVersion: string = opts.python_version || '3.11';

  // ── requirements.txt ─────────────────────────────────────────────────────────

  const deps: Record<string, string> = {
    'fastapi': '==0.115.6',
    'uvicorn[standard]': '==0.34.0',
    'python-dotenv': '==1.0.1',
    'pydantic[email]': '==2.10.4',
  };

  if (orm === 'sqlmodel' || orm === 'none' || !orm) deps['sqlmodel'] = '==0.0.22';
  if (orm === 'sqlalchemy') { deps['sqlalchemy'] = '==2.0.36'; deps['alembic'] = '==1.14.0'; }
  if (orm === 'tortoise-orm') { deps['tortoise-orm'] = '==0.21.7'; deps['aerich'] = '==0.7.2'; }
  if (orm === 'beanie') { deps['beanie'] = '==1.28.0'; deps['motor'] = '==3.7.0'; }

  if (dbEngine === 'postgresql' && orm !== 'beanie') deps['psycopg2-binary'] = '==2.9.10';
  if (dbEngine === 'mysql' && orm !== 'beanie') deps['pymysql'] = '==1.1.1';
  if (dbEngine === 'sqlite' && (orm === 'sqlalchemy' || orm === 'none')) deps['aiosqlite'] = '==0.20.0';
  if (dbEngine === 'mongodb' || orm === 'beanie') deps['motor'] = '==3.7.0';

  if (useJwt) { deps['python-jose[cryptography]'] = '==3.3.0'; deps['passlib[bcrypt]'] = '==1.7.4'; }
  if (useApiKey) deps['python-jose[cryptography]'] = '==3.3.0';
  if (useRateLimit) deps['slowapi'] = '==0.1.9';
  if (useWebsockets) deps['websockets'] = '==14.1';
  if (useMigrations && orm !== 'sqlalchemy') deps['alembic'] = '==1.14.0';

  zip.file('requirements.txt', Object.entries(deps).map(([k, v]) => k + v).join('\n') + '\n');

  // ── .env ─────────────────────────────────────────────────────────────────────

  const dbDefault = dbEngine === 'mysql'
    ? `mysql+pymysql://user:password@localhost:3306/${projectName}`
    : dbEngine === 'sqlite'
    ? `sqlite+aiosqlite:///./dev.db`
    : dbEngine === 'mongodb' || orm === 'beanie'
    ? `mongodb://localhost:27017/${projectName}`
    : `postgresql://user:password@localhost:5432/${projectName}`;

  const fapiEnvLines = [
    `DATABASE_URL="${dbDefault}"`,
    ...(useJwt    ? [`SECRET_KEY="change-me-in-production"`, `ACCESS_TOKEN_EXPIRE_MINUTES="30"`] : []),
    ...(useApiKey ? [`API_KEY="your-api-key-here"`] : []),
  ];
  zip.file('.env.example', fapiEnvLines.join('\n') + '\n');
  zip.file('.env', `DATABASE_URL="${dbDefault}"\nSECRET_KEY="stack-init-dev-secret"\nACCESS_TOKEN_EXPIRE_MINUTES="30"\n`);

  // ── pyproject.toml + .python-version ─────────────────────────────────────────

  const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  zip.file('pyproject.toml', `[project]\nname = "${projectSlug}"\nversion = "0.1.0"\ndescription = ""\nrequires-python = ">=${pythonVersion}"\n\n[build-system]\nrequires = ["setuptools>=68"]\nbuild-backend = "setuptools.backends.legacy:build"\n`);
  zip.file('.python-version', `${pythonVersion}\n`);

  // ── auth.py ───────────────────────────────────────────────────────────────────

  if (useJwt) {
    const oauth2Extra = useOAuth2 ? `
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")
` : `
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
`;

    zip.file('app/auth.py', `from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
${oauth2Extra}

SECRET_KEY = "stack-init-dev-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return username
`);
  }

  if (useApiKey) {
    zip.file('app/auth.py', `import os
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader

API_KEY_HEADER = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key: str = Security(API_KEY_HEADER)):
    expected = os.getenv("API_KEY", "stack-init-api-key")
    if api_key != expected:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing API Key",
        )
    return api_key
`);
  }

  // ── database.py ───────────────────────────────────────────────────────────────

  if (orm !== 'beanie' && orm !== 'tortoise-orm') {
    if (orm === 'sqlalchemy') {
      if (asyncMode) {
        zip.file('app/database.py', `import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

class Base(DeclarativeBase):
    pass

database_url = os.getenv("DATABASE_URL", "${dbDefault}")
engine = create_async_engine(database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
`);
      } else {
        zip.file('app/database.py', `import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

class Base(DeclarativeBase):
    pass

database_url = os.getenv("DATABASE_URL", "${dbDefault}")
engine = create_engine(database_url, echo=False)
SessionLocal = sessionmaker(bind=engine)

def create_db_and_tables():
    Base.metadata.create_all(engine)

def get_session():
    with SessionLocal() as session:
        yield session
`);
      }
    } else {
      // SQLModel
      if (asyncMode) {
        zip.file('app/database.py', `import os
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL", "${dbDefault}")
engine = create_async_engine(database_url, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
`);
      } else {
        zip.file('app/database.py', `import os
from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv

load_dotenv()

database_url = os.getenv("DATABASE_URL", "${dbDefault}")
engine = create_engine(database_url, echo=False)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
`);
      }
    }
  }

  if (orm === 'beanie') {
    zip.file('app/database.py', `import os
import motor.motor_asyncio
from beanie import init_beanie
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "${dbDefault}")

async def init_db(document_models: list):
    client = motor.motor_asyncio.AsyncIOMotorClient(DATABASE_URL)
    db = client.get_default_database()
    await init_beanie(database=db, document_models=document_models)
`);
  }

  if (orm === 'tortoise-orm') {
    zip.file('app/database.py', `import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "${dbDefault}")

TORTOISE_ORM = {
    "connections": {"default": DATABASE_URL},
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        },
    },
}
`);
  }

  // ── background tasks ──────────────────────────────────────────────────────────

  if (useBgTasks) {
    zip.file('app/tasks.py', `import logging

logger = logging.getLogger(__name__)

def send_welcome_email(email: str):
    """Example background task — replace with real logic."""
    logger.info(f"Sending welcome email to {email}")

def process_data(data: dict):
    """Example background task for data processing."""
    logger.info(f"Processing data: {data}")
`);
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────────

  if (useWebsockets) {
    zip.file('app/websocket.py', `from fastapi import APIRouter, WebSocket, WebSocketDisconnect

ws_router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@ws_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"Message: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
`);
  }

  // ── main.py ───────────────────────────────────────────────────────────────────

  const corsImport = opts.cors !== false ? `from fastapi.middleware.cors import CORSMiddleware\n` : '';
  const corsMiddleware = opts.cors !== false ? `
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
` : '';
  const swaggerArgs = opts.swagger === false ? ', docs_url=None, redoc_url=None' : '';
  const rateLimitImport = useRateLimit ? `from slowapi import Limiter, _rate_limit_exceeded_handler\nfrom slowapi.util import get_remote_address\nfrom slowapi.errors import RateLimitExceeded\n` : '';
  const rateLimitSetup = useRateLimit ? `
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
` : '';

  const ormLifespan = orm === 'beanie'
    ? `from contextlib import asynccontextmanager
from app.database import init_db
${models.map(m => `from app.models.${m.name.toLowerCase()} import ${m.name}`).join('\n')}

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db([${models.map(m => m.name).join(', ')}])
    yield
`
    : orm === 'tortoise-orm'
    ? `from contextlib import asynccontextmanager
from tortoise.contrib.fastapi import RegisterTortoise
from app.database import TORTOISE_ORM

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with RegisterTortoise(app, config=TORTOISE_ORM, generate_schemas=True):
        yield
`
    : asyncMode
    ? `from contextlib import asynccontextmanager
from app.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    yield
`
    : `from contextlib import asynccontextmanager
from app.database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield
`;

  // Architecture-aware router imports
  const routableModels = models.filter(m => (m.generate?.routes !== false) && (m.generate?.controller !== false));
  let routerImports: string;
  let includeRouters: string;
  switch (architecture) {
    case 'flat':
      routerImports  = routableModels.map(m => `from app.routers import ${m.name.toLowerCase()}_router`).join('\n');
      includeRouters = routableModels.map(m => `app.include_router(${m.name.toLowerCase()}_router)`).join('\n');
      break;
    case 'feature-based':
      routerImports  = routableModels.map(m => `from app.features.${m.name.toLowerCase()}.router import router as ${m.name.toLowerCase()}_router`).join('\n');
      includeRouters = routableModels.map(m => `app.include_router(${m.name.toLowerCase()}_router)`).join('\n');
      break;
    case 'domain':
      routerImports  = routableModels.map(m => `from app.api.${m.name.toLowerCase()}.router import router as ${m.name.toLowerCase()}_router`).join('\n');
      includeRouters = routableModels.map(m => `app.include_router(${m.name.toLowerCase()}_router)`).join('\n');
      break;
    default: // layered
      routerImports  = routableModels.map(m => `from app.routers import ${m.name.toLowerCase()}`).join('\n');
      includeRouters = routableModels.map(m => `app.include_router(${m.name.toLowerCase()}.router)`).join('\n');
  }

  const wsImport = useWebsockets ? `from app.websocket import ws_router\n` : '';
  const bgTasksImport = useBgTasks ? `from app.tasks import send_welcome_email  # noqa: F401\n` : '';

  let oauthTokenEndpoint = '';
  if (useOAuth2) {
    oauthTokenEndpoint = `
from fastapi.security import OAuth2PasswordRequestForm
from app.auth import create_access_token

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # TODO: Validate against your user database
    if form_data.username == "admin" and form_data.password == "secret":
        token = create_access_token(data={"sub": form_data.username})
        return {"access_token": token, "token_type": "bearer"}
    from fastapi import HTTPException, status
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
`;
  }

  zip.file('app/main.py', `from fastapi import FastAPI, Depends
${corsImport}${rateLimitImport}${ormLifespan}${routerImports}
${wsImport}${bgTasksImport}

app = FastAPI(title="${projectName} API"${swaggerArgs}, lifespan=lifespan)
${corsMiddleware}
${rateLimitSetup}
${oauthTokenEndpoint}
${includeRouters}
${useWebsockets ? 'app.include_router(ws_router)' : ''}

@app.get("/")
def read_root():
    return {"message": "Welcome to ${projectName} API"}
`);

  // ── Alembic ───────────────────────────────────────────────────────────────────

  if (useMigrations) {
    zip.file('alembic.ini', `[alembic]
script_location = alembic
prepend_sys_path = .
version_path_separator = os
sqlalchemy.url = driver://user:pass@localhost/dbname

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
`);

    zip.file('alembic/env.py', `from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
from dotenv import load_dotenv

load_dotenv()

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL", ""))

# Import your models here so Alembic can detect schema changes
# from app.models.user import User  # noqa: F401

target_metadata = None  # Replace with SQLModel.metadata or Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(config.get_section(config.config_ini_section, {}), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
`);
    zip.file('alembic/versions/.gitkeep', '');
    zip.file('alembic/README', 'Generic single-database configuration.');
  }

  // ── Architecture init files ───────────────────────────────────────────────────

  if (architecture === 'feature-based') {
    zip.file('app/features/__init__.py', '');
  } else if (architecture === 'domain') {
    zip.file('app/domain/__init__.py', '');
    zip.file('app/api/__init__.py', '');
  } else {
    zip.file('app/models/__init__.py', '');
    zip.file('app/routers/__init__.py', '');
  }

  // ── Per-model files ───────────────────────────────────────────────────────────

  for (const model of models) {
    const mLow = model.name.toLowerCase();
    const gen  = model.generate ?? {};

    // Paths based on architecture
    const modelFilePath = architecture === 'feature-based'
      ? `app/features/${mLow}/models.py`
      : architecture === 'domain'
      ? `app/domain/${mLow}/entity.py`
      : `app/models/${mLow}.py`;
    const routerFilePath = architecture === 'feature-based'
      ? `app/features/${mLow}/router.py`
      : architecture === 'domain'
      ? `app/api/${mLow}/router.py`
      : `app/routers/${mLow}.py`;
    const modelImportPath = architecture === 'feature-based'
      ? `app.features.${mLow}.models`
      : architecture === 'domain'
      ? `app.domain.${mLow}.entity`
      : `app.models.${mLow}`;

    if (architecture === 'feature-based') {
      zip.file(`app/features/${mLow}/__init__.py`, '');
    } else if (architecture === 'domain') {
      zip.file(`app/domain/${mLow}/__init__.py`, '');
      zip.file(`app/api/${mLow}/__init__.py`, '');
    }

    // Model file
    if (orm === 'beanie') {
      const beanieFields = model.fields.map(f => {
        const pyType = toPythonType(f.type);
        return f.nullable
          ? `    ${f.name}: Optional[${pyType}] = None`
          : `    ${f.name}: ${pyType}`;
      }).join('\n');

      zip.file(modelFilePath, `from typing import Optional
from beanie import Document

class ${model.name}(Document):
${beanieFields}

    class Settings:
        name = "${model.table || mLow}s"
`);
    } else if (orm === 'tortoise-orm') {
      const tortFields = model.fields.map(f => {
        let fieldClass = 'fields.CharField(max_length=255)';
        switch (f.type) {
          case 'integer': case 'tinyInteger': case 'smallInteger': fieldClass = 'fields.IntField()'; break;
          case 'bigInteger': fieldClass = 'fields.BigIntField()'; break;
          case 'boolean': fieldClass = 'fields.BooleanField()'; break;
          case 'float': case 'double': fieldClass = 'fields.FloatField()'; break;
          case 'decimal': fieldClass = 'fields.DecimalField(max_digits=10, decimal_places=2)'; break;
          case 'date': fieldClass = 'fields.DateField()'; break;
          case 'dateTime': case 'timestamp': fieldClass = 'fields.DatetimeField()'; break;
          case 'text': case 'longText': fieldClass = 'fields.TextField()'; break;
          case 'json': case 'jsonb': fieldClass = 'fields.JSONField()'; break;
          case 'uuid': fieldClass = 'fields.UUIDField()'; break;
        }
        const nullable = f.nullable ? 'null=True, ' : '';
        return `    ${f.name} = ${fieldClass.replace('(', `(${nullable}`)}`;
      }).join('\n');

      zip.file(modelFilePath, `from tortoise import fields, models

class ${model.name}(models.Model):
    id = fields.IntField(pk=True)
${tortFields}
${model.migration?.timestamps ? `    created_at = fields.DatetimeField(auto_now_add=True)\n    updated_at = fields.DatetimeField(auto_now=True)` : ''}

    class Meta:
        table = "${model.table || mLow}s"
`);
    } else if (orm === 'sqlalchemy') {
      const saTypeMap: Record<string, string> = {
        string: 'String', char: 'String', text: 'Text', tinyText: 'Text', mediumText: 'Text', longText: 'Text',
        integer: 'Integer', tinyInteger: 'SmallInteger', smallInteger: 'SmallInteger', mediumInteger: 'Integer',
        bigInteger: 'BigInteger', unsignedInteger: 'Integer', unsignedBigInteger: 'BigInteger',
        boolean: 'Boolean',
        float: 'Float', double: 'Float', decimal: 'Numeric',
        date: 'Date', dateTime: 'DateTime', timestamp: 'DateTime', timestampTz: 'DateTime',
        json: 'JSON', jsonb: 'JSON', uuid: 'String', ulid: 'String',
        foreignId: 'Integer', foreignUuid: 'String', enum: 'String',
      };
      const saColTypes = [...new Set(model.fields.map(f => saTypeMap[f.type] ?? 'String'))];
      const saImports  = ['Column', 'Integer', ...saColTypes].filter((v, i, a) => a.indexOf(v) === i).join(', ');

      const saFields = model.fields.map(f => {
        const colType = saTypeMap[f.type] ?? 'String';
        const nullable = f.nullable ? ', nullable=True' : '';
        const unique   = f.unique   ? ', unique=True'   : '';
        const index    = f.index    ? ', index=True'    : '';
        return `    ${f.name} = Column(${colType}${nullable}${unique}${index})`;
      }).join('\n');

      const timestamps = model.migration?.timestamps
        ? `    created_at = Column(DateTime, server_default=func.now())\n    updated_at = Column(DateTime, onupdate=func.now())`
        : '';

      const pyFields = model.fields.map(f => {
        const pyType = toPythonType(f.type);
        return f.nullable
          ? `    ${f.name}: Optional[${pyType}] = None`
          : `    ${f.name}: ${pyType}`;
      }).join('\n');
      const pyFieldsOptional = model.fields.map(f => `    ${f.name}: Optional[${toPythonType(f.type)}] = None`).join('\n');

      zip.file(modelFilePath, `from typing import Optional
from sqlalchemy import ${saImports}${model.migration?.timestamps ? ', DateTime' : ''}
from sqlalchemy.sql import func
from pydantic import BaseModel
from app.database import Base

class ${model.name}(Base):
    __tablename__ = "${model.table || mLow}s"
    id = Column(Integer, primary_key=True, index=True)
${saFields}
${timestamps}

class ${model.name}Base(BaseModel):
${pyFields || '    pass'}

class ${model.name}Create(${model.name}Base):
    pass

class ${model.name}Read(${model.name}Base):
    id: int
    class Config:
        from_attributes = True

class ${model.name}Update(BaseModel):
${pyFieldsOptional || '    pass'}
`);
    } else {
      // SQLModel (default)
      const pythonFields = model.fields.map(f => {
        let pyType = toPythonType(f.type);
        const fieldArgs: string[] = [];
        if (f.nullable) { pyType = `Optional[${pyType}]`; }
        if (f.unique)    fieldArgs.push('unique=True');
        if (f.index)     fieldArgs.push('index=True');
        const fieldCall = fieldArgs.length ? ` = Field(${fieldArgs.join(', ')})` : (f.nullable ? ' = None' : '');
        return `    ${f.name}: ${pyType}${fieldCall}`;
      }).join('\n');

      zip.file(modelFilePath, `from typing import Optional
from datetime import datetime, date
from uuid import UUID
from sqlmodel import Field, SQLModel

class ${model.name}Base(SQLModel):
${pythonFields || '    pass'}

class ${model.name}(${model.name}Base, table=True):
    __tablename__ = "${model.table || mLow}s"
    id: Optional[int] = Field(default=None, primary_key=True)
${model.migration?.timestamps ? `    created_at: datetime = Field(default_factory=datetime.utcnow)\n    updated_at: datetime = Field(default_factory=datetime.utcnow)` : ''}

class ${model.name}Create(${model.name}Base):
    pass

class ${model.name}Read(${model.name}Base):
    id: int

class ${model.name}Update(SQLModel):
${model.fields.map(f => `    ${f.name}: Optional[${toPythonType(f.type)}] = None`).join('\n') || '    pass'}
`);
    }

    // Router file
    if (gen.routes !== false && gen.controller !== false) {
      if (orm === 'tortoise-orm') {
        const authDep = useAuth && useJwt ? `, current_user: str = Depends(get_current_user)` : useApiKey ? `, api_key: str = Depends(get_api_key)` : '';
        const authImport = useAuth
          ? useApiKey
            ? `from app.auth import get_api_key`
            : `from app.auth import get_current_user`
          : '';

        zip.file(routerFilePath, `from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ${modelImportPath} import ${model.name}
${authImport}

router = APIRouter(prefix="/${slugify(model.name)}", tags=["${mLow}"])

@router.post("/", status_code=201)
async def create_${mLow}(data: dict${authDep}):
    item = await ${model.name}.create(**data)
    return item

@router.get("/")
async def read_${mLow}s(${authDep.trimStart().replace(', ', '') || ''}):
    return await ${model.name}.all()

@router.get("/{item_id}")
async def read_${mLow}(item_id: int${authDep}):
    item = await ${model.name}.get_or_none(id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    return item

@router.patch("/{item_id}")
async def update_${mLow}(item_id: int, data: dict${authDep}):
    item = await ${model.name}.get_or_none(id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    await item.update_from_dict(data).save()
    return item

@router.delete("/{item_id}", status_code=204)
async def delete_${mLow}(item_id: int${authDep}):
    item = await ${model.name}.get_or_none(id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    await item.delete()
`);
      } else if (orm === 'beanie') {
        const authDep = useAuth
          ? useApiKey ? `, api_key: str = Depends(get_api_key)` : `, current_user: str = Depends(get_current_user)`
          : '';
        const authImport = useAuth
          ? useApiKey ? `from app.auth import get_api_key` : `from app.auth import get_current_user`
          : '';

        zip.file(routerFilePath, `from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ${modelImportPath} import ${model.name}
${authImport}

router = APIRouter(prefix="/${slugify(model.name)}", tags=["${mLow}"])

@router.post("/", status_code=201)
async def create_${mLow}(data: dict${authDep}):
    item = ${model.name}(**data)
    await item.insert()
    return item

@router.get("/")
async def read_${mLow}s():
    return await ${model.name}.find_all().to_list()

@router.get("/{item_id}")
async def read_${mLow}(item_id: str${authDep}):
    item = await ${model.name}.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    return item

@router.patch("/{item_id}")
async def update_${mLow}(item_id: str, data: dict${authDep}):
    item = await ${model.name}.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    await item.set(data)
    return item

@router.delete("/{item_id}", status_code=204)
async def delete_${mLow}(item_id: str${authDep}):
    item = await ${model.name}.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="${model.name} not found")
    await item.delete()
`);
      } else {
        // SQLModel or SQLAlchemy router (session-based, very similar API)
        const isSA = orm === 'sqlalchemy';
        const sessionDep = asyncMode
          ? 'session: AsyncSession = Depends(get_session)'
          : isSA ? 'session: Session = Depends(get_session)' : 'session: Session = Depends(get_session)';
        const sessionImport = asyncMode
          ? `from sqlalchemy.ext.asyncio import AsyncSession`
          : isSA ? `from sqlalchemy.orm import Session` : `from sqlmodel import Session`;
        const selectImport = isSA ? `from sqlalchemy import select` : `from sqlmodel import select`;

        const authDep = useAuth
          ? useApiKey
            ? `, api_key: str = Depends(get_api_key)`
            : `, current_user: str = Depends(get_current_user)`
          : '';
        const authImport = useAuth
          ? useApiKey
            ? `from app.auth import get_api_key`
            : `from app.auth import get_current_user`
          : '';
        const bgTasksParam = useBgTasks ? ', background_tasks: BackgroundTasks' : '';
        const bgTasksImportLine = useBgTasks ? 'from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks' : 'from fastapi import APIRouter, Depends, HTTPException, Query';
        const bgTasksExample = useBgTasks ? `\n    background_tasks.add_task(send_welcome_email, "user@example.com")` : '';
        const bgTasksServiceImport = useBgTasks ? `from app.tasks import send_welcome_email` : '';

        const selectFn: string = asyncMode
          ? `(await session.execute(select(${model.name}).offset(offset).limit(limit))).scalars().all()`
          : isSA
            ? `session.execute(select(${model.name}).offset(offset).limit(limit)).scalars().all()`
            : `session.exec(select(${model.name}).offset(offset).limit(limit)).all()`;
        const getFn: string = asyncMode
          ? `(await session.execute(select(${model.name}).where(${model.name}.id == item_id))).scalar_one_or_none()`
          : isSA
            ? `session.execute(select(${model.name}).where(${model.name}.id == item_id)).scalar_one_or_none()`
            : `session.get(${model.name}, item_id)`;
        const createFn: string = isSA
          ? `${model.name}(**data.model_dump())`
          : `${model.name}.from_orm(data)`;
        const addFn: string    = asyncMode ? `session.add(db_item)\n    await session.commit()\n    await session.refresh(db_item)` : `session.add(db_item)\n    session.commit()\n    session.refresh(db_item)`;
        const commitFn: string = asyncMode ? `await session.commit()\n    await session.refresh(item)` : `session.commit()\n    session.refresh(item)`;
        const deleteFn: string = asyncMode ? `await session.delete(item)\n    await session.commit()` : `session.delete(item)\n    session.commit()`;

        const routerLines: string[] = [
          bgTasksImportLine,
          selectImport,
          `from typing import List`,
          sessionImport,
          `from app.database import get_session`,
          `from ${modelImportPath} import ${model.name}, ${model.name}Create, ${model.name}Read, ${model.name}Update`,
          authImport,
          bgTasksServiceImport,
          ``,
          `router = APIRouter(prefix="/${slugify(model.name)}", tags=["${mLow}"])`,
          ``,
          `@router.post("/", response_model=${model.name}Read, status_code=201)`,
          `${asyncKw}def create_${mLow}(*, ${sessionDep}, data: ${model.name}Create${authDep}${bgTasksParam}):`,
          `    db_item = ${createFn}`,
          `    ${addFn}${bgTasksExample}`,
          `    return db_item`,
          ``,
          `@router.get("/", response_model=List[${model.name}Read])`,
          `${asyncKw}def read_${mLow}s(*, ${sessionDep}, offset: int = 0, limit: int = Query(default=100, le=100)${authDep}):`,
          `    return ${awaitKw}${selectFn}`,
          ``,
          `@router.get("/{item_id}", response_model=${model.name}Read)`,
          `${asyncKw}def read_${mLow}(*, ${sessionDep}, item_id: int${authDep}):`,
          `    item = ${awaitKw}${getFn}`,
          `    if not item:`,
          `        raise HTTPException(status_code=404, detail="${model.name} not found")`,
          `    return item`,
          ``,
          `@router.patch("/{item_id}", response_model=${model.name}Read)`,
          `${asyncKw}def update_${mLow}(*, ${sessionDep}, item_id: int, data: ${model.name}Update${authDep}):`,
          `    item = ${awaitKw}${getFn}`,
          `    if not item:`,
          `        raise HTTPException(status_code=404, detail="${model.name} not found")`,
          `    for key, value in data.model_dump(exclude_unset=True).items():`,
          `        setattr(item, key, value)`,
          `    ${commitFn}`,
          `    return item`,
          ``,
          `@router.delete("/{item_id}", status_code=204)`,
          `${asyncKw}def delete_${mLow}(*, ${sessionDep}, item_id: int${authDep}):`,
          `    item = ${awaitKw}${getFn}`,
          `    if not item:`,
          `        raise HTTPException(status_code=404, detail="${model.name} not found")`,
          `    ${deleteFn}`,
        ];
        zip.file(routerFilePath, routerLines.join('\n'));
      }
    }
  }

  // ── Runner files ──────────────────────────────────────────────────────────────

  if (runner === 'makefile' || runner === undefined) {
    const migrateTarget = useMigrations ? `\nmigrate:\n\talembic upgrade head\n\nrevision:\n\talembic revision --autogenerate -m "auto"` : '';
    zip.file('Makefile', `dev:\n\tuvicorn app.main:app --reload\n\ninstall:\n\tpip install -r requirements.txt${migrateTarget}\n`);
  }

  if (runner === 'bash') {
    zip.file('scripts/dev.sh', `#!/bin/bash\nuvicorn app.main:app --reload\n`);
    zip.file('scripts/install.sh', `#!/bin/bash\npip install -r requirements.txt\n`);
    if (useMigrations) {
      zip.file('scripts/migrate.sh', `#!/bin/bash\nalembic upgrade head\n`);
    }
    // Make scripts executable note
    zip.file('scripts/README.md', `# Scripts\nRun \`chmod +x scripts/*.sh\` to make scripts executable.\n`);
  }
}
