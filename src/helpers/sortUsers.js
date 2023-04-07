export default function sortUsers(users) {
    let userListArr = [];
    for (const key in users) {
      if (Object.hasOwnProperty.call(users, key)) {
        userListArr.push({...users[key], id: key});
      }
    }
    return userListArr.sort((a, b) => a.draftOrderWeight - b.draftOrderWeight);
}