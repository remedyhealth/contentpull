'use strict';

module.exports = {
    unparsed: {
        sys: {
            id: 'test',
            type: 'Asset',
            createdAt: '1',
            updatedAt: '2',
            revision: '3',
        },
        fields: {
            str: 'test',
            obj: {
                sys: {
                    id: 'test',
                    type: 'Asset',
                    createdAt: '1',
                    updatedAt: '2',
                    revision: '3',
                },
                fields: {
                    test: 'test'
                },
            },
            arr: [{
                sys: {
                    id: 'test',
                    type: 'Asset',
                    createdAt: '1',
                    updatedAt: '2',
                    revision: '3',
                },
                fields: {
                    test: 'test'
                },
            }],
        }
    },
    parsed: {
        id: 'test',
        type: 'Asset',
        meta: {
            createdAt: '1',
            updatedAt: '2',
            revision: '3',
        },
        fields: {
            str: 'test',
            obj: {
                id: 'test',
                type: 'Asset',
                meta: {
                    createdAt: '1',
                    updatedAt: '2',
                    revision: '3',
                },
                fields: {
                    test: 'test'
                },
            },
            arr: [{
                id: 'test',
                type: 'Asset',
                meta: {
                    createdAt: '1',
                    updatedAt: '2',
                    revision: '3',
                },
                fields: {
                    test: 'test'
                },
            }],
        }
    }
};
