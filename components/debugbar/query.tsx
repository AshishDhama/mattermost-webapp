// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {memo, useMemo} from 'react';

import Code from './code';

type Props = {
    query: string;
    args?: string[];
}

function Sql({query, args}: Props) {
    const code = useMemo(() => {
        return query.replace(
            /\$\b\d\b/gm,
            (pl: string) => {
                const index = Number(pl.replace('$', ''));
                if (args?.length && args[index - 1]) {
                    const val = args[index - 1];
                    if (isNaN(Number(val))) {
                        if (val === 'true' || val === 'false') {
                            return val;
                        }
                        return `"${val}"`;
                    }
                    return val;
                }
                return pl;
            },
        );
    }, [query, args]);

    return (
        <Code
            code={code}
            language='sql'
        />
    );
}

export default memo(Sql);