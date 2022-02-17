
const errorHandler = (error, request, response, next) => {
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }
    else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({
            error: 'invalid token'
        })
    }
    
    next(error)
}

const tokenExtractor = (request, response, next) => {
    //routet pääsee tokeniin suoraan
    //request.token
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer')) {
        const token = authorization.substring(7)
        request.token = token
    } else {
        request.token = null
    }
    next()
}

const userExtractor = (request, response, next) => {
    //routejen pitäisi päästä käyttäjään kutsulla
    //const user = request.user
    if (request.token) {
        const decodedToken = jwt.verify(request.token, process.env.SECRET)
        request.user = User.findById(decodedToken.id)
    }
    next()
}

module.exports = {
    errorHandler,
    tokenExtractor,
    userExtractor
}