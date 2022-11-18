/*********************************************************************************
*  WEB322 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Nour Badiri Student ID: 108435215 Date: 11/17/2022
*
*  Online (Cyclic) Link: https://carmine-mite-slip.cyclic.app
*
********************************************************************************/ 
const express = require("express");
const path = require("path");
const multer = require("multer");
const dataService= require("./data-service.js"); 
const fs = require('fs');
const exphbs = require("express-handlebars");


var app = express();

var HTTP_PORT = process.env.PORT || 8080;

//return static css file
app.use(express.static("public")); 

// use middleware: Express built-in "bodyParser" - to access form data in http body
app.use(express.urlencoded({ extended: true }));

// add the property "activeRoute" to "app.locals" whenever the route changes, ie: if our route is "/students/add", the app.locals.activeRoute value will be "/students/add".
app.use(function(req, res, next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on port " + HTTP_PORT);
}

// Register handlebars as the rendering engine for views, register template engine helpers
app.engine(".hbs", exphbs.engine({ 
    extname: ".hbs",
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
    
 }));
app.set("view engine", ".hbs");

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
  
// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });


//ROUTES
app.get("/", function(req,res){
    res.render('home');
});

app.get("/about", function(req,res){
    res.render('about');
});

app.get("/students", function(req,res){
    if(req.query.status) {
        dataService.getStudentsByStatus(req.query.status)
        .then((data)=>{
            if(data.length>0) res.render("students", {students:data}); 
            else res.render("students", {message: "no results"})})
        .catch(()=>res.render("students", {message: "no results"}))
    }else if(req.query.program){
        dataService.getStudentsByProgramCode(req.query.program)
        .then((data)=>{
            if(data.length>0) res.render("students", {students:data}); 
            else res.render("students", {message: "no results"})})
        .catch(()=>res.render("students", {message: "no results"}))
    }else if(req.query.credential){
        dataService.getStudentsByExpectedCredential(req.query.credential)
        .then((data)=>{
            if(data.length>0) res.render("students", {students:data}); 
            else res.render("students", {message: "no results"})})
        .catch(()=>res.render("students", {message: "no results"}));
    }else{
        dataService.getAllStudents()
        .then((data)=>{
            if(data.length>0) res.render("students", {students: data}); 
            else res.render("students", {message: "no results"})})
        .catch(()=>res.render("students", {message: "no results"}))
    }
});

app.get("/student/:value", (req,res) => {
    let viewData = {};
    dataService.getStudentByNum(req.params.studentId).then((data) => {
        if (data) {
            viewData.student = data; //store student data in the "viewData" object as "student"
        } else {
            viewData.student = null; // set student to null if none were returned
        }
    }).catch(() => {
        viewData.student = null; // set student to null if there was an error 
    }).then(dataService.getPrograms)
    .then((data) => {
        viewData.programs = data; // store program data in the "viewData" object as "programs"
        for (let i = 0; i < viewData.programs.length; i++) {
            if (viewData.programs[i].programCode == viewData.student.program) {
                viewData.programs[i].selected = true;
            }
        }
    }).catch(() => {
        viewData.programs = []; // set programs to empty if there was an error
    }).then(() => {
        if (viewData.student == null) { // if no student - return an error
            res.status(404).send("Student Not Found");
        } else {
            res.render("student", { viewData: viewData }); // render the "student" view
        }
    }).catch((err)=>{
        res.status(500).send("Unable to Show Students");
      });
});

app.post("/student/update", (req, res) => {
    dataService.updateStudent(req.body)
    .then(()=>res.redirect("/students")) 
    .catch((err)=>res.json( {message : err}));
});
app.get("/programs", function(req,res){
    dataService.getPrograms()
    .then((data)=>{
        if(data.length>0) res.render("programs", {programs: data});
        else res.render("programs", {message: "no results"})})
    .catch(()=>res.render("programs", {message: "no results"}))
});

app.get("/students/add", function(req,res){
    res.render('addStudent');
});

app.post("/students/add", (req, res) => {
    dataService.addStudent(req.body)
    .then(()=>res.render("addStudent", {programs: data}))
    .catch((err)=>res.render("addStudent", {programs: []})); 
});

app.get("/students/delete/:value", function(req, res) {
    dataService.deleteStudentById(req.params.value).then(function(){
        res.redirect("/students");
    }).catch(() => {
        res.status(500).send("Unable to Remove Student / Student not found");    
    })
});

app.get("/programs/add", function(req,res){
    res.render('addProgram');
});
app.post('/programs/add', (req, res) => {
    dataService.addProgram(req.body).then(() => { res.redirect('/programs') })
  })
  
  app.post("/programs/add", (req, res) => {
    dataService.addProgram(req.body).then(() => {
      res.redirect("/programs");
    }).catch(err => console.log(err))
  });

app.post("/program/update", (req, res) => {
    dataService.updateProgram(req.body)
    .then(()=>res.redirect("/programs")) 
    .catch((err)=>res.json( {message : err}));
});

app.get('/program/:programCode', (req, res) => {
    const { programCode } = req.params
    dataService.getProgramByCode(programCode)
    .then((data) => {
        if(data) res.render("program",{program:data});
        else res.status(404).send("Program Not Found"); 
    })
    .catch(()=>{res.status(404).send("Program Not Found")})
});

app.get("/programs/delete/:programCode", function(req, res) {
    dataService.deleteProgramByCode(req.params.programCode).then(function(){
        res.redirect("/programs");
    }).catch(() => {
        res.status(500).send("Unable to Remove Program / Program not found");    
    })
});

app.get("/images/add", function(req,res){
    res.render('addImage');
});

//multer single function takes the value of the 'name' attribute on the form
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});

app.get("/images", function(req,res){
    return new Promise ((resolve, reject)=>{
        fs.readdir(path.join(__dirname,"/public/images/uploaded"), function(err, contents) {
            if (err) {
                reject(err); return;
            } else {
                resolve(contents); //return array of files in directory
            }
      });
    })
    .then((imagesArr)=> res.render("images", {data : imagesArr})) //send image urls to images.hbs
    .catch((err)=>res.json( {message : err}));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });


//read json files into global array objects before starting server  
dataService.initialize()
.then(()=>{
    //start server after initialized successfully
    app.listen(HTTP_PORT, onHttpStart);
})
.catch((err)=>{
    console.log("Error:",err);
});