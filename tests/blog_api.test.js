
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')

describe('when there are some blogs in database', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    
    test('2 blogs returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    //4.9. blogien id on nimeltään id ei _id, lisätty blogSchema.set('toJSON...
    test('id field is defined as "id"', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
    })

    test('a blog can be deleted', async () => {
        const blogAtStart = (await helper.blogsInDb())[0]

        await api
            .delete(`/api/blogs/${blogAtStart.id}`)
            .expect(204)
        
        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length -1)

        const titles = blogsAtEnd.map(b => b.title)
        expect(titles).not.toContain(blogAtStart.title)
    })

    test('a blog can be edited', async () => {
        const blogAtStart = (await helper.blogsInDb())[0]
        const edited = {
            ...blogAtStart,
            likes: 99
        }

        await api
            .put(`/api/blogs/${blogAtStart.id}`)
            .send(edited)
            .expect(200)
        
        const blogsAtEnd = await helper.blogsInDb()
        const blogAtEnd = blogsAtEnd.find(b => b.id === blogAtStart.id)
        expect(blogAtEnd.likes).toBe(99)
    })

    describe('adding a new blog', () => {
        let token
        beforeEach(async () => {
            await User.deleteMany({})

            const passwordHash = await bcrypt.hash('salasana', 10)
            const user = new User({ username: 'root', passwordHash })

            await user.save()

            const response = await api
                .post('/api/login')
                .send({ username: 'root', password: 'salasana' })
            
            token = response.body.token
        })

        test('succeeds if content valid', async () => {
            const newBlog = {
                title: 'Benefits of Scrumban',
                author: 'Kalle Ilves',
                url: 'www.google.com',
                likes: 7
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `bearer ${token}`)
                .expect(201)
                .expect('Content-Type', /application\/json/)
            
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
        
            const titles = blogsAtEnd.map(b => b.title)
            expect(titles).toContain('Benefits of Scrumban')
        })

        test('fails if title and url missing', async () => {
            const newBlog = {
                author: 'Kalle Ilves',
                likes: 7
            }
          
            await api
                .post('/api/blogs')
                .send(newBlog)
                .set('Authorization', `bearer ${token}`)
                .expect(400)
                .expect('Content-Type', /application\/json/)
          
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        })
    })
})

afterAll(() => {
    await Blog.deleteMany({})
    mongoose.connection.close()
})
