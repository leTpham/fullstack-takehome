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

  let after = 0;
  let users: UserType[] = [];
  let isLoading = false;
  let hasMore = true;
  let timeoutId;

  const fetchUsers = async () => {
    const query = gql`
      query($first: Int, $after: String) {
        users(first: $first, after: $after) {
          id
          name
          avatar
          email
        }
      }
    `;
    isLoading = true;

    const { data } = await client.query(query, { first: USER_BATCH_SIZE, after: after.toString() }).toPromise();
    isLoading = false;
    if (data && data.users.length > 0) {
      users = [...users, ...data.users];
      console.log("users", users);
      console.log("data", data);
    } else {
      hasMore = false;
    }
  };

  const fetchUsersWithTimeout = () => {
	isLoading=true;
    timeoutId = setTimeout(() => {
      fetchUsers();
    }, 1000);
  };

  onMount(fetchUsers);
  onDestroy(() => {
    clearTimeout(timeoutId);
  });

  function nextBatch() {
    after += USER_BATCH_SIZE;
    clearTimeout(timeoutId);
    fetchUsersWithTimeout();
    console.log("nextbatch executed", after);
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
        <User {user} key={user.id} />
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
