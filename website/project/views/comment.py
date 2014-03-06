# -*- coding: utf-8 -*-
import httplib as http
import logging

from framework import request
from framework.exceptions import HTTPError
from framework.auth.decorators import must_be_logged_in
from ..decorators import must_be_contributor_or_public

from website import settings
from website.filters import gravatar

from framework.forms.utils import sanitize
from website.models import Guid, Comment


logger = logging.getLogger(__name__)

def resolve_target(node, guid):

    if not guid:
        return node
    target = Guid.load(guid)
    if target is None:
        raise HTTPError(http.BAD_REQUEST)
    return target.referent


def collect_discussion(target, users=None):

    users = users or []
    for comment in getattr(target, 'commented', []):
        if not comment.is_deleted and comment.user not in users:
            users.append(comment.user)
        collect_discussion(comment, users=users)
    return users


@must_be_contributor_or_public
def comment_discussion(**kwargs):
    node = kwargs['node'] or kwargs['project']
    users = collect_discussion(node)
    return {
        'discussion': [
            {
                'url': user.url,
                'fullname': user.fullname,
                'isContributor': node.is_contributor(user),
                'gravatarUrl': gravatar(
                    user, use_ssl=True,
                    size=settings.GRAVATAR_SIZE_DISCUSSION,
                ),

            }
            for user in users
        ]
    }


def serialize_comment(comment, node, auth):

    return {
        'id': comment._id,
        'author': {
            'id': comment.user._id,
            'url': comment.user.url,
            'name': comment.user.fullname,
        },
        'dateCreated': comment.date_created.strftime('%x %X'),
        'dateModified': comment.date_modified.strftime('%x %X'),
        'content': comment.content,
        'isPublic': 'public' if comment.is_public else 'private',
        'hasChildren': bool(getattr(comment, 'commented', [])),
        'canEdit': comment.user == auth.user,
        'modified': comment.modified,
        'isAbuse': auth.user and
            comment.reports.get(auth.user._id) == {'type': 'spam'},
    }


def can_view_comment(comment, node, auth):

    if comment.is_public:
        return True

    return node.can_edit(auth)


def serialize_comments(record, node, auth):

    return [
        serialize_comment(comment, node, auth)
        for comment in getattr(record, 'commented', [])
        if can_view_comment(comment, node, auth)
            and not comment.is_deleted
    ]


@must_be_logged_in
@must_be_contributor_or_public
def add_comment(**kwargs):

    auth = kwargs['auth']
    node = kwargs['node'] or kwargs['project']

    if not node.comment_level:
        raise HTTPError(http.BAD_REQUEST)

    if not node.can_comment(auth):
        raise HTTPError(http.FORBIDDEN)

    guid = request.json.get('target')
    target = resolve_target(node, guid)

    content = request.json.get('content')
    if content is None:
        raise HTTPError(http.BAD_REQUEST)
    content = sanitize(content)

    is_public_string = request.json.get('isPublic')
    if is_public_string not in ['public', 'private']:
        raise HTTPError(http.BAD_REQUEST)
    is_public = is_public_string == 'public'

    comment = Comment.create(
        auth=auth,
        node=node,
        target=target,
        user=auth.user,
        is_public=is_public,
        content=content,
    )
    comment.save()

    return {
        'comment': serialize_comment(comment, node, auth)
   }, http.CREATED


@must_be_contributor_or_public
def list_comments(**kwargs):

    auth = kwargs['auth']
    node = kwargs['node'] or kwargs['project']

    if not node.can_comment(auth):
        return {'comments': []}

    guid = request.args.get('target')
    target = resolve_target(node, guid)

    return {
        'comments': serialize_comments(target, node, auth),
    }


@must_be_logged_in
@must_be_contributor_or_public
def edit_comment(**kwargs):

    auth = kwargs['auth']
    node = kwargs['node'] or kwargs['project']

    comment = Comment.load(kwargs.get('cid'))
    if comment is None:
        raise HTTPError(http.BAD_REQUEST)

    if auth.user != comment.user:
        raise HTTPError(http.FORBIDDEN)

    content = request.json.get('content')
    if content is None:
        raise HTTPError(http.BAD_REQUEST)

    is_public_string = request.json.get('isPublic')
    if is_public_string not in ['public', 'private']:
        raise HTTPError(http.BAD_REQUEST)
    is_public = is_public_string == 'public'

    comment.edit(
        content=sanitize(content),
        is_public=is_public,
        auth=auth,
        save=True
    )

    return serialize_comment(comment, node, auth)


@must_be_logged_in
@must_be_contributor_or_public
def delete_comment(**kwargs):

    auth = kwargs['auth']

    comment = Comment.load(kwargs.get('cid'))
    if comment is None:
        raise HTTPError(http.BAD_REQUEST)

    if auth.user != comment.user:
        raise HTTPError(http.FORBIDDEN)

    comment.delete(auth=auth, save=True)

    return {}


@must_be_logged_in
@must_be_contributor_or_public
def report_abuse(**kwargs):

    auth = kwargs['auth']
    user = auth.user

    comment = Comment.load(kwargs.get('cid'))
    if comment is None:
        raise HTTPError(http.BAD_REQUEST)

    category = request.json.get('category')
    text = request.json.get('text', '')
    if not category:
        raise HTTPError(http.BAD_REQUEST)

    comment.report_abuse(user, save=True, category=category, text=text)

    return {}
