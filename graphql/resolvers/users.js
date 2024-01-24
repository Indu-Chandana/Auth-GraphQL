const User = require('../../models/User');
const { ApolloError } = require('apollo-server-errors')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
    Mutation: {
        async registerUser(_, { registerInput: { username, email, Password } }) {
            // See if an old user exists with email attempting to register
            const oldUser = await User.findOne({ email });

            // Throw error if that user exists
            if (oldUser) {
                throw new ApolloError('A user is already registered with the email' + email, 'USER_ALREADY_EXISTS')
            }

            // Encrypt password
            var encryptedPassword = await bcrypt.hash(Password, 10);

            // Build out mongooose model
            const newUser = new User({
                username: username,
                email: email.toLowerCase(),
                password: encryptedPassword
            })

            // create our JWT (attatch to our User model)
            const token = jwt.sign({ user_id: newUser._id, email }, "UNSAFE_STRING", { expiresIn: "2h" })
            newUser.token = token

            // Save our user in MongoDB
            const res = await newUser.save();

            return { id: res.id, ...res._doc }
        },

        async loginUser(_, { loginInput: { email, password } }) {
            // See is a user exists with the email
            const user = await User.findOne({ email });

            // Check if the entered password equal to the encrypted password
            if (user && (await bcrypt.compare(password, user.password))) {
                // Create a NEW token
                const token = jwt.sign({ user_id: user._id, email }, "UNSAFE_STRING", { expiresIn: '2h' })

                // Attatch token to user model that we found above
                user.token = token
                return { id: user.id, ...user._doc }
            } else {
                // If user doesn't exist, return error
                throw new ApolloError('Icorrect password', 'INCORRECT_PASSWORD');
            }

        }
    },
    Query: {
        user: (_, { id }) => User.findById(id)
    }
}