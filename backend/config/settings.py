import os

from datetime import timedelta
from pathlib import Path

import dj_database_url
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent





SECRET_KEY = config("SECRET_KEY")

DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="",
    cast=lambda v: [s.strip() for s in v.split(",")] if v else [],
)


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',


    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "drf_spectacular",
    "corsheaders",



    "apps.accounts",
    "apps.clients",
    "apps.exercises",
    "apps.workouts",
    "apps.progress",
    "apps.reviews",
    "apps.bookings",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

AUTH_USER_MODEL = 'accounts.User'


# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": config("DB_NAME"),
#         "USER": config("DB_USER"),
#         "PASSWORD": config("DB_PASSWORD"),
#         "HOST": config("DB_HOST", default="localhost"),
#         "PORT": config("DB_PORT", default="5432"),
#     }
# }

DATABASE_URL = config("DATABASE_URL", default=None)

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(DATABASE_URL)
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": config("DB_NAME"),
            "USER": config("DB_USER"),
            "PASSWORD": config("DB_PASSWORD"),
            "HOST": config("DB_HOST", default="localhost"),
            "PORT": config("DB_PORT", default="5432"),
        }
    }



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]




LANGUAGE_CODE = 'en-us'

# Store datetimes in UTC; TRAINER_TIMEZONE is used for booking/availability display.
TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

# Phase 1 Task 1 — confirmed platform decisions (override via .env)
TRAINER_TIMEZONE = config("TRAINER_TIMEZONE", default="Asia/Kolkata").strip()
FRONTEND_BASE_URL = config("FRONTEND_BASE_URL", default="http://localhost:5173").strip().rstrip("/")
VIDEO_PROVIDER = config("VIDEO_PROVIDER", default="zoom").strip().lower()  # zoom | google_meet
EMAIL_PROVIDER = config("EMAIL_PROVIDER", default="console").strip().lower()  # console | sendgrid

# Optional Zoom API credentials (used when VIDEO_PROVIDER=zoom and credentials are set)
ZOOM_ACCOUNT_ID = config("ZOOM_ACCOUNT_ID", default="").strip()
ZOOM_CLIENT_ID = config("ZOOM_CLIENT_ID", default="").strip()
ZOOM_CLIENT_SECRET = config("ZOOM_CLIENT_SECRET", default="").strip()




# STATIC_URL = 'static/'
# STATIC_ROOT = BASE_DIR / 'staticfiles'

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'





REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_FILTER_BACKENDS": (
        "django_filters.rest_framework.DjangoFilterBackend",
    ),
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}



SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


SPECTACULAR_SETTINGS = {
    "TITLE": "Fitness Coaching Platform API",
    "DESCRIPTION": "API for the Fitness Coaching & Client Progress Platform (Phase 1 web app).",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:5173",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)

# Ensure the public frontend origin is always allowed for CORS (Task 2)
if FRONTEND_BASE_URL and FRONTEND_BASE_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS = [*CORS_ALLOWED_ORIGINS, FRONTEND_BASE_URL]

# Transactional email (Phase 1 Task 1–2)
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL", default="noreply@haqqathlete.com").strip()
SERVER_EMAIL = DEFAULT_FROM_EMAIL
# Optional override for trainer booking alerts (defaults to booking.trainer.email)
TRAINER_NOTIFY_EMAIL = config("TRAINER_NOTIFY_EMAIL", default="").strip()
BOOKING_CANCELLATION_POLICY = config(
    "BOOKING_CANCELLATION_POLICY",
    default=(
        "Please cancel or reschedule at least 24 hours before your session by "
        "replying to this email. Late cancellations may forfeit the session."
    ),
).strip()

if EMAIL_PROVIDER == "sendgrid":
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_HOST = config("EMAIL_HOST", default="smtp.sendgrid.net")
    EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
    EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
    EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="apikey")
    EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")
    EMAIL_TIMEOUT = config("EMAIL_TIMEOUT", default=20, cast=int)
else:
    # Local/dev: print emails to the runserver console
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"