import React from "react"
import Link from 'next/link'

interface UserDraftsListProps {
  drafts: Record<string, { draftName: string }> | null | undefined
}

const UserDraftsList = ({ drafts }: UserDraftsListProps) => {
  if (!drafts) return <span>no drafts to show</span>

  const userDrafts = () => {
    return Object.keys(drafts).map((key) => (
      <li key={key}>
        <Link href={`/draft/${key}`}>{drafts[key]?.draftName}</Link>
      </li>
    ))
  }

  return (
    <div>
      {userDrafts()}
    </div>
  )
}

export default UserDraftsList
