<script>
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
  
	export let initialPostData;
  
	let post = writable(initialPostData);
	let newComment = "";
  
	onMount(() => {
	  const ws = new WebSocket(`ws://localhost:9926/Post/${post.id}`);
	  ws.onmessage = event => {
		const message = JSON.parse(event.data);
		post.set(message.value);
	  };
  
	  return () => {
		ws.close();
	  };
	});
  
	const addComment = async () => {
	  if (newComment.trim()) {
		post.update(currentPost => {
		  const newPost = { ...currentPost, comments: [...currentPost.comments, newComment] };
		  fetch(`http://localhost:9926/Post/${post.id}`, {
			method: "PATCH",
			headers: {
			  "Content-Type": "application/json",
			},
			body: JSON.stringify(newPost),
		  }).then(response => {
			if (response.ok) {
			  console.log("Comment added!");
			} else {
			  console.error("Error adding comment:", response.statusText);
			}
		  }).catch(error => {
			console.error("Error adding comment:", error);
		  });
		  return newPost;
		});
		newComment = "";
	  }
	};
  
	const deleteComment = async (index) => {
	  post.update(currentPost => {
		const newPost = { ...currentPost, comments: currentPost.comments.filter((_, i) => i !== index) };
		fetch(`http://localhost:9926/Post/${post.id}`, {
		  method: "PATCH",
		  headers: {
			"Content-Type": "application/json",
		  },
		  body: JSON.stringify(newPost),
		}).then(response => {
		  if (response.ok) {
			console.log("Comment deleted!");
		  } else {
			console.error("Error deleting comment:", response.statusText);
		  }
		}).catch(error => {
		  console.error("Error deleting comment:", error);
		});
		return newPost;
	  });
	};
  </script>
  
  <article>
	<h1>{$post.title}</h1>
	<p>{$post.body}</p>
	{#if $post.comments && $post.comments.length > 0}
	  <ul>
		{#each $post.comments as comment, index}
		  <li>
			<span>{comment}</span>
			<button class='delete-button' on:click={() => deleteComment(index)}>X</button>
		  </li>
		{/each}
	  </ul>
	{:else}
	  <p>No Comments Yet!</p>
	{/if}
	<form on:submit|preventDefault={addComment}>
	  <input
		type="text"
		bind:value={newComment}
		placeholder="Add a comment"
	  />
	  <button type="submit">Submit</button>
	</form>
  </article>
  
  <style>
	.delete-button {
	  margin-left: 5px;
	  color: red;
	  cursor: pointer;
	  background: transparent;
	  border: 0;
	}
  </style>