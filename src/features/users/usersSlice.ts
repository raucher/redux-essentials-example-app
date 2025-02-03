import { createSelector, createSlice } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

import { selectCurrentUsername } from '@/features/auth/authSlice'
import { client } from '@/api/client'
import { createAppAsyncThunk } from '@/app/withTypes'
import { selectAllPosts } from '../posts/postsSlice'

interface User {
  id: string
  name: string
}

export const fetchUsers = createAppAsyncThunk('/users/fetchUsers', async () => {
  const response = await client.get<User[]>('/fakeApi/users')
  return response.data
})

const initialState: User[] = []

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => action.payload)
  },
})

export default usersSlice.reducer

export const selectAllUsers = (state: RootState) => state.users

export const selectUserById = (state: RootState, userId: string | null) =>
  state.users.find((user) => user.id === userId)

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state)
  return selectUserById(state, currentUsername)
}

// export const selectPostByUser = (state: RootState, userId: string) => {
//   const allPosts = selectAllPosts(state)
//   return allPosts.filter((user) => user.id === userId)
// }

export const selectPostByUser = createSelector(
  // Pass in one or more "input selectors"
  [
    // we can pass in an existing selector function that
    // reads something from the root `state` and returns it
    selectAllPosts,
    // and another function that extracts one of the arguments
    // and passes that onward
    (state: RootState, userId: string) => userId,
  ],
  // the output function gets those values as its arguments,
  // and will run when either input value changes
  (posts, userId) => posts.filter((post) => post.user === userId),
)
