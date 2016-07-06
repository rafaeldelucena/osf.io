import os

from website.addons.gitlab import routes, views, model

MODELS = [
    model.GitLabUserSettings,
    model.GitLabNodeSettings,
]
USER_SETTINGS_MODEL = model.GitLabUserSettings
NODE_SETTINGS_MODEL = model.GitLabNodeSettings

ROUTES = [routes.api_routes]

SHORT_NAME = 'gitlab'
FULL_NAME = 'GitLab'

OWNERS = ['user', 'node']

ADDED_DEFAULT = []
ADDED_MANDATORY = []

VIEWS = []
CONFIGS = ['accounts', 'node']

CATEGORIES = ['storage']

INCLUDE_JS = {}

INCLUDE_CSS = {}

HAS_HGRID_FILES = True
GET_HGRID_DATA = views.gitlab_hgrid_data

# Note: Even though GitLab supports file sizes over 1 MB, uploads and
# downloads through their API are capped at 1 MB.
MAX_FILE_SIZE = 100

HERE = os.path.dirname(os.path.abspath(__file__))
NODE_SETTINGS_TEMPLATE = os.path.join(HERE, 'templates', 'gitlab_node_settings.mako')
USER_SETTINGS_TEMPLATE = None  # Use default template
