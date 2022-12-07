// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';

import PersistNotificationConfirmModal from 'components/persist_notification_confirm_modal';
import {openModal} from 'actions/views/modals';
import {createPost} from 'actions/post_actions';
import {removeDraft} from 'actions/views/drafts';
import {PostDraft} from 'types/store/draft';
import {specialMentionsInText} from 'utils/post_utils';
import {ModalIdentifiers} from 'utils/constants';

import type {Channel} from '@mattermost/types/channels';
import type {UserProfile, UserStatus} from '@mattermost/types/users';
import {Post, PostMetadata, PostPriority} from '@mattermost/types/posts';

import DraftTitle from '../draft_title';
import DraftActions from '../draft_actions';
import Panel from '../panel/panel';
import Header from '../panel/panel_header';
import PanelBody from '../panel/panel_body';

type Props = {
    channel: Channel;
    channelUrl: string;
    displayName: string;
    draftId: string;
    id: Channel['id'];
    postPriorityEnabled: boolean;
    status: UserStatus['status'];
    type: 'channel' | 'thread';
    user: UserProfile;
    value: PostDraft;
}

function ChannelDraft({
    channel,
    channelUrl,
    displayName,
    draftId,
    postPriorityEnabled,
    status,
    type,
    user,
    value,
}: Props) {
    const dispatch = useDispatch();
    const history = useHistory();

    const handleOnEdit = useCallback(() => {
        history.push(channelUrl);
    }, [channelUrl]);

    const handleOnDelete = useCallback((id: string) => {
        dispatch(removeDraft(id, channel.id));
    }, [channel.id]);

    const showPersistNotificationModal = useCallback((id: string, post: Post) => {
        const specialMentions = specialMentionsInText(post.message);
        const hasSpecialMentions = Object.values(specialMentions).includes(true);

        dispatch(openModal({
            modalId: ModalIdentifiers.PERSIST_NOTIFICATION_CONFIRM_MODAL,
            dialogType: PersistNotificationConfirmModal,
            dialogProps: {
                message: post.message,
                hasSpecialMentions,
                onConfirm: () => doSubmit(id, post),
            },
        }));
    }, []);

    const doSubmit = useCallback((id: string, post: Post) => {
        dispatch(createPost(post, value.fileInfos));
        dispatch(removeDraft(id, channel.id));
        history.push(channelUrl);
    }, [value.fileInfos, channel.id, channelUrl]);

    const handleOnSend = useCallback(async (id: string) => {
        const post = {} as Post;
        post.file_ids = [];
        post.message = value.message;
        post.props = value.props || {};
        post.user_id = user.id;
        post.channel_id = value.channelId;
        post.metadata = (value.metadata || {}) as PostMetadata;

        if (post.message.trim().length === 0 && value.fileInfos.length === 0) {
            return;
        }

        if (
            postPriorityEnabled &&
            value?.metadata?.priority?.priority === PostPriority.URGENT &&
            value?.metadata?.priority?.persistent_notifications
        ) {
            showPersistNotificationModal(id, post);
            return;
        }
        doSubmit(id, post);
    }, [value, channelUrl, user.id, channel.id, showPersistNotificationModal]);

    if (!channel) {
        return null;
    }

    return (
        <Panel onClick={handleOnEdit}>
            {({hover}) => (
                <>
                    <Header
                        hover={hover}
                        actions={(
                            <DraftActions
                                channelDisplayName={channel.display_name}
                                channelType={channel.type}
                                channelName={channel.name}
                                userId={user.id}
                                draftId={draftId}
                                onDelete={handleOnDelete}
                                onEdit={handleOnEdit}
                                onSend={handleOnSend}
                            />
                        )}
                        title={(
                            <DraftTitle
                                channel={channel}
                                type={type}
                                userId={user.id}
                            />
                        )}
                        timestamp={value.updateAt}
                        remote={value.remote || false}
                    />
                    <PanelBody
                        channelId={channel.id}
                        displayName={displayName}
                        fileInfos={value.fileInfos}
                        message={value.message}
                        status={status}
                        priority={value.metadata?.priority}
                        uploadsInProgress={value.uploadsInProgress}
                        userId={user.id}
                        username={user.username}
                    />
                </>
            )}
        </Panel>
    );
}

export default memo(ChannelDraft);
