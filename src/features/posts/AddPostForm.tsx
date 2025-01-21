import React, { useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCurrentUsername } from '@/features/auth/authSlice'

import { addNewPost } from './postsSlice'

// TS types for the input fields
// See: https://epicreact.dev/how-to-type-a-react-form-on-submit-handler/
interface AddPostFormFields extends HTMLFormControlsCollection {
  postTitle: HTMLInputElement
  postContent: HTMLTextAreaElement
}
interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddPostFormFields
}

export const AddPostForm = () => {
  const dispatch = useAppDispatch()
  const [addRequestStatus, setAddRequestStatus] = useState<'idle' | 'pending'>('idle')

  const userId = useAppSelector(selectCurrentUsername)!

  const handleSubmit = async (e: React.FormEvent<AddPostFormElements>) => {
    // Prevent server submission
    e.preventDefault()
    if (addRequestStatus !== 'idle') {
      return
    }

    const { elements } = e.currentTarget

    const newPost = {
      title: elements.postTitle.value,
      content: elements.postContent.value,
      user: userId,
    }

    try {
      setAddRequestStatus('pending')
      await dispatch(addNewPost(newPost)).unwrap()
    } catch (error) {
      console.log('Failed to save post: ', error)
    } finally {
      setAddRequestStatus('idle')
    }

    e.currentTarget.reset()
  }

  return (
    <section>
      <h2>Add a New Post</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input type="text" id="postTitle" defaultValue="" required />
        <label htmlFor="postContent">Content:</label>
        <textarea id="postContent" name="postContent" defaultValue="" required />
        <button disabled={addRequestStatus !== 'idle'}>Save Post</button>
      </form>
    </section>
  )
}
