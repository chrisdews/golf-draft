export function reducer (state, action) {
    switch(action.type){
        case 'SET_USER_DATA':
            return { ...state, userData: action.payload}
        case 'SET_LOGGED_IN':
            return { ...state, isLoggedIn: action.payload}
        case 'SET_USER_DRAFT_DATA':
            return { ...state, userDrafts: action.payload}
        default: 
            throw new Error('Invalid action type dispatched')
    }
}

export default reducer;