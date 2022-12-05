// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ReactNode, useState, MouseEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import MuiMenu, {MenuProps as MuiMenuProps} from '@mui/material/Menu';
import MuiMenuList from '@mui/material/MenuList';
import {styled as muiStyled} from '@mui/material/styles';

import {getTheme} from 'mattermost-redux/selectors/entities/preferences';

import {getIsMobileView} from 'selectors/views/browser';

import {openModal, closeModal} from 'actions/views/modals';

import CompassDesignProvider from 'components/compass_design_provider';
import Tooltip from 'components/tooltip';
import OverlayTrigger from 'components/overlay_trigger';
import GenericModal from 'components/generic_modal';

const OVERLAY_TIME_DELAY = 500;

interface Props {

    // Trigger button props
    triggerId?: string;
    triggerElement: ReactNode;
    triggerClassName?: string;
    triggerAriaLabel?: string;

    // Tooltip of Trigger button props
    triggerTooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
    triggerTooltipId?: string;
    triggerTooltipText?: string;
    triggerTooltipClassName?: string;

    // Menu props
    menuId: string;
    menuAriaLabel?: string;

    children: ReactNode[];
}

export function Menu(props: Props) {
    const theme = useSelector(getTheme);

    const isMobileView = useSelector(getIsMobileView);

    const dispatch = useDispatch();

    const [anchorElement, setAnchorElement] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(anchorElement);

    if (isMobileView) {
        function MenuModalComponent() {
            function handleModalExited() {
                dispatch(closeModal(props.menuId));
            }

            function handleModalClickCapture(event: MouseEvent<HTMLUListElement>) {
                if (event && event.currentTarget.contains(event.target as Node)) {
                    for (const currentElement of event.currentTarget.children) {
                        if (currentElement.contains(event.target as Node) && !currentElement.ariaHasPopup) {
                            // We check for property ariaHasPopup because we don't want to close the menu
                            // if the user clicks on a submenu item. And let submenu component handle the click.
                            handleModalExited();
                            break;
                        }
                    }
                }
            }

            return (
                <CompassDesignProvider theme={theme}>
                    <GenericModal
                        id={props.menuId}
                        ariaLabel={props.menuAriaLabel}
                        onExited={handleModalExited}
                        backdrop={true}
                        className='menuModal'
                    >
                        <MuiMenuList
                            aria-labelledby={props.triggerId}
                            onClick={handleModalClickCapture}
                        >
                            {props.children}
                        </MuiMenuList>
                    </GenericModal>

                </CompassDesignProvider>
            );
        }

        function handleAnchorButtonClickOnMobile(event: MouseEvent<HTMLButtonElement>) {
            event.preventDefault();

            dispatch(openModal({
                modalId: props.menuId,
                dialogType: MenuModalComponent,
            }));
        }

        return (
            <button
                id={props.triggerId}
                aria-controls={props.menuId}
                aria-haspopup='true'
                aria-label={props.triggerAriaLabel}
                className={props.triggerClassName}
                onClick={handleAnchorButtonClickOnMobile}
            >
                {props.triggerElement}
            </button>
        );
    }

    function handleAnchorButtonClick(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        setAnchorElement(event.currentTarget);
    }

    function rendertriggerElement() {
        const triggerElement = (
            <button
                id={props.triggerId}
                aria-controls={isMenuOpen ? props.menuId : undefined}
                aria-haspopup='true'
                aria-expanded={isMenuOpen ? 'true' : undefined}
                aria-label={props.triggerAriaLabel}
                className={props.triggerClassName}
                onClick={handleAnchorButtonClick}
                tabIndex={isMenuOpen ? 0 : -1}
            >
                {props.triggerElement}
            </button>
        );

        if (props.triggerTooltipText) {
            return (
                <OverlayTrigger
                    delayShow={OVERLAY_TIME_DELAY}
                    placement={props?.triggerTooltipPlacement ?? 'top'}
                    overlay={
                        <Tooltip
                            id={props.triggerTooltipId}
                            className={props.triggerTooltipClassName}
                        >
                            {props.triggerTooltipText}
                        </Tooltip>
                    }
                    disabled={!props.triggerTooltipText || isMenuOpen}
                >
                    {triggerElement}
                </OverlayTrigger>
            );
        }

        return triggerElement;
    }

    function handleMenuClose(event: MouseEvent<HTMLDivElement | HTMLUListElement>) {
        event.preventDefault();
        setAnchorElement(null);
    }

    return (
        <CompassDesignProvider theme={theme}>
            {rendertriggerElement()}
            <MuiMenuStyled
                id={props.menuId}
                anchorEl={anchorElement}
                open={isMenuOpen}
                onClose={handleMenuClose}
                aria-label={props.menuAriaLabel}
                elevation={24}
            >
                <MuiMenuList
                    aria-labelledby={props.triggerId}
                    onClick={handleMenuClose}
                >
                    {props.children}
                </MuiMenuList>
            </MuiMenuStyled>
        </CompassDesignProvider>
    );
}

const MuiMenuStyled = muiStyled(MuiMenu)<MuiMenuProps>(() => ({
    '& .MuiPaper-root': {
        backgroundColor: 'var(--center-channel-bg)',
        boxShadow: 'var(--elevation-4) , 0 0 0 1px rgba(var(--center-channel-color-rgb), 0.08) inset',
        minWidth: '114px',
        maxWidth: '496px',
        maxHeight: '80vh',
    },
    '& .MuiMenu-list': {
        padding: '0',
    },
}));
