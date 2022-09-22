// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo} from 'react';
import {MessageDescriptor, useIntl} from 'react-intl';
import styled from 'styled-components';
import {
    FormatBoldIcon,
    FormatItalicIcon,
    LinkVariantIcon,
    FormatStrikethroughVariantIcon,
    CodeTagsIcon,
    FormatQuoteOpenIcon,
    FormatListBulletedIcon,
    FormatListNumberedIcon,
    FormatHeader1Icon,
    FormatHeader2Icon,
    FormatHeader3Icon,
    FormatHeader4Icon,
    FormatHeader5Icon,
    FormatHeader6Icon,
} from '@mattermost/compass-icons/components';
import IconProps from '@mattermost/compass-icons/components/props';

import KeyboardShortcutSequence, {
    KeyboardShortcutDescriptor,
    KEYBOARD_SHORTCUTS,
} from 'components/keyboard_shortcuts/keyboard_shortcuts_sequence';
import OverlayTrigger from 'components/overlay_trigger';
import Tooltip from 'components/tooltip';

import Constants from 'utils/constants';
import {t} from 'utils/i18n';

export const IconContainer = styled.button`
    display: flex;
    width: 32px;
    height: 32px;
    place-items: center;
    place-content: center;
    border: none;
    background: transparent;
    padding: 0;
    border-radius: 4px;
    color: rgba(var(--center-channel-color-rgb), 0.56);

    &:hover {
        background: rgba(var(--center-channel-color-rgb), 0.08);
        color: rgba(var(--center-channel-color-rgb), 0.72);
        fill: currentColor;
    }

    &:active,
    &.active,
    &.active:hover {
        background: rgba(var(--button-bg-rgb), 0.08);
        color: var(--button-bg);
        fill: currentColor;
    }

    &[disabled] {
        pointer-events: none;
        cursor: not-allowed;
        color: rgba(var(--center-channel-color-rgb), 0.32);

        &:hover,
        &:active,
        &.active,
        &.active:hover {
            background: inherit;
            color: inherit;
            fill: inherit;
        }
    }
`;

export type MarkdownMode = 'bold' | 'italic' | 'link' | 'strike' | 'code' | 'quote' | 'ul' | 'ol' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface FormattingIconProps {
    mode: MarkdownMode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const MAP_MARKDOWN_MODE_TO_ICON: Record<FormattingIconProps['mode'], React.FC<IconProps>> = {
    bold: FormatBoldIcon,
    italic: FormatItalicIcon,
    link: LinkVariantIcon,
    strike: FormatStrikethroughVariantIcon,
    code: CodeTagsIcon,
    h1: FormatHeader1Icon,
    h2: FormatHeader2Icon,
    h3: FormatHeader3Icon,
    h4: FormatHeader4Icon,
    h5: FormatHeader5Icon,
    h6: FormatHeader6Icon,
    quote: FormatQuoteOpenIcon,
    ul: FormatListBulletedIcon,
    ol: FormatListNumberedIcon,
};

type SupportedBlockElements = Pick<JSX.IntrinsicElements, 'code' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'pre' | 'ul' | 'ol'>;

type SupportedMarkElements = Pick<JSX.IntrinsicElements, 'strong' | 'em' | 'a' | 's' | 'code' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'ul' | 'ol'>

type SupportedElements = SupportedMarkElements & SupportedBlockElements;

const MAP_MARKDOWN_MODE_TO_TAG: Record<FormattingIconProps['mode'], keyof SupportedElements> = {
    bold: 'strong',
    italic: 'em',
    link: 'a',
    strike: 's',
    code: 'code',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    quote: 'blockquote',
    ul: 'ul',
    ol: 'ol',
};

const MAP_MARKDOWN_MODE_TO_ARIA_LABEL: Record<FormattingIconProps['mode'], MessageDescriptor> = {
    bold: {id: t('accessibility.button.bold'), defaultMessage: 'bold'},
    italic: {id: t('accessibility.button.italic'), defaultMessage: 'italic'},
    link: {id: t('accessibility.button.link'), defaultMessage: 'link'},
    strike: {id: t('accessibility.button.strike'), defaultMessage: 'strike through'},
    code: {id: t('accessibility.button.code'), defaultMessage: 'code'},
    h1: {id: t('accessibility.button.heading'), defaultMessage: 'heading'},
    h2: {id: t('accessibility.button.heading'), defaultMessage: 'heading'},
    h3: {id: t('accessibility.button.heading'), defaultMessage: 'heading'},
    h4: {id: t('accessibility.button.heading'), defaultMessage: 'heading'},
    h5: {id: t('accessibility.button.heading'), defaultMessage: 'heading'},
    h6: {id: t('accessibility.button.heading'), defaultMessage: 'heading'},
    quote: {id: t('accessibility.button.quote'), defaultMessage: 'quote'},
    ul: {id: t('accessibility.button.bulleted_list'), defaultMessage: 'bulleted list'},
    ol: {id: t('accessibility.button.numbered_list'), defaultMessage: 'numbered list'},
};

const MAP_MARKDOWN_MODE_TO_KEYBOARD_SHORTCUTS: Record<FormattingIconProps['mode'], KeyboardShortcutDescriptor> = {
    bold: KEYBOARD_SHORTCUTS.msgMarkdownBold,
    italic: KEYBOARD_SHORTCUTS.msgMarkdownItalic,
    link: KEYBOARD_SHORTCUTS.msgMarkdownLink,
    strike: KEYBOARD_SHORTCUTS.msgMarkdownStrike,
    code: KEYBOARD_SHORTCUTS.msgMarkdownCode,
    h1: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    h2: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    h3: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    h4: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    h5: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    h6: KEYBOARD_SHORTCUTS.msgMarkdownH3,
    quote: KEYBOARD_SHORTCUTS.msgMarkdownQuote,
    ul: KEYBOARD_SHORTCUTS.msgMarkdownUl,
    ol: KEYBOARD_SHORTCUTS.msgMarkdownOl,
};

const FormattingIcon = (props: FormattingIconProps): JSX.Element => {
    /**
     * by passing in the otherProps spread we guarantee that accessibility
     * properties like aria-label, etc. get added to the DOM
     */
    const {mode, onClick, ...otherProps} = props;

    /* get the correct Icon from the IconMap */
    const Icon = MAP_MARKDOWN_MODE_TO_ICON[mode];
    const {formatMessage} = useIntl();
    const ariaLabelDefinition = MAP_MARKDOWN_MODE_TO_ARIA_LABEL[mode];
    const buttonAriaLabel = formatMessage(ariaLabelDefinition);

    const bodyAction = (
        <IconContainer
            type='button'
            id={`FormattingControl_${mode}`}
            onClick={onClick}
            aria-label={buttonAriaLabel}
            {...otherProps}
        >
            <Icon
                color={'currentColor'}
                size={18}
            />
        </IconContainer>
    );

    /* get the correct tooltip from the ShortcutsMap */
    const shortcut = MAP_MARKDOWN_MODE_TO_KEYBOARD_SHORTCUTS[mode];
    const tooltip = (
        <Tooltip id='upload-tooltip'>
            <KeyboardShortcutSequence
                shortcut={shortcut}
                hoistDescription={true}
                isInsideTooltip={true}
            />
        </Tooltip>
    );

    return (
        <OverlayTrigger
            delayShow={Constants.OVERLAY_TIME_DELAY}
            placement='top'
            trigger={['hover', 'focus']}
            overlay={tooltip}
        >
            {bodyAction}
        </OverlayTrigger>
    );
};

export default memo(FormattingIcon);
