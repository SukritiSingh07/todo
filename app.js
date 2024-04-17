//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose"); 
const date = require(__dirname + "/date.js");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB", { useNewUrlParser: true,  useUnifiedTopology: true  });

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const itemSchema={
  name: String,
};

const Item= mongoose.model("Item", itemSchema);

const item1=new Item({
  name: "Welcome to your todolist"
});

const item2=new Item({
  name: "Hit + button to add off the new item"
});

const item3= new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems=[item1, item2, item3];

async function insertMany(){
  try{
    await Item.insertMany(defaultItems);

  }
  catch(error){
    console.log(error);
  }
}

const listSchema={
  name: String,
  items: [itemSchema],
}

const List= mongoose.model("List",listSchema);

// insertMany();
app.get("/", function(req, res) {
async function find(){
  try{
    const founditems=await Item.find();
    if(founditems.length===0){
      insertMany();
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  }
  catch(error){
    console.log(error);
  }
}
find();

// const day = date.getDate();



});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
async function find(){
  try {
      const foundList = await List.findOne({ name: customListName });

      if (!foundList) {
          // Create a new list
          const list = new List({
              name: customListName,
              items: defaultItems
          });
          await list.save();
          res.redirect("/" + customListName);
      } else {
          res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred");
  }}
  find();
});






app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });

  async function findOne() {
    if (listName === "Today") {
      item.save();
      res.redirect("/");
    } else {
      try {
        const foundList = await List.findOne({ name: listName });
        foundList.items.push(item);
        await foundList.save();
        res.redirect("/" + listName);
      } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred");
      }
    }
  }

  findOne(); // This should be outside the findOne function scope
});




  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

app.post("/delete", async function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName= req.body.listName;
  try{
  if(listName==="Today"){
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");
  }
  else{
    await List.findOneAndUpdate({name:listName},{$pull: {items:{_id: checkedItemId}}});
    res.redirect("/"+listName);
  }
}
  catch(error){
    console.log(error);
}
});



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
