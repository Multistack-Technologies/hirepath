import os
from pathlib import Path
from datetime import timedelta
from django.conf import settings
from dotenv import load_dotenv
from decouple import config
from pathlib import Path


load_dotenv()  # loads backend/.env

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY') 
DEBUG =  config('DEBUG', default=False, cast=bool)
GENAI_API_KEY = config("GENAI_API_KEY")
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # third-party
    "rest_framework",
    "corsheaders",
     'drf_yasg',
    

    # local apps
    "accounts",
    "companies",
    "jobs",
    "resumes",
    "matching",
    "skills",
    "applications",
    "universities",
    "degrees",
    "education",
    "certificate_providers",
    "certificates",
    "job_roles",
    "work_experience",
    "analytics",
   
   
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOW_ALL_ORIGINS = True

# Allow credentials (cookies, authorization headers)
CORS_ALLOW_CREDENTIALS = True

# Allowed methods
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]



# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.coreapi.AutoSchema',
}

# Swagger Settings
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
}

REDOC_SETTINGS = {
    'LAZY_RENDERING': False,
}

ROOT_URLCONF = "hirepath.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {"context_processors": [
            "django.template.context_processors.debug",
            "django.template.context_processors.request",
            "django.contrib.auth.context_processors.auth",
            "django.contrib.messages.context_processors.messages",
        ],},
    },
]

WSGI_APPLICATION = "hirepath.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": config("POSTGRES_DB"),
        "USER": config("POSTGRES_USER"),
        "PASSWORD": config("POSTGRES_PASSWORD"),
        "HOST": config("POSTGRES_HOST", "localhost"),
        "PORT": config("POSTGRES_PORT", "3306"),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'", # Recommended for Django
            'charset': 'utf8mb4', # Recommended charset
        },
    }
}

AUTH_PASSWORD_VALIDATORS = []
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Johannesburg"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

AUTH_USER_MODEL = "accounts.User"


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {"ACCESS_TOKEN_LIFETIME": timedelta(hours=12)}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO', # Adjust level as needed (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'django_debug.log'), # Log file in your project directory
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO', # Adjust level as needed
    },
}

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# backend/settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'mail.hirepath.co.za'  # or your SMTP server
EMAIL_PORT = 465
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'noreply@hirepath.co.za'
EMAIL_HOST_PASSWORD = '^ItqQT8Fl5H51f8n'
DEFAULT_FROM_EMAIL = 'noreply@hirepath.co.za'
SERVER_EMAIL = 'noreply@hirepath.co.za'

# Custom settings
SITE_NAME = 'Hire-path'
SUPPORT_EMAIL = 'noreply@hirepath.co.za'
REPLY_TO_EMAIL = 'noreply@hirepath.co.za'

# Celery Configuration
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'