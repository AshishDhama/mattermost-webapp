// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {MouseEventHandler, ReactNode} from 'react';
import MuiMenuItem, {MenuItemProps as MuiMenuItemProps} from '@mui/material/MenuItem';
import {styled as muiStyled} from '@mui/material/styles';

interface Props {
    id?: string;
    onClick?: MouseEventHandler<HTMLLIElement>;
    onMouseEnter?: MouseEventHandler<HTMLLIElement>;
    onMouseLeave?: MouseEventHandler<HTMLLIElement>;
    disabled?: boolean;
    destructive?: boolean;
    children: ReactNode;
}

export function MenuItem(props: Props) {
    return (
        <MuiMenuItemStyled
            disableRipple={true}
            disableTouchRipple={true}
            {...props}
        >
            {props.children}
        </MuiMenuItemStyled>
    );
}

interface MenuItemProps extends MuiMenuItemProps {
    destructive?: boolean;
}

/* eslint-disable no-negated-condition */
const MuiMenuItemStyled = muiStyled(MuiMenuItem)<MenuItemProps>(({destructive = false}) => ({
    '&.MuiMenuItem-root': {
        color: !destructive ? 'var(--center-channel-color)' : 'var(--error-text)',
        padding: '0',
        '&:hover': {
            backgroundColor: 'transparent',
        },
        '&:active': {
            'background-color': 'transparent',
        },
        '&.Mui-disabled': {
            color: 'rgba(var(--center-channel-color-rgb), 0.32)',
        },
        '&.Mui-focusVisible': {
            boxShadow: !destructive ? '0 0 0 2px var(--denim-sidebar-active-border) inset' : '0 0 0 2px rgba(var(--button-color-rgb), 0.16) inset',
            backgroundColor: destructive && 'rgba(var(--error-text-rgb), 0.08)',
        },
    },
}));
