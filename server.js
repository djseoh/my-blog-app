const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const expressSanitizer = require('express-sanitizer')
const app = express();
const PORT = process.env.PORT || 3001

// APP CONFIG
mongoose.connect('mongodb://localhost:k27017/my-blog-app', { useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);

app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(expressSanitizer());

// MONGOOSE/MODEL CONFIG
const blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
})

const Blog = mongoose.model('Blog', blogSchema)

// Blog.create({
//     title: 'test blog',
//     image: '',
//     body: 'this is a blog post'
// });

//RESTFUL ROUTES

app.get('/', (req, res) => {
    res.redirect('/blogs')
})

//INDEX ROUTE
app.get('/blogs', (req, res) => {
    Blog.find({}, (err, blogs) =>{
        if (err) {
            console.log(err)
        } else {
            res.render('index', {blogs: blogs})
        }
    })
});

// NEW ROUTE
app.get('/blogs/new' , (req, res) => {
    res.render('new');
})

// CREATE ROUTE
app.post('/blogs', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err) {
            res.render('new')
        } else {
            res.redirect('/blogs')
        }
    })
})

// SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect('/blogs')
        } else {
            res.render('show', {blog: foundBlog});
        }
    })
})

// EDIT ROUTE
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err) {
            res.redirect('/blogs');
        } else {
            res.render('edit', { blog: foundBlog });
        }
    })
})

// UPDATE ROUTE
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if(err) {
            res.redirect('/blogs')
        } else {
            res.redirect('/blogs/' + req.params.id)
        }
    })
})

// DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove( req.params.id, (err) => {
        if (err) {
            res.redirect('/blogs')
        } else {
            res.redirect('/blogs')
        }
    })
})

app.listen(PORT, () => {
    console.log('server has started')
})