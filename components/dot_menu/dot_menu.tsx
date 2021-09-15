// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import classNames from 'classnames';
import {FormattedMessage, injectIntl, IntlShape} from 'react-intl';
import {Tooltip} from 'react-bootstrap';

import Permissions from 'mattermost-redux/constants/permissions';
import {Post} from 'mattermost-redux/types/posts';
import {UserThread} from 'mattermost-redux/types/threads';
import {Team} from 'mattermost-redux/types/teams';
import {$ID} from 'mattermost-redux/types/utilities';

import {Locations, ModalIdentifiers, Constants} from 'utils/constants';
import DeletePostModal from 'components/delete_post_modal';
import OverlayTrigger from 'components/overlay_trigger';
import DelayedAction from 'utils/delayed_action';
import * as PostUtils from 'utils/post_utils';
import * as Utils from 'utils/utils.jsx';
import ChannelPermissionGate from 'components/permissions_gates/channel_permission_gate';
import Menu from 'components/widgets/menu/menu';
import MenuWrapper from 'components/widgets/menu/menu_wrapper';
import DotsHorizontalIcon from 'components/widgets/icons/dots_horizontal';

const MENU_BOTTOM_MARGIN = 80;

type Props = {
    intl: IntlShape;
    post: Post;
    teamId?: string;
    location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | 'SEARCH' | string;
    isFlagged?: boolean;
    handleCommentClick?: React.EventHandler<React.MouseEvent>;
    handleDropdownOpened: (open: boolean) => void;
    handleAddReactionClick?: () => void;
    isMenuOpen?: boolean;
    isReadOnly: boolean | null;
    isLicensed?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    postEditTimeLimit?: string; // TechDebt: Made non-mandatory while converting to typescript
    enableEmojiPicker?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    channelIsArchived?: boolean; // TechDebt: Made non-mandatory while converting to typescript
    currentTeamUrl?: string; // TechDebt: Made non-mandatory while converting to typescript

    actions: {

        /**
         * Function flag the post
         */
        flagPost: (postId: string) => void;

        /**
         * Function to unflag the post
         */
        unflagPost: (postId: string) => void;

        /**
         * Function to set the editing post
         */
        setEditingPost: (postId?: string, refocusId?: string, title?: string, isRHS?: boolean) => void;

        /**
         * Function to pin the post
         */
        pinPost: (postId: string) => void;

        /**
         * Function to unpin the post
         */
        unpinPost: (postId: string) => void;

        /**
         * Function to open a modal
         */
        openModal: (postId: any) => void;

        /**
         * Function to set the unread mark at given post
         */
        markPostAsUnread: (post: Post, location?: 'CENTER' | 'RHS_ROOT' | 'RHS_COMMENT' | string) => void;

        /**
         * Function to set the thread as followed/unfollowed
         */
        setThreadFollow: (userId: string, teamId: string, threadId: string, newState: boolean) => void;

    }; // TechDebt: Made non-mandatory while converting to typescript

    canEdit: boolean;
    canDelete: boolean;
    userId: string;
    currentTeamId: $ID<Team>;
    threadId: $ID<UserThread>;
    isCollapsedThreadsEnabled: boolean;
    isFollowingThread?: boolean;
    threadReplyCount?: number;
}

type State = {
    openUp: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export class DotMenuClass extends React.PureComponent<Props, State> {
    public static defaultProps: Partial<Props> = {
        isFlagged: false,
        isReadOnly: false,
        location: Locations.CENTER,
    }
    private keysHeldDown: string[] = [];
    private editDisableAction: DelayedAction;
    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props: Props) {
        super(props);

        this.editDisableAction = new DelayedAction(this.handleEditDisable);

        this.state = {
            openUp: false,
            canEdit: props.canEdit && !props.isReadOnly,
            canDelete: props.canDelete && !props.isReadOnly,
        };

        this.buttonRef = React.createRef<HTMLButtonElement>();
    }

    disableCanEditPostByTime() {
        const {post, isLicensed} = this.props;
        const {canEdit} = this.state;

        const postEditTimeLimit = this.props.postEditTimeLimit || Constants.UNSET_POST_EDIT_TIME_LIMIT;

        if (canEdit && isLicensed) {
            if (postEditTimeLimit !== String(Constants.UNSET_POST_EDIT_TIME_LIMIT)) {
                const milliseconds = 1000;
                const timeLeft = (post.create_at + (Number(postEditTimeLimit) * milliseconds)) - Utils.getTimestamp();
                if (timeLeft > 0) {
                    this.editDisableAction.fireAfter(timeLeft + milliseconds);
                }
            }
        }
    }

    componentDidMount() {
        this.disableCanEditPostByTime();
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isMenuOpen && this.props.isMenuOpen) {
            window.addEventListener('keydown', this.onShortcutKeyDown);
            window.addEventListener('keyup', this.onShortcutKeyUp);
        }

        if (prevProps.isMenuOpen && !this.props.isMenuOpen) {
            window.removeEventListener('keydown', this.onShortcutKeyDown);
            window.removeEventListener('keyup', this.onShortcutKeyUp);
        }
    }

    static getDerivedStateFromProps(props: Props) {
        return {
            canEdit: props.canEdit && !props.isReadOnly,
            canDelete: props.canDelete && !props.isReadOnly,
        };
    }

    componentWillUnmount() {
        this.editDisableAction.cancel();
    }

    handleEditDisable = () => {
        this.setState({canEdit: false});
    }

    handleFlagMenuItemActivated = () => {
        if (this.props.isFlagged) {
            this.props.actions.unflagPost(this.props.post.id);
        } else {
            this.props.actions.flagPost(this.props.post.id);
        }
    }

    // listen to clicks/taps on add reaction menu item and pass to parent handler
    handleAddReactionMenuItemActivated = (e: React.MouseEvent) => {
        e.preventDefault();

        // to be safe, make sure the handler function has been defined
        if (this.props.handleAddReactionClick) {
            this.props.handleAddReactionClick();
        }
    }

    copyLink = () => {
        Utils.copyToClipboard(`${this.props.currentTeamUrl}/pl/${this.props.post.id}`);
    }

    handlePinMenuItemActivated = () => {
        if (this.props.post.is_pinned) {
            this.props.actions.unpinPost(this.props.post.id);
        } else {
            this.props.actions.pinPost(this.props.post.id);
        }
    }

    handleUnreadMenuItemActivated = (e: React.MouseEvent) => {
        e.preventDefault();
        this.props.actions.markPostAsUnread(this.props.post, this.props.location);
    }

    handleDeleteMenuItemActivated = (e: React.MouseEvent) => {
        e.preventDefault();

        const deletePostModalData = {
            ModalId: ModalIdentifiers.DELETE_POST,
            dialogType: DeletePostModal,
            dialogProps: {
                post: this.props.post,
                isRHS: this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT,
            },
        };

        this.props.actions.openModal(deletePostModalData);
    }

    handleEditMenuItemActivated = () => {
        this.props.actions.setEditingPost(
            this.props.post.id,
            this.props.location === Locations.CENTER ? 'post_textbox' : 'reply_textbox',
            this.props.post.root_id ? Utils.localizeMessage('rhs_comment.comment', 'Comment') : Utils.localizeMessage('create_post.post', 'Post'),
            this.props.location === Locations.RHS_ROOT || this.props.location === Locations.RHS_COMMENT,
        );
    }

    handleSetThreadFollow = () => {
        const {actions, currentTeamId, threadId, userId, isFollowingThread} = this.props;
        actions.setThreadFollow(
            userId,
            currentTeamId,
            threadId,
            !isFollowingThread,
        );
    }

    tooltip = (
        <Tooltip
            id='dotmenu-icon-tooltip'
            className='hidden-xs'
        >
            <FormattedMessage
                id='post_info.dot_menu.tooltip.more_actions'
                defaultMessage='More'
            />
        </Tooltip>
    )

    getKeyShortCut = (key: string): string => {
        return (key);
    }

    refCallback = (menuRef: Menu) => {
        if (menuRef) {
            const buttonRect = this.buttonRef.current?.getBoundingClientRect();
            let y;
            if (typeof buttonRect?.y === 'undefined') {
                y = typeof buttonRect?.top == 'undefined' ? 0 : buttonRect?.top;
            } else {
                y = buttonRect?.y;
            }
            const windowHeight = window.innerHeight;

            const totalSpace = windowHeight - MENU_BOTTOM_MARGIN;
            const spaceOnTop = y - Constants.CHANNEL_HEADER_HEIGHT;
            const spaceOnBottom = (totalSpace - (spaceOnTop + Constants.POST_AREA_HEIGHT));

            this.setState({
                openUp: (spaceOnTop > spaceOnBottom),
            });
        }
    }

    renderDivider = (suffix: string) => {
        return (
            <li
                id={`divider_post_${this.props.post.id}_${suffix}`}
                className='MenuItem__divider'
                role='menuitem'
            />
        );
    }

    onShortcutKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();

        if (this.keysHeldDown.includes(e.key)) {
            return;
        }
        this.keysHeldDown.push(e.key);

        switch (true) {
        case Utils.isKeyPressed(e, Constants.KeyCodes.R):
            this.props.handleCommentClick(e);
            break;

        // edit post
        case Utils.isKeyPressed(e, Constants.KeyCodes.E):
            this.handleEditMenuItemActivated();
            break;

        case Utils.isKeyPressed(e, Constants.KeyCodes.F):
            this.handleSetThreadFollow();
            break;

        // copy link
        case Utils.isKeyPressed(e, Constants.KeyCodes.K):
            this.copyLink();
            break;

        // delete post
        case Utils.isKeyPressed(e, Constants.KeyCodes.DELETE):
            this.handleDeleteMenuItemActivated(e);
            break;

        // pin / unpin
        case Utils.isKeyPressed(e, Constants.KeyCodes.P):
            this.handlePinMenuItemActivated();
            break;

        // mark as unread
        case Utils.isKeyPressed(e, Constants.KeyCodes.U):
            this.props.actions.markPostAsUnread(this.props.post, this.props.location);
            break;
        }

        this.props.handleDropdownOpened(false);
    }

    onShortcutKeyUp = (e: KeyboardEvent) => {
        e.preventDefault();
        this.keysHeldDown = this.keysHeldDown.filter((key) => key !== e.key);
    }

    render() {
        const isSystemMessage = PostUtils.isSystemMessage(this.props.post);
        const isMobile = Utils.isMobile();

        return (
            <MenuWrapper
                onToggle={this.props.handleDropdownOpened}
                open={this.props.isMenuOpen}
            >
                <OverlayTrigger
                    className='hidden-xs'
                    delayShow={500}
                    placement='top'
                    overlay={this.tooltip}
                    rootClose={true}
                >
                    <button
                        ref={this.buttonRef}
                        id={`${this.props.location}_button_${this.props.post.id}`}
                        aria-label={Utils.localizeMessage('post_info.dot_menu.tooltip.more_actions', 'Actions').toLowerCase()}
                        className={classNames('post-menu__item', {
                            'post-menu__item--active': this.props.isMenuOpen,
                        })}
                        type='button'
                        aria-expanded='false'
                    >
                        <DotsHorizontalIcon className={'icon icon--small'}/>
                    </button>
                </OverlayTrigger>
                <Menu
                    id={`${this.props.location}_dropdown_${this.props.post.id}`}
                    openLeft={true}
                    openUp={this.state.openUp}
                    ref={this.refCallback}
                    ariaLabel={Utils.localizeMessage('post_info.menuAriaLabel', 'Post extra options')}
                >
                    <Menu.ItemAction
                        show={!isSystemMessage && this.props.location === Locations.CENTER}
                        text={Utils.localizeMessage('post_info.reply', 'Reply')}
                        leftDecorator={<i className='icon icon-reply-outline'/>}
                        rightDecorator={this.getKeyShortCut('R')}
                        onClick={this.props.handleCommentClick}
                    />
                    <ChannelPermissionGate
                        channelId={this.props.post.channel_id}
                        teamId={this.props.teamId}
                        permissions={[Permissions.ADD_REACTION]}
                    >
                        <Menu.ItemAction
                            show={isMobile && !isSystemMessage && !this.props.isReadOnly && this.props.enableEmojiPicker}
                            text={Utils.localizeMessage('rhs_root.mobile.add_reaction', 'Add Reaction')}
                            onClick={this.handleAddReactionMenuItemActivated}
                        />
                    </ChannelPermissionGate>
                    <Menu.ItemAction
                        id={`follow_post_thread_${this.props.post.id}`}
                        onClick={this.handleSetThreadFollow}
                        rightDecorator={this.getKeyShortCut('F')}
                        show={(
                            !isSystemMessage &&
                            this.props.isCollapsedThreadsEnabled &&
                                (
                                    this.props.location === Locations.CENTER ||
                                    this.props.location === Locations.RHS_ROOT ||
                                    this.props.location === Locations.RHS_COMMENT
                                )
                        )}
                        {...this.props.isFollowingThread ? {
                            leftDecorator: <i className='icon icon-message-minus-outline'/>,
                            text: this.props.threadReplyCount ? Utils.localizeMessage('threading.threadMenu.unfollow', 'Unfollow thread') : Utils.localizeMessage('threading.threadMenu.unfollowMessage', 'Unfollow message'),
                            extraText: Utils.localizeMessage('threading.threadMenu.unfollowExtra', 'You won’t be notified about replies'),
                        } : {
                            leftDecorator: <i className='icon icon-message-check-outline'/>,
                            text: this.props.threadReplyCount ? Utils.localizeMessage('threading.threadMenu.follow', 'Follow thread') : Utils.localizeMessage('threading.threadMenu.followMessage', 'Follow message'),
                            extraText: Utils.localizeMessage('threading.threadMenu.followExtra', 'You will be notified about replies'),
                        }}
                    />
                    <Menu.ItemAction
                        id={`unread_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.channelIsArchived && this.props.location !== Locations.SEARCH}
                        text={Utils.localizeMessage('post_info.unread', 'Mark as Unread')}
                        leftDecorator={<i className='icon icon-mark-as-unread'/>}
                        rightDecorator={this.getKeyShortCut('U')}
                        onClick={this.handleUnreadMenuItemActivated}
                    />
                    <Menu.ItemAction
                        show={isMobile && !isSystemMessage && this.props.isFlagged}
                        text={Utils.localizeMessage('rhs_root.mobile.unflag', 'Remove from Saved')}
                        onClick={this.handleFlagMenuItemActivated}
                    />
                    <Menu.ItemAction
                        show={isMobile && !isSystemMessage && !this.props.isFlagged}
                        text={Utils.localizeMessage('rhs_root.mobile.flag', 'Save')}
                        onClick={this.handleFlagMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`unpin_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.isReadOnly && this.props.post.is_pinned}
                        text={Utils.localizeMessage('post_info.unpin', 'Unpin')}
                        leftDecorator={<i className='icon icon-pin-outline post-menu__item post-menu__item--active'/>}
                        rightDecorator={this.getKeyShortCut('P')}
                        onClick={this.handlePinMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`pin_post_${this.props.post.id}`}
                        show={!isSystemMessage && !this.props.isReadOnly && !this.props.post.is_pinned}
                        text={Utils.localizeMessage('post_info.pin', 'Pin')}
                        leftDecorator={<i className='icon icon-pin-outline'/>}
                        rightDecorator={this.getKeyShortCut('P')}
                        onClick={this.handlePinMenuItemActivated}
                    />
                    {!isSystemMessage && (this.state.canEdit || this.state.canDelete) && this.renderDivider('edit')}
                    <Menu.ItemAction
                        id={`permalink_${this.props.post.id}`}
                        show={!isSystemMessage}
                        text={Utils.localizeMessage('post_info.permalink', 'Copy Link')}
                        leftDecorator={<i className='icon icon-link-variant'/>}
                        rightDecorator={this.getKeyShortCut('K')}
                        onClick={this.copyLink}
                    />
                    {!isSystemMessage && (this.state.canEdit || this.state.canDelete) && this.renderDivider('edit')}
                    <Menu.ItemAction
                        id={`edit_post_${this.props.post.id}`}
                        show={this.state.canEdit}
                        text={Utils.localizeMessage('post_info.edit', 'Edit')}
                        leftDecorator={<i className='icon icon-pencil-outline'/>}
                        rightDecorator={this.getKeyShortCut('E')}
                        onClick={this.handleEditMenuItemActivated}
                    />
                    <Menu.ItemAction
                        id={`delete_post_${this.props.post.id}`}
                        show={this.state.canDelete}
                        text={Utils.localizeMessage('post_info.del', 'Delete')}
                        leftDecorator={<i className='icon icon-trash-can-outline'/>}
                        rightDecorator={this.getKeyShortCut('delete')}
                        onClick={this.handleDeleteMenuItemActivated}
                        isDangerous={true}
                    />
                </Menu>
            </MenuWrapper>
        );
    }
}

export default injectIntl(DotMenuClass);
