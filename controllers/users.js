const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User
        .find({}).populate('blogs', {url:1,title:1,author:1,id:1})
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    const exists = await User.findOne({ username })
    if (exists) {
        return response.status(400).json({
            error: 'username must be unique'
        })
    }
    if (!password || password.length < 3) {
        return response.status(400).json({
            error: 'Password must be atleast 3 characters long'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    const user = new User({
        username: username,
        name: name,
        passwordHash: passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter