import { createYoga, createSchema } from 'graphql-yoga';
import { useGraphQlJit } from '@envelop/graphql-jit';

import type { RequestEvent } from '@sveltejs/kit';

import { users } from '$lib/data';

import schema from '$lib/schema.gql';
import { USER_BATCH_SIZE } from '../../config';

const yogaApp = createYoga<RequestEvent>({
	schema: createSchema({
		typeDefs: schema,
		resolvers: {
			Query: {
				users: (source, args, context, info) => {
					const { first = USER_BATCH_SIZE, after} = args;
					const startIdx = after !== 0 ? parseInt(after, 10) : 0;
					const paginatedUsers = users.slice(startIdx, startIdx + first)
					return paginatedUsers
				}
			}
		}
	}),
	plugins: [useGraphQlJit()],
	fetchAPI: globalThis
});

export { yogaApp as GET, yogaApp as POST };
