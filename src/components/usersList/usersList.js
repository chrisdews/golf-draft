import { Avatar, List } from "antd";
import React from "react";

const UsersList = ({ users }) => {
  if (!users || users.length === 0) return null;

  return (
    <div>
      <List
        header={<h3>Users</h3>}
        itemLayout="horizontal"
        dataSource={users}
        loading={!users.length}
        size="small"
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
              title={<a href="">{index + 1}. {item.displayName}</a>}
              description={<span>{item.role} - order weighting: {item.draftOrderWeight.toFixed(4)}</span>}
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default UsersList;
