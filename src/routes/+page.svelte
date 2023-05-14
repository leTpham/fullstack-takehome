<script lang="ts">
	import { cacheExchange, createClient, fetchExchange, gql } from '@urql/svelte';
	import { onMount } from 'svelte';

	import Loader from 'components/Loader.svelte';
	import User from 'components/User.svelte';
	import type { UserType } from 'lib/types';
	import { USER_BATCH_SIZE } from '../config';

	import InfiniteScroll from './InfiniteScroll.svelte';

	const client = createClient({
		url: '/graphql',
		exchanges: [cacheExchange, fetchExchange]
	});

	let after: number = 0;
	let users: UserType[] = [];
	let isLoading: boolean = false;
	let hasMore: boolean = true;
	let timeoutId: number;
  let searchQuery:string = ""

	async function fetchUsers() {
    console.log("fetching users")
		const query = gql`
			query ($first: Int, $after: String, $name: String) {
				users(first: $first, after: $after, name: $name) {
					id
					name
					avatar
					email
				}
			}
		`;
		isLoading = true;

		const { data } = await client
			.query(query, { first: USER_BATCH_SIZE, after: after.toString(), name: searchQuery })
			.toPromise();
		isLoading = false;
		if (data && data.users.length > 0) {
			users = [...users, ...data.users];
			console.log('users', users);
			console.log('data', data);
		} else {
			hasMore = false;
		}
	}

  function searchUsers() {
    users = [];
    after = 0;
    fetchUsers();
  }

	function fetchUsersWithTimeout() {
		isLoading = true;
		timeoutId = window.setTimeout(fetchUsers, 1000);
	};

	onMount(fetchUsers);

	function nextBatch() {
		after = users.length;
		clearTimeout(timeoutId);
		fetchUsersWithTimeout();
		console.log('nextbatch executed', after);
	}
</script>

<div>
  <input type="text" bind:value="{searchQuery}"/>
  <button on:click="{searchUsers}">Search</button>
<div class="w-full h-full overflow-scroll">
	<div class="flex flex-col gap-4 items-center p-4 h-full w-full overflow-scroll">
		{#if users.length === 0 && !isLoading}
			<div class="flex items-center justify-center">
				No users found.
			</div>
		{:else}
			{#each users as user (user.id)}
				<User {user}/>
			{/each}
			{#if isLoading}
				<div class="flex items-center justify-center">
					<Loader />
				</div>
			{:else if hasMore}
				<InfiniteScroll
          threshold={100}
          hasMore={true}
          on:loadMore={nextBatch}
          />
			{/if}
		{/if}
	</div>
</div>
</div>