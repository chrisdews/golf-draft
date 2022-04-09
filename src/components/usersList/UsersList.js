import React from "react";

const UsersList = ({ users }) => {
  const displayUsers = (users) => {
    let userListArr = [];
    for (const key in users) {
      if (Object.hasOwnProperty.call(users, key)) {
        userListArr.push(
          <li>
            {users[key].displayName} - {users[key].role}
          </li>
        );
      }
    }
    return userListArr;
  };

  return <div>{users && displayUsers(users)}</div>;
};

export default UsersList;
