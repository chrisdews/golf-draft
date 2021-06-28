export function reducer (state, action) {
    switch(action.type){
        case 'SET_USER_DATA':
            return { ...state, userData: action.payload}
        default: 
            throw new Error('Invalid action type dispatched')
    }
}

export default reducer;