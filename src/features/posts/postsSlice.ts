import { createEntityAdapter, createSlice, EntityState, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { sub } from 'date-fns'

import type { RootState } from '@/app/store'

import { logout } from '@/features/auth/authSlice'
import { createAppAsyncThunk } from '@/app/withTypes'
import { client } from '@/api/client'
import { ACTIONS } from 'react-tiny-toast'

export interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export type ReactionName = keyof Reactions

export interface Post {
  id: string
  title: string
  content: string
  user: string
  date: string
  reactions: Reactions
}

type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>
type NewPost = Pick<Post, 'title' | 'content' | 'user'>

interface PostsState extends EntityState<Post, string> {
  status: 'idle' | 'pending' | 'succeeded' | 'rejected'
  error: string | null
}

const postsAdapter = createEntityAdapter<Post>({
  // Sort in descending date order
  sortComparer: (a, b) => b.date.localeCompare(a.date),
})

const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
}

const initialState: PostsState = postsAdapter.getInitialState({
  status: 'idle',
  error: null,
})

export const addNewPost = createAppAsyncThunk('posts/addNewPost', async (newPost: NewPost) => {
  const response = await client.post<Post>('/fakeApi/posts', newPost)
  return response.data
})

export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')
    return response.data
  },
  {
    condition(arg, thunkApi) {
      const postsStatus = selectPostsStatus(thunkApi.getState())
      return postsStatus === 'idle'
    },
  },
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // postAdded: {
    //   reducer(state, action: PayloadAction<Post>) {
    //     state.posts.push(action.payload)
    //   },
    //   prepare(title: string, content: string, userId: string) {
    //     return {
    //       payload: {
    //         id: nanoid(),
    //         date: new Date().toISOString(),
    //         title,
    //         content,
    //         user: userId,
    //         reactions: initialReactions,
    //       },
    //     }
    //   },
    // },
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload

      // const existingPost = state.posts.find((post) => post.id === id)

      const existingPost = state.entities[id]
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(state, action: PayloadAction<{ postId: string; reaction: ReactionName }>) {
      const { postId, reaction } = action.payload

      // const existingPost = state.posts.find((post) => post.id === postId)

      const existingPost = state.entities[postId]

      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => {
        // Clear out the list of posts whenever the user logs out
        return initialState
      })
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'

        // state.posts.push(...action.payload)
        postsAdapter.setAll(state, action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'rejected'

        state.error = action.error.message ?? 'Unknown Error :/'
      })
      .addCase(addNewPost.fulfilled, postsAdapter.addOne)
  },
})

export const { postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// export const selectAllPosts = (state: RootState) => state.posts.posts
// export const selectPostById = (state: RootState, postId: string) => state.posts.posts.find((post) => post.id === postId)

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors((state: RootState) => state.posts)

export const selectPostsStatus = (state: RootState) => state.posts.status
export const selectPostsError = (state: RootState) => state.posts.error
