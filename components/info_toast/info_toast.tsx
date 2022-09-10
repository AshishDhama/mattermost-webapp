// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {useEffect, useCallback} from 'react';

import './info_toast.scss';
import {CSSTransition} from 'react-transition-group';

import IconButton from '@mattermost/compass-components/components/icon-button';

import {ModalIdentifiers} from 'utils/constants';

type Props = {
    content: {
        icon?: JSX.Element;
        message: string;
        undo?: () => void;
    };
    actions: {
        closeModal: (modalId: string) => void;
    };
    className?: string;
}

// todo sinan convert it to use floating UI
// todo sinan write test
function InfoToast(props: Props): JSX.Element {
    const {actions, content} = props;

    const closeToast = useCallback(() => {
        actions.closeModal(ModalIdentifiers.RESTORE_POST_MODAL);
    }, [close]);

    const undoTodo = useCallback(() => {
        content.undo?.();
        actions.closeModal(ModalIdentifiers.RESTORE_POST_MODAL);
    }, [content.undo, actions.closeModal]);

    const classNames: Record<string, boolean> = {
        'info-toast': true,
    };
    classNames[`${props.className}`] = Boolean(props.className);

    useEffect(() => {
        const timer = setTimeout(() => {
            // actions.closeModal(ModalIdentifiers.RESTORE_POST_MODAL);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    function generateClassName(conditions: Record<string, boolean>) {
        return Object.entries(conditions).map(
            ([className, condition]) => (condition ? className : ''),
        ).filter(Boolean).join(' ');
    }

    console.log('props.content.icon: ', props.content.icon)

    return (
        <CSSTransition
            in={Boolean(props.content)}
            classNames='slide'
            mountOnEnter={true}
            unmountOnExit={true}
            timeout={300}
            appear={true}
        >
            <div className={generateClassName(classNames)}>
                <div>
                    {/* todo sinan icon is not displayed */}
                    {props.content.icon}
                    <span>{props.content.message}</span>
                    {props.content.undo &&
                        <button
                            onClick={undoTodo}
                            className='info-toast__undo'
                        >
                            {'Undo'}
                        </button>}
                </div>
                <IconButton
                    className='info-toast__icon_button'
                    onClick={closeToast}
                    icon='close'
                    size='sm'
                    inverted={true}
                />
            </div>
        </CSSTransition>
    );
}

export default React.memo(InfoToast);
