from framework.routing import Rule, json_renderer
from website.routes import OsfWebRenderer

from . import views

api_routes = {
    'rules': [
        Rule(
            '/settings/gitlab/',
            'get',
            views.gitlab_user_config_get,
            json_renderer,
        ),
        Rule(
            '/settings/gitlab/accounts/',
            'post',
            views.gitlab_add_user_account,
            json_renderer,
        ),
        Rule(
            '/settings/gitlab/accounts/',
            'get',
            views.gitlab_account_list,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/settings/',
                '/project/<pid>/node/<nid>/gitlab/settings/',
            ],
            'get',
            views.gitlab_get_config,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/settings/',
                '/project/<pid>/node/<nid>/gitlab/settings/',
            ],
            'post',
            views.gitlab_set_config,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/user-auth/',
                '/project/<pid>/node/<nid>/gitlab/user-auth/',
            ],
            'put',
            views.gitlab_import_auth,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/user-auth/',
                '/project/<pid>/node/<nid>/gitlab/user-auth/',
            ],
            'delete',
            views.gitlab_deauthorize_node,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/list-datasets/',
                '/project/<pid>/node/<nid>/gitlab/list-datasets/',
            ],
            'post',
            views.gitlab_get_datasets,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/hgrid/root/',
                '/project/<pid>/node/<nid>/gitlab/hgrid/root/',
            ],
            'get',
            views.gitlab_root_folder,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/publish/',
                '/project/<pid>/node/<nid>/gitlab/publish/',
            ],
            'put',
            views.gitlab_publish_dataset,
            json_renderer,
        ),
        Rule(
            [
                '/project/<pid>/gitlab/widget/',
                '/project/<pid>/node/<nid>/gitlab/widget/',
            ],
            'get',
            views.gitlab_widget,
            OsfWebRenderer('../addons/gitlab/templates/gitlab_widget.mako', trust=False),
        ),
        Rule(
            [
                '/project/<pid>/gitlab/widget/contents/',
                '/project/<pid>/node/<nid>/gitlab/widget/contents/',
            ],
            'get',
            views.gitlab_get_widget_contents,
            json_renderer,
        ),
    ],
    'prefix': '/api/v1'
}