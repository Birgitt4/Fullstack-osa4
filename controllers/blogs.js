const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name:1, id:1})
  response.json(blogs)
})

//token on headerissä `authorization`
/*const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    return authorization.substring(7)
  }
  return null
}*/

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  //const token = getTokenFrom(request)
  //const decodedToken = jwt.verify(token, process.env.SECRET)
  //const decodedToken = jwt.verify(request.token, process.env.SECRET)
  //if (!decodedToken) {
    //return response.status(401).json({error: 'token missing or invalid'})
  //}
  const user = request.user

  //liitetään uusi blogi vain tietokannan ekaan käyttäjään
  //const users = await User.find({})
  //const user = users[0]
  
  //Blogin saa lisätä kuka tahansa kirjautunut käyttäjä
  //error tokenissa tai userissa??

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })
  const savedBlog = await blog.save()
  //blogi liitetään myös käyttäjän tietoihin
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})
//4.13
//4.21 poisto onnistuu vain jos poiston tekijä, = kenen token, on sama kuin blogin lisääjä
blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  //const decodedToken = jwt.verify(request.token, process.env.SECRET)
  //if (!decodedToken) {
    //return response.status(401).json({error: 'token missing or invalid'})
  //}
  //tokenin käyttäjä
  const user = request.user
  //poistettava blogi
  const blog = await Blog.findById(id)
  if (blog.user.toString() === user.id.toString()) {
    await Blog.findByIdAndRemove(id)
    response.status(204).end()
  } else {
    return response.status(403).json({error: 'it looks like this ain\'t your blog'})
  }
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body
  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updated = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.status(201).json(updated)
})

module.exports = blogsRouter