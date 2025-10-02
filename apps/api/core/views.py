"""
Health check and utility views for TalentBase API
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db import connection
from django.core.cache import cache


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint that validates database and cache connections.
    Returns 200 if all services are healthy, 503 otherwise.
    """
    health = {'status': 'healthy', 'database': 'unknown', 'cache': 'unknown'}

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        health['database'] = 'connected'
    except Exception as e:
        health['database'] = f'error: {str(e)}'
        health['status'] = 'unhealthy'

    # Check Redis cache connection
    try:
        cache.set('health_check', 'ok', 10)
        if cache.get('health_check') == 'ok':
            health['cache'] = 'connected'
        else:
            health['cache'] = 'error: cache read failed'
            health['status'] = 'unhealthy'
    except Exception as e:
        health['cache'] = f'error: {str(e)}'
        health['status'] = 'unhealthy'

    status_code = 200 if health['status'] == 'healthy' else 503
    return Response(health, status=status_code)
