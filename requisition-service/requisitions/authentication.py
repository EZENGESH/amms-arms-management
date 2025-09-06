import requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from django.utils.translation import gettext_lazy as _

# This should be the internal or external URL of your user service
USER_SERVICE_VALIDATE_URL = 'http://user-service:8001/api/auth/user/'

class UserServiceAuthentication(BaseAuthentication):
    """
    Custom authentication class to delegate token validation to the user service.
    """
    keyword = 'Token'

    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None

        if len(auth) == 1:
            msg = _('Invalid token header. No credentials provided.')
            raise AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = _('Invalid token header. Token string should not contain spaces.')
            raise AuthenticationFailed(msg)

        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = _('Invalid token header. Token string should not contain invalid characters.')
            raise AuthenticationFailed(msg)

        return self.authenticate_credentials(token)

    def authenticate_credentials(self, token):
        headers = {'Authorization': f'{self.keyword} {token}'}
        
        try:
            # Make a request to the user service to validate the token
            response = requests.get(USER_SERVICE_VALIDATE_URL, headers=headers, timeout=5)
            response.raise_for_status() # Raise an exception for 4xx or 5xx status codes

        except requests.exceptions.Timeout:
            raise AuthenticationFailed(_('The user service timed out. Please try again.'))
        except requests.exceptions.RequestException as e:
            # This will catch connection errors, 401, 403, 500, etc.
            raise AuthenticationFailed(_('Token validation failed. The user service is unreachable or the token is invalid.'))

        # If the token is valid, the user service should return user data.
        # We don't need the user data here, just a "proxy" user to pass Django's checks.
        # For simplicity, we return a dummy user object.
        class DummyUser:
            is_authenticated = True

        return (DummyUser(), token)

    def authenticate_header(self, request):
        return self.keyword