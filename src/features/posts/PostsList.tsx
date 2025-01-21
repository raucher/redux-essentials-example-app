import { Link } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { TimeAgo } from '@/components/TimeAgo'

import { PostAuthor } from './PostAuthor'
import { fetchPosts, selectAllPosts, selectPostsError, selectPostsStatus } from './postsSlice'
import { ReactionButtons } from './ReactionButtons'
import { useEffect } from 'react'
import { Spinner } from '@/components/Spinner'
import PostExcerpt from './PostExcerpt'

export const PostsList = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const postStatus = useAppSelector(selectPostsStatus)
  const postsError = useAppSelector(selectPostsError)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  let content: React.ReactNode

  if (postStatus === 'pending') {
    content = <Spinner text="Loading..." />
  } else if (postStatus === 'succeeded') {
    // Sort posts in reverse chronological order by datetime string
    const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))
    content = orderedPosts.map((post) => <PostExcerpt key={post.id} post={post} />)
  } else if (postStatus === 'failed') {
    content = <div>{postsError}</div>
  }

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {content}
    </section>
  )
}
