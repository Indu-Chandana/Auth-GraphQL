const { ApolloServer } = require('apollo-server')
const mongoose = require('mongoose');

const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')

const MONGODB = 'mongodb+srv://user:user123@cluster001.n4vq0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const server = new ApolloServer({
    typeDefs,
    resolvers
})

mongoose.connect(MONGODB, { useNewUrlParser: true })
    .then(() => {
        console.log("MongoDB Connected");
        return server.listen({ port: 8000 });
    })
    .then((res) => {
        console.log(`Server running at ${res.url}`)
    })