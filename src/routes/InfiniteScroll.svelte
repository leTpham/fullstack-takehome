<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";

  //how close to the bottom the user needs to scroll before triggering the loadMore event
  export let threshold = 0;

  //whether there are more items to load.
  export let hasMore = true;

  const dispatch = createEventDispatcher();

  //whether a loadMore event is already in progress.
  let isLoadMore = false;

  let component;

  onMount(() => {
    //the scrollable element.
    const element = component.parentNode;

    function onScroll() {
      //distance between the bottom of the scrollable element
      // and the visible portion of the content.
      const offset = element.scrollHeight - element.clientHeight - element.scrollTop;

      // Check if user has scrolled close enough to the bottom, and if
      // a loadMore event is not already in progress, and if there are more
      // items to load.
      if (offset <= threshold && !isLoadMore && hasMore) {
        dispatch("loadMore");
        // Set the flag to indicate that a loadMore event is in progress.
        isLoadMore = true;
      } else {
        // Reset the flag when the user is not scrolling close to the bottom
        // or if a loadMore event is already in progress.
        isLoadMore = false;
      }
    };

    // Attach the scroll event listener to the scrollable element.
    element.addEventListener("scroll", onScroll);

    // Return a cleanup function that removes the scroll event listener
    // when the component is unmounted.
    return () => {
      element.removeEventListener("scroll", onScroll);
    };
  });
</script>

<div bind:this={component} style="width:0px" />
