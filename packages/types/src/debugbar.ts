// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

export type DebugBarAPICall = {
    time: number;
    type: string;
    endpoint: string;
    method: string;
    statusCode: string;
    duration: number;
}

export type DebugBarStoreCall = {
    time: number;
    type: string;
    method: string;
    success: boolean;
    params: {[key: string]: string};
    duration: number;
}

export type DebugBarSQLQuery = {
    time: number;
    type: string;
    query: string;
    args: any[];
    duration: number;
}

export type DebugBarLog = {
    time: number;
    type: string;
    level: string;
    message: string;
    fields: {[key: string]: string};
}

export type DebugBarEmailSent = {
}

export type DebugBarState = {
    apiCalls: DebugBarAPICall[];
    storeCalls: DebugBarStoreCall[];
    sqlQueries: DebugBarSQLQuery[];
    logs: DebugBarLog[];
    emailsSent: DebugBarEmailSent[];
}
