const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const User = require('../models/user')

describe('when there is initially a user', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('salasana', 10)
        const user = new User({
            username: 'root',
            passwordHash: passwordHash
        })

        await user.save()
    })

    describe('user creation', () => {
        test('creation of a user with valid name succeeds', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'noname',
                password: 'qwerty'
            }
            await api
                .post('/api/users')
                .send(newUser)
                .expect(201)
                .expect('Content-Type', /application\/json/)
        
            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length +1)

            const usernames = usersAtEnd.map(u => u.username)
            expect(usernames).toContain(newUser.username)
        })

        test('if username taken creation fails with proper status and msg', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = { username: 'root', password: 'salasana' }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
        
            expect(result.body.error).toContain('username must be unique')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
        test('too short password causes an error with message', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = { username: 'newUser', password: 'xd' }

            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
        
            expect(result.body.error).toContain('Password must be atleast 3')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
        test('too short username causes an error with message', async () => {
            const usersAtStart = await helper.usersInDb()
            const newUser = { username: 'xd', name: 'hupiukko', password: 'salasana' }
            
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            
            expect(result.body.error).toContain('Username must be atleast 3')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
    })

})
afterAll(() => {
    mongoose.connection.close()
})