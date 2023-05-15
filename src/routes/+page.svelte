<script lang="ts">
	import { cacheExchange, createClient, fetchExchange, gql } from '@urql/svelte';
	import { onMount, onDestroy } from 'svelte';

	import Loader from 'components/Loader.svelte';
	import User from 'components/User.svelte';
	import type { UserType } from 'lib/types';
	import { USER_BATCH_SIZE } from '../config';

	import InfiniteScroll from './InfiniteScroll.svelte';

	const client = createClient({
		url: '/graphql',
		exchanges: [cacheExchange, fetchExchange]
	});
	let after: number = 0; //keep track of id of last user loaded to offset query
	let users: UserType[] = []; //array to store fetched users
	let isLoading: boolean = false; //if a request is in progress
	let hasMore: boolean = true; //if there are more users to fetch
	let timeoutId: number; //id of setTimeOut used to show spinner while fetching

	/** Fetch users from GraphQL
	 * query accepts two arguments:
	 *  - first: indicate amount of users to fetch for each batch
	 *  - after: last user's id for paginated fetching
	 */
	async function fetchUsers() {
		//set loading to be true when start fetching users
		isLoading = true;

		const query = gql`
			query ($first: Int, $after: String) {
				users(first: $first, after: $after) {
					id
					name
					avatar
					email
				}
			}
		`;

		const { data } = await client.query(query, { first: USER_BATCH_SIZE, after: after.toString() });

		//set loading to false once the users are fetched
		isLoading = false;

		//if there are users in the data fetched, append it to the users array
		if (data && data.users.length > 0) {
			users = [...users, ...data.users];
		} else {
			hasMore = false;
		}
	}

	/** Fetch users with a delay of 0.5s -> to show spinner when scrolled to bottom of page*/
	function fetchUsersWithTimeout() {
		isLoading = true;
		timeoutId = window.setTimeout(fetchUsers, 500);
	}

	//fetch the first batch of users on mount
	onMount(fetchUsers);

	onDestroy(() => {
		clearTimeout(timeoutId);
	});

	/** Load next batch of users. */
	function nextBatch() {
		after = users.length;
		clearTimeout(timeoutId);
		fetchUsersWithTimeout();
	}
</script>

<div class="w-full h-full overflow-scroll">
	<div class="flex flex-col gap-4 items-center p-4 h-full w-full overflow-scroll">
		{#if users.length === 0}
			<div class="flex items-center justify-center">
				<Loader />
			</div>
		{:else}
			{#each users as user (user.id)}
				<User {user} />
			{/each}
			{#if isLoading}
				<div class="flex items-center justify-center">
					<Loader />
				</div>
			{:else if hasMore}
				<InfiniteScroll threshold={100} hasMore={true} on:loadMore={nextBatch} />
			{/if}
		{/if}
	</div>
</div>
