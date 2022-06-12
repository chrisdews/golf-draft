import React from "react";
import Link from 'next/link'

const userDraftsList = ({ drafts }) => {
  if (!drafts) return "no drafts to show";


  const userDrafts = () => {
    return Object.keys(drafts).map((key) => (
      <li>
      <Link href={`/draft/${key}`}>{drafts[key]?.draftName}</Link>
      </li>
    ));
  };

  return (
    <div>
      {userDrafts()}
    </div>
  );
};

export default userDraftsList;
