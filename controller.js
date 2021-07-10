const { get } = require('lodash');
const userUpdateByIdQuery = require('../queries/updateById');
const { OAuth2Client } = require('google-auth-library');
const googleClientId = '';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const client = new OAuth2Client(googleClientId);

const userGoogleRegister = async (req, res) => {
    const tokenId = get(req, 'body.payload');

    // Get user info from Google
    const user = await client.verifyIdToken({
        idToken: tokenId,
        audience: googleClientId,
    });

    //Check, if user with this email already exists => Login user
    if (user.payload.email_verified) {
        const existedUser = await checkIsUserExist(user.payload.email);

        if (existedUser) {
            const token = generateToken(existedUser.email, existedUser._id);

            const loginDate = new Date();
            await userUpdateByIdQuery({
                userId: existedUser._id,
                values: { lastLogin: { date: loginDate } },
            });

            return res.status(200).json({
                message: 'Login success',
                token,
                user: existedUser,
                userId: existedUser._id,
            });
        }
        //If user with this email doesn't  exist => Create new user
        else {
            const userInfo = user.payload;
            const password = userInfo.email + process.env.JWT_KEY;
            const email = userInfo.email;
            const firstName = userInfo.given_name;
            const lastName = userInfo.family_name;
            const image = userInfo.picture;

            const newUser = await createUser({
                email,
                password,
                firstName,
                lastName,
                image,
            });

            if (newUser.success) {
                const newUserInfo = newUser.payload;
                const token = generateToken(newUserInfo.email, newUserInfo._id);

                return res.status(200).json({
                    message: 'Register success',
                    token,
                    user: newUserInfo,
                    userId: newUserInfo._id,
                });
            } else {
                return res.status(404).json(message.fail('User was not created'));
            }
        }
    }
};

function checkIsUserExist(email) {
    return User.findOne({ email: email })
        .exec()
        .then((doc) => doc)
        .catch(() => false);
}

function generateToken(email, userId) {
    return jwt.sign(
        {
            email,
            userId,
        },
        process.env.JWT_KEY,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        },
    );
}

function createUser({ email, password, firstName, lastName, image = '' }) {
    const userId = new mongoose.Types.ObjectId();
    const user = new User({
        _id: userId,
        email,
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        image,
        password: hashPassword(password),
    });

    return user
        .save()
        .then((data) => {
            return message.success('User created successfully', data, false);
        })
        .catch((error) => {
            if (error) return message.fail('User was not created');
            return message.fail('Error', error);
        });
}

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
};