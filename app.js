const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const mongoose = require("mongoose");

//App Preparation________________________________________________________
const app = express();

//Use static files
app.use(express.static("public"));

//Use EJS
app.set("view engine","ejs");

//Get content from forms
app.use(bodyParser.urlencoded({extended:true}));

//Database Preparation________________________________________________________
mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = new mongoose.Schema({
    name: String
});
const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

app.get("/", function(req,res){
    res.redirect("/My ToDos");
});

//_______________________________________________________________________

//Creating lists through the sent name
app.get("/:listName", function(req,res){ 
    const listName= _.capitalize(req.params.listName);

    List.findOne({name: listName},function(err,foundList){
        if(!err){
            //If the list doesn't exist, then add it
            if(!foundList){
                const newList = new List({name:listName, items:[]});
                newList.save();
                res.redirect('/'+listName);
                //Uses the view engine to render the page (from the views folder)
            }else{
                //Uses the view engine to render the page (from the views folder)
                res.render('list',{listTitle:foundList.name, toDos: foundList.items});
            }
        }
    })
});

app.post("/", function(req,res){
    const listName= _.capitalize(req.body.listName);
    const newTodo = new Item({name: req.body.newToDo}); 

    List.findOne({name:listName},function(err,foundList){
        if(!err){
            foundList.items.push(newTodo);
            foundList.save();
            res.redirect("/"+listName);
        }
    })
});

app.post("/delete", function(req,res){
    const itemID = mongoose.Types.ObjectId(req.body.checkbox);
    const listName= _.capitalize(req.body.listName);

    List.findOneAndUpdate({name:listName},
        //Pull/Delete from items array the item with the correct id
        {$pull:{ "items": {_id: itemID}}}, 
        function(err,foundList){
        if(!err){
            res.redirect("/"+listName);
        }
    })
});

  
app.listen(process.env.PORT||3000, function(){
    console.log("Server started");
});

