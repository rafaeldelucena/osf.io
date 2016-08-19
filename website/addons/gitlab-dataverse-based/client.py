import httplib as http

from gitlab import Connection
from gitlab.exceptions import ConnectionError, UnauthorizedError, OperationFailedError

from framework.exceptions import HTTPError

from website.addons.gitlab import settings

def _connect(host, token):
    try:
        return Connection(host, token)
    except ConnectionError:
        return None


def connect_from_settings(node_settings):
    if not (node_settings and node_settings.external_account):
        return None

    host = node_settings.external_account.oauth_key
    token = node_settings.external_account.oauth_secret

    try:
        return _connect(host, token)
    except UnauthorizedError:
        return None


def connect_or_error(host, token):
    try:
        connection = _connect(host, token)
        if not connection:
            raise HTTPError(http.SERVICE_UNAVAILABLE)
        return connection
    except UnauthorizedError:
        raise HTTPError(http.UNAUTHORIZED)


def connect_from_settings_or_401(node_settings):
    if not (node_settings and node_settings.external_account):
        return None

    host = node_settings.external_account.oauth_key
    token = node_settings.external_account.oauth_secret

    return connect_or_error(host, token)


def get_files(dataset, published=False):
    version = 'latest-published' if published else 'latest'
    return dataset.get_files(version)


def publish_gitlab(gitlab):
    try:
        gitlab.publish()
    except OperationFailedError:
        raise HTTPError(http.BAD_REQUEST)


def publish_dataset(dataset):
    if dataset.get_state() == 'RELEASED':
        raise HTTPError(http.CONFLICT, data=dict(
            message_short='Dataset conflict',
            message_long='This version of the dataset has already been published.'
        ))
    if not dataset.gitlab.is_published:
        raise HTTPError(http.METHOD_NOT_ALLOWED, data=dict(
            message_short='Method not allowed',
            message_long='A dataset cannot be published until its parent GitLab is published.'
        ))

    try:
        dataset.publish()
    except OperationFailedError:
        raise HTTPError(http.BAD_REQUEST)


def get_datasets(gitlab):
    if gitlab is None:
        return []
    return gitlab.get_datasets(timeout=settings.REQUEST_TIMEOUT)


def get_dataset(gitlab, doi):
    if gitlab is None:
        return
    dataset = gitlab.get_dataset_by_doi(doi, timeout=settings.REQUEST_TIMEOUT)
    try:
        if dataset and dataset.get_state() == 'DEACCESSIONED':
            raise HTTPError(http.GONE, data=dict(
                message_short='Dataset deaccessioned',
                message_long='This dataset has been deaccessioned and can no longer be linked to the OSF.'
            ))
        return dataset
    except UnicodeDecodeError:
        raise HTTPError(http.NOT_ACCEPTABLE, data=dict(
            message_short='Not acceptable',
            message_long='This dataset cannot be connected due to forbidden '
                         'characters in one or more of the file names.'
        ))


def get_gitlabs(connection):
    if connection is None:
        return []
    return connection.get_gitlabs()


def get_gitlab(connection, alias):
    if connection is None:
        return
    return connection.get_gitlab(alias)
