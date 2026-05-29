import JSZip from 'jszip';
import type { ProjectConfig, Model } from '@stack-init/schema';

type AnyField = { name: string; type: string; nullable?: boolean; unique?: boolean; default?: any }

function toPyModule(name: string): string {
  return name.replace(/[-\s]/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toLowerCase()
}

function snakeCase(str: string): string {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
}

function pluralize(str: string): string {
  if (str.endsWith('y') && !/[aeiou]y$/i.test(str)) return str.slice(0, -1) + 'ies'
  if (/(s|x|z|ch|sh)$/.test(str)) return str + 'es'
  return str + 's'
}

function toDjangoField(f: AnyField): string {
  const extras: string[] = []
  if (f.nullable) extras.push('null=True', 'blank=True')
  if (f.unique)   extras.push('unique=True')
  const extra = extras.length ? ', ' + extras.join(', ') : ''

  switch (f.type) {
    case 'string':        return `models.CharField(max_length=255${extra})`
    case 'char':          return `models.CharField(max_length=1${extra})`
    case 'text': case 'longText': case 'mediumText': case 'tinyText':
                          return `models.TextField(${extras.join(', ')})`
    case 'integer': case 'smallInteger': case 'mediumInteger': case 'tinyInteger':
                          return `models.IntegerField(${extras.join(', ')})`
    case 'bigInteger': case 'unsignedBigInteger':
                          return `models.BigIntegerField(${extras.join(', ')})`
    case 'unsignedInteger': case 'unsignedSmallInteger': case 'unsignedTinyInteger':
                          return `models.PositiveIntegerField(${extras.join(', ')})`
    case 'float': case 'double':
                          return `models.FloatField(${extras.join(', ')})`
    case 'decimal':       return `models.DecimalField(max_digits=10, decimal_places=2${extra})`
    case 'boolean':       return `models.BooleanField(${extras.join(', ')})`
    case 'date':          return `models.DateField(${extras.join(', ')})`
    case 'dateTime': case 'timestamp': case 'dateTimeTz': case 'timestampTz':
                          return `models.DateTimeField(${extras.join(', ')})`
    case 'time': case 'timeTz':
                          return `models.TimeField(${extras.join(', ')})`
    case 'json': case 'jsonb':
                          return `models.JSONField(${extras.join(', ')})`
    case 'uuid':          return `models.UUIDField(default=uuid.uuid4, editable=False${extra})`
    case 'foreignId':     return `models.IntegerField(${extras.join(', ')})`
    default:              return `models.CharField(max_length=255${extra})`
  }
}

function needsUuidImport(model: Model): boolean {
  return model.fields.some(f => (f as AnyField).type === 'uuid')
}

export async function generateDjangoProject(zip: JSZip, config: ProjectConfig): Promise<void> {
  const { models, name: projectName } = config
  const pyModule = toPyModule(projectName)

  // requirements.txt
  zip.file('requirements.txt', [
    'Django>=5.0,<6.0',
    'djangorestframework>=3.15',
    'psycopg2-binary>=2.9',
    'python-dotenv>=1.0',
    'django-cors-headers>=4.3',
  ].join('\n') + '\n')

  // pyproject.toml
  zip.file('pyproject.toml', `[project]
name = "${projectName}"
version = "0.1.0"
description = ""
requires-python = ">=3.11"
`)

  // .python-version
  zip.file('.python-version', '3.11\n')

  // .env / .env.example
  const dbUrl = `postgresql://user:password@localhost:5432/${pyModule}`
  zip.file('.env', `DATABASE_URL="${dbUrl}"\nSECRET_KEY="django-insecure-dev-change-me"\nDEBUG=True\n`)
  zip.file('.env.example', `DATABASE_URL="${dbUrl}"\nSECRET_KEY="your-secret-key"\nDEBUG=False\n`)

  // .gitignore
  zip.file('.gitignore', `__pycache__/\n*.py[cod]\n*.pyo\n.env\n.venv/\nvenv/\n*.sqlite3\n*.log\ndist/\nbuild/\n*.egg-info/\nstaticfiles/\n`)

  // Makefile
  zip.file('Makefile', `.PHONY: install migrate run shell superuser

install:
\tpip install -r requirements.txt

migrate:
\tpython manage.py makemigrations && python manage.py migrate

run:
\tpython manage.py runserver

shell:
\tpython manage.py shell

superuser:
\tpython manage.py createsuperuser
`)

  // manage.py
  zip.file('manage.py', `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', '${pyModule}.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
`)

  // Django project package
  const installedApps = [
    "    'django.contrib.admin',",
    "    'django.contrib.auth',",
    "    'django.contrib.contenttypes',",
    "    'django.contrib.sessions',",
    "    'django.contrib.messages',",
    "    'django.contrib.staticfiles',",
    "    'rest_framework',",
    "    'corsheaders',",
    ...models.map(m => `    'apps.${snakeCase(m.name)}',`),
  ].join('\n')

  const projectUrls = models.map(m => {
    const mSnake  = snakeCase(m.name)
    const mPlural = pluralize(mSnake)
    return `    path('api/${mPlural}/', include('apps.${mSnake}.urls')),`
  }).join('\n')

  zip.file(`${pyModule}/__init__.py`, '')
  zip.file(`${pyModule}/wsgi.py`, `import os\nfrom django.core.wsgi import get_wsgi_application\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', '${pyModule}.settings')\napplication = get_wsgi_application()\n`)
  zip.file(`${pyModule}/asgi.py`, `import os\nfrom django.core.asgi import get_asgi_application\nos.environ.setdefault('DJANGO_SETTINGS_MODULE', '${pyModule}.settings')\napplication = get_asgi_application()\n`)

  zip.file(`${pyModule}/settings.py`, `import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SECRET_KEY = os.environ.get('SECRET_KEY', 'insecure-fallback-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
${installedApps}
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = '${pyModule}.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.debug',
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

WSGI_APPLICATION = '${pyModule}.wsgi.application'

_db_url = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/${pyModule}')

def _parse_db_url(url):
    import re
    m = re.match(r'^(\\w+)://([^:@]*)(?::([^@]*))?@([^:/]*)(?::(\\d+))?/(.+)$', url)
    if not m:
        return {'ENGINE': 'django.db.backends.sqlite3', 'NAME': os.path.join(BASE_DIR, 'db.sqlite3')}
    scheme = m.group(1).replace('+psycopg2', '').replace('+psycopg', '')
    return {
        'ENGINE': {'postgresql': 'django.db.backends.postgresql', 'postgres': 'django.db.backends.postgresql',
                   'mysql': 'django.db.backends.mysql', 'sqlite': 'django.db.backends.sqlite3'}.get(scheme, 'django.db.backends.postgresql'),
        'NAME': m.group(6), 'USER': m.group(2), 'PASSWORD': m.group(3) or '',
        'HOST': m.group(4), 'PORT': m.group(5) or '5432',
    }

DATABASES = {'default': _parse_db_url(_db_url)}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': ['rest_framework.renderers.JSONRenderer', 'rest_framework.renderers.BrowsableAPIRenderer'],
    'DEFAULT_PERMISSION_CLASSES': [],
}

CORS_ALLOWED_ORIGINS = ['http://localhost:3000', 'http://localhost:5173']
`)

  zip.file(`${pyModule}/urls.py`, `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
${projectUrls}
]
`)

  // apps package
  zip.file('apps/__init__.py', '')

  // Per-model apps
  for (const model of models) {
    const mSnake  = snakeCase(model.name)
    const mPlural = pluralize(mSnake)
    const appDir  = `apps/${mSnake}`
    const hasUuid = needsUuidImport(model)
    const uuidImport = hasUuid ? 'import uuid\n' : ''

    const userFields = model.fields.filter(f => (f as AnyField).type !== 'id')
    const fieldLines = userFields.map(raw => {
      const f = raw as AnyField
      return `    ${f.name} = ${toDjangoField(f)}`
    }).join('\n')

    zip.file(`${appDir}/__init__.py`, '')

    zip.file(`${appDir}/apps.py`, `from django.apps import AppConfig\n\n\nclass ${model.name}Config(AppConfig):\n    default_auto_field = 'django.db.models.BigAutoField'\n    name = 'apps.${mSnake}'\n`)

    zip.file(`${appDir}/models.py`, `${uuidImport}from django.db import models\n\n\nclass ${model.name}(models.Model):\n${fieldLines || '    pass'}\n    created_at = models.DateTimeField(auto_now_add=True)\n    updated_at = models.DateTimeField(auto_now=True)\n\n    class Meta:\n        db_table = '${mPlural}'\n\n    def __str__(self):\n        return f'${model.name} #{"{self.pk}"}'\n`)

    zip.file(`${appDir}/serializers.py`, `from rest_framework import serializers\nfrom .models import ${model.name}\n\n\nclass ${model.name}Serializer(serializers.ModelSerializer):\n    class Meta:\n        model = ${model.name}\n        fields = '__all__'\n`)

    zip.file(`${appDir}/views.py`, `from rest_framework import viewsets\nfrom .models import ${model.name}\nfrom .serializers import ${model.name}Serializer\n\n\nclass ${model.name}ViewSet(viewsets.ModelViewSet):\n    queryset = ${model.name}.objects.all().order_by('-created_at')\n    serializer_class = ${model.name}Serializer\n`)

    zip.file(`${appDir}/urls.py`, `from rest_framework.routers import DefaultRouter\nfrom .views import ${model.name}ViewSet\n\nrouter = DefaultRouter()\nrouter.register(r'', ${model.name}ViewSet, basename='${mSnake}')\n\nurlpatterns = router.urls\n`)
  }
}
