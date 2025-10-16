"""
WSGI config for hirepath project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os
print("DEBUG: wsgi.py is being loaded")
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hirepath.settings')

print("DEBUG: About to get WSGI application")

application = get_wsgi_application()
print("DEBUG: WSGI application created successfully") 