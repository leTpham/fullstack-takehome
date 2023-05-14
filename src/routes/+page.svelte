<script lang="ts">
  import { cacheExchange, createClient, fetchExchange, gql } from '@urql/svelte';
  import { onMount } from 'svelte';

  import Loader from 'components/Loader.svelte';
  import User from 'components/User.svelte';
  import type { UserType } from 'lib/types';

  import InfiniteScroll from './InfiniteScroll.svelte';

  const client = createClient({
    url: '/graphql',
    exchanges: [cacheExchange, fetchExchange]
  });

  let after = 0;
  let users: UserType[] = [];

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

    const { data } = await client.query(query, { first: 10, after: after.toString() }).toPromise();

    if (data && data.users.length > 0) {
      users = [...users, ...data.users];
	  console.log("users", users)
	  console.log("data", data)
    }
  };

  onMount(fetchUsers);

  function nextBatch() {
    after += 10;
    fetchUsers();
    console.log("nextbatch executed", after);
  }

</script>

<style>
.container {
	height: 100vh;
	overflow:scroll;
}
</style>

<div class="w-full h-full overflow-scroll">
  <div class="flex flex-col gap-4 items-center p-4 container">
    {#if users.length === 0}
      <Loader />
    {:else}
      {#each users as user (user.id)}
        <User {user} />
      {/each}

      <InfiniteScroll
        threshold={100}
        hasMore={true}
        on:loadMore={nextBatch}
      />
    {/if}
  </div>
</div>
