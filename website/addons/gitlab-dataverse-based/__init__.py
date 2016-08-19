import os

from .model import AddonGitLabUserSettings, AddonGitLabNodeSettings
from .routes import api_routes
import views

MODELS = [AddonGitLabNodeSettings, AddonGitLabUserSettings]
USER_SETTINGS_MODEL = AddonGitLabUserSettings
NODE_SETTINGS_MODEL = AddonGitLabNodeSettings

ROUTES = [api_routes]

SHORT_NAME = 'gitlab'
FULL_NAME = 'GitLab'

OWNERS = ['user', 'node']

ADDED_DEFAULT = []
ADDED_MANDATORY = []

VIEWS = ['widget']
CONFIGS = ['accounts', 'node']

CATEGORIES = ['storage']

INCLUDE_JS = {
    'widget': [],
    'page': [],
    'files': [],
}

INCLUDE_CSS = {
    'widget': ['gitlab.css'],
    'page': [],
}

HAS_HGRID_FILES = True
GET_HGRID_DATA = views._gitlab_root_folder

HERE = os.path.dirname(os.path.abspath(__file__))
NODE_SETTINGS_TEMPLATE = os.path.join(HERE, 'templates', 'gitlab_node_settings.mako')
USER_SETTINGS_TEMPLATE = os.path.join(HERE, 'templates', 'gitlab_user_settings.mako')
