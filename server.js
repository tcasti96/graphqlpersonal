const express =  require('express');
const expressGraphql = require('express-graphql').graphqlHTTP;
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');
const app = express();

const bands = [
    { id: 1, name: 'The Beatles' },
    { id: 2, name: 'Rolling Stones' },
    { id: 3, name: 'Jimi Hendrix'}
]

const songs = [
    { id: 1, name: 'Nowhere Man', bandId: 1 },
    { id: 2, name: 'All You Need Is Love', bandIdId: 1 },
    { id: 3, name: 'Im Only Sleeping', bandId: 1 },
    { id: 4, name: 'Paint It, Black', bandId: 2 },
    { id: 5, name: 'Gimmie Shelter', bandId: 2 },
    { id: 6, name: 'Beast of Burden', bandId: 2 },
    { id: 7, name: 'Are You Experienced', bandId: 3 },
    { id: 8, name: 'Third Stone From the Sun', bandId: 3}
]

const SongType = new GraphQLObjectType ({
    name: 'Song',
    description: 'This represents the song written by the band',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        bandId: { type: GraphQLNonNull(GraphQLInt)}, 
        band: { 
            type: BandType,
            resolve: (song) => {
                return bands.find(band => band.id === song.bandId)
            }
            },

    })
})

const BandType = new GraphQLObjectType ({
    name: 'Band',
    description: 'This represents the band who wrote the song',
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt)},
        name: { type: GraphQLNonNull(GraphQLString)},
        songs: { type: new GraphQLList(SongType),
        resolve: (band) => {
            return songs.filter(song => song.bandId === band.id)
        }}
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        song: {
            type: SongType,
            description: 'A Single Song',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => songs.find(song => song.id === args.id)
        },
        songs: {
            type: new GraphQLList(SongType),
            description: 'List of All Songs',
            resolve: () => songs
        },
        bands: {
            type: new GraphQLList(BandType),
            description: 'List of All Bands',
            resolve: () => bands
        },
        band: {
            type: BandType,
            description: 'A Single Bands',
            args: { 
                id: {type: GraphQLInt}
            },
            resolve: (parent,args) => bands.find(band => band.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addSong: {
            type: SongType,
            description: 'Add a Song',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
                bandId: { type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const song = { id: songs.length + 1, name: args.name, bandId: 
                args.bandId}
                songs.push(song)
                return song
            }
        },
        addBand: {
            type: BandType,
            description: 'Add a Band',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const band = { id: bands.length + 1, name: args.name }
                bands.push(band)
                return band
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphql({
    schema: schema, 
    graphiql: true
}))
app.listen(3000., () => console.log('Server Running'))