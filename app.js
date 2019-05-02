var express  = require ("express"),
methodOverride = require("method-override"),
app          = express(),
bodyParser   = require ("body-parser"),
mongoose     = require("mongoose"),
expressSanitizer = require("express-sanitizer");
 
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

var blogSchema = new mongoose.Schema({
    title: String,
    image: String, //{type:String, default:placeholder.jpg
    body: String,
    created: {type: Date, default: Date.now} //created should be a date
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//   title: "TestBlog",
//   image: "https://www.google.com/url?sa=i&source=images&cd=&cad=rja&uact=8&ved=2ahUKEwiMtIOtn67gAhWFilQKHRISBZ0QjRx6BAgBEAU&url=https%3A%2F%2Fwww.homedepot.com%2Fp%2FGlobalrose-100-Red-Roses-Fresh-Flower-Delivery-prime-100-red-roses%2F302885162&psig=AOvVaw2EJlJCOSRwsLEMMvqWGPFS&ust=1549787734905019",
//   body: "Hello this is a blogpost"
// });

//RESTFUL ROUTES
app.get("/", function (req, res){
  res.redirect("/blogs"); //index as homepage or root
});

//INDEX
app.get("/blogs", function(req, res){
  Blog.find({}, function (err, blogs){
    if (err){
      console.log("error");
    } else {
      res.render("index", {blogs: blogs})
    }
  });
});

//NEW ROUTE
app.get("/blogs/new", function (req, res){
  res.render("new");
});

//CREATE ROUTE
app.post("/blogs", function (req, res){
  //create blog
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.create(req.body.blog, /*from your form*/function (err, newBlog){
    if (err) {
      res.render("new");
    } else {
      res.redirect("/blogs");
    }
  });
  //then redirect
});

//SHOW route
app.get("/blogs/:id", function (req, res){
  Blog.findById(req.params.id, function (err, foundBlog){
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  });
});


//Edit route  need to grab pre-existing info
app.get("/blogs/:id/edit", function (req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if (err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

//Update route - updates your edit
app.put("/blogs/:id", function (req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body)
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

//DELETE
app.delete ("/blogs/:id", function (req, res){
  //destroy blog
  Blog.findByIdAndRemove(req.params.id, function (err){
    if (err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs")
    }
  })
  //redirect somewhere
});

app.listen(process.env.PORT, process.env.IP, function (){
  console.log("Server is running");
});