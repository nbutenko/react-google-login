const googleClientId = '';

const responseGoogle = (response) => {
    if (response.tokenId) {
        props.userGoogleLogin(response.tokenId);
    } else {
        const messageTitle = response.error || 'Google login error';
        const statusText = response.details || 'Google login fail';
        notification.error({
            key: messageTitle,
            message: statusText,
            duration: 10,
        });
    }
};

<GoogleLogin
    clientId={googleClientId}
    buttonText="Login with Google"
    onSuccess={responseGoogle}
    onFailure={responseGoogle}
    cookiePolicy={'single_host_origin'}
/>

const mapDispatchToProps = (dispatch) => ({
    userGoogleLogin: (payload) => dispatch({ type: 'Account/googleLogin', payload }),
});