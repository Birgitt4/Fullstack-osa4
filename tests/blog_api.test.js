
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
    {
        title: "a",
        author: "b",
        url : "abc.fi",
        likes: 0
    },
    {
        title: "x",
        author: "y",
        url : "xyz.fi",
        likes: 3
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = initialBlogs
        .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)

    //eller for (let blog of initialBlogs) {let blogObject = new Blog(blog) await blogObject.save()}
    //or await Blog.insertMany(initialBlogs)
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})

//4.8. blogeja palautetaan oikea määrä
test('2 blogs returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})

//4.9. blogien id on nimeltään id ei _id, lisätty blogSchema.set('toJSON...
test('id field is defined as "id"', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body[0].id).toBeDefined()
})

//4.10. blogien lisäys onnistuu. määrä kasvaa yhdellä ja oikeanlainen lisäys
test('adding a blog with all fields works...', async () => {
    const newBlog = {
        title: 'o',
        author: 'p',
        url: 'opq.fi',
        likes: 8
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)
    
    const response = await api.get('/api/blogs')
    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(initialBlogs.length + 1)
    expect(titles).toContain(
        'o'
    )
})

//4.11. jos kentälle likes ei anneta arvoa, likes -> 0
test('adding a blog without likes', async () => {
    const newBlog = {
        title: 'k',
        author: 'm',
        url: 'kmn.fi'
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
    
    const response = await api.get('/api/blogs')
    const blog = response.body.find(blog => blog.title === 'k')

    expect(blog.likes).toBe(0)
})

//4.12 testit blogin lisäyksille ilman titleä tai urlia -> 400 Bad Request.
test('blog without title returns status 400', async () => {
    const newBlog = {
        author: 'p',
        url: 'opq.fi',
        likes: 8
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})
test('blog without url returns status 400', async () => {
    const newBlog = {
        title: 'o',
        author: 'p',
        likes: 8
    }
    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)
    
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(initialBlogs.length)
})


afterAll(() => {
    mongoose.connection.close()
})
