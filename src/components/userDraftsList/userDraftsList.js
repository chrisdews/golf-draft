import React, { useEffect } from "react";
import Link from 'next/link'

const userDraftsList = ({ drafts }) => {
  if (!drafts) return "no drafts to show";

  console.log({drafts})

  const userDrafts = () => {
    return Object.keys(drafts).map((key) => (
      <li>
      <Link href={`/draft/${key}`}>{drafts[key]?.name}</Link>
      </li>
    ));
  };

  return (
    <div>
      User's Drafts
      {userDrafts()}
    </div>
  );
};

export default userDraftsList;
