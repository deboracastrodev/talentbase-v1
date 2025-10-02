"""
Test Django-Redis connection
"""
from django.core.cache import cache


def test_redis_connection():
    """Test that Django can successfully connect to Redis cache"""
    # Set a test key-value pair
    cache.set('test_key', 'test_value', 10)

    # Retrieve and verify
    result = cache.get('test_key')
    assert result == 'test_value', "Cache should store and retrieve values correctly"

    # Cleanup
    cache.delete('test_key')
