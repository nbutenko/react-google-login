*googleLogin({ payload }, { call, put }) {
    const data = yield call(queryUserGoogleLogin, payload);
    const userId = get(data, 'userId', '');
    const name = get(data, 'user.name');
    const token = get(data, 'token');
    if (name && token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        history.push(`/profile/${userId}`);
        yield put({ type: 'auth' });
    }
},