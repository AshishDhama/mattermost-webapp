// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useSelector} from 'react-redux';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {Message} from 'utils/i18n';

import GenericModal from 'components/generic_modal';

import {Limits, CloudUsage} from '@mattermost/types/cloud';
import {ThemeProvider, createPaletteFromLegacyTheme} from '@mattermost/compass-ui';

import WorkspaceLimitsPanel, {messageToElement} from './workspace_limits_panel';

import './mini_modal.scss';

interface Props {
    limits: Limits;
    usage: CloudUsage;
    showIcons?: boolean;
    title: Message | React.ReactNode;
    onClose: () => void;
    needsTheme?: boolean;
}

export default function MiniModal(props: Props) {
    const legacyTheme = useSelector(getTheme);
    const theme = createPaletteFromLegacyTheme(legacyTheme);

    const modal = (
        <GenericModal
            compassDesign={true}
            onExited={props.onClose}
            modalHeaderText={messageToElement(props.title)}
            className='CloudUsageMiniModal'
        >
            <WorkspaceLimitsPanel
                showIcons={true}
                limits={props.limits}
                usage={props.usage}
            />
        </GenericModal>
    );

    if (!props.needsTheme) {
        return modal;
    }

    return (
        <ThemeProvider theme={theme}>
            {modal}
        </ThemeProvider>
    );
}
