const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const result = blogs.reduce((sum, blog) => {
        return sum + blog.likes
    },0)
    return result
}

const favoriteBlog = (blogs) => {
    const favorit = blogs.reduce((prev, cur) => {
        return (prev.likes > cur.likes) ? prev : cur
    },0)
    return {
        title: favorit.title,
        author: favorit.author,
        likes: favorit.likes
    }
}

module.exports = {
    dummy, totalLikes, favoriteBlog
}