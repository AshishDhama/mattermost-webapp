import React, {memo} from 'react';
import {useSelector} from 'react-redux';
import {getSqlQueries} from 'mattermost-redux/selectors/entities/debugbar';
import {DebugBarSQLQuery} from '@mattermost/types/debugbar';

type Props = {
    filter: string
}

const SQLQueries = ({filter}: Props) => {
    var queries = useSelector(getSqlQueries)
    if (filter != '') {
        queries = queries.filter((v) => JSON.stringify(v).indexOf(filter) !== -1)
    }
    return (
        <table className='DebugBarTable'>
            <thead>
                <tr>
                    <th className='time'>Time</th>
                    <th style={{minWidth: '50%'}}>Query</th>
                    <th>Params</th>
                    <th className='duration'>Duration</th>
                </tr>
            </thead>
            <tbody>
            {queries.map((query: DebugBarSQLQuery) => (
                <tr>
                    <td className='time'>{query.time}</td>
                    <td>{query.query}</td>
                    <td><pre>{query.args ? JSON.stringify(query.args, null, 4) : ''}</pre></td>
                    <td className='duration'>{query.duration}</td>
                </tr>
            ))}
            </tbody>
        </table>
    )
}

export default memo(SQLQueries);
