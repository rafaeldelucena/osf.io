from website.addons.base.logger import AddonNodeLogger

class GitLabNodeLogger(AddonNodeLogger):

    addon_short_name = 'gitlab'

    def _log_params(self):
        node_settings = self.node.get_addon('gitlab')
        return {
            'project': self.node.parent_id,
            'node': self.node._primary_key,
            'dataset': node_settings.dataset if node_settings else None
        }
