const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")
// const Item = require("./itemsSch.js")
// const List = require("./listSch")
mongoose.connect('mongodb+srv://admin-roberto:test123@cluster0.8kp5n.mongodb.net/todolistDB', {
  useNewUrlParser: true
});


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));



// creating items for DB //////////////////////////////////////////////////////////


const itemSchema = new mongoose.Schema({
  content: String,

});

const Item = mongoose.model("Item", itemSchema)



const item1 = new Item({

  content: "<------check the checkbox to delete",

});




const defaultItem = [item1]


// --------------------------------------------------------------------------------------------------------------------

app.get("/", function (req, res) {
  //finding items them rendering them and not adding if the item length = 0
  Item.find(function (err, item) {
    if (item.length === 0) {
      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err)
        } else {

          console.log("succesfully saved new fruits in todolistDB")

        } // end of if statement
      });
      res.redirect("/");
    } else {
      console.log("THESE are the ITEM")

      const day = date.getDate();

      res.render("list", {
        listTitle: day,
        newListItems: item,
      });
      item.forEach(content => console.log(content.content))
    }
  })
}); // end of app get request 


// posting the custom express route for the custom to do list 
// --------------------------------------------------------------------------------------------------------------------
app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const day = date.getDate();

  const item = new Item({

    content: itemName,
  })

  if (listName === day) {
    item.save()
    res.redirect("/")

  } else {
    List.findOne({
        name: listName
      },
      function (err, foundList) {
        foundList.items.push(item);
        foundList.save()
        res.redirect("/" + listName)
      });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

// this is the deleting method
// --------------------------------------------------------------------------------------------------------------------
app.post("/delete", function (req, res) {
  
  const day = date.getDate();
  const checkId = req.body.checkBoxId;
  const listName = req.body.listName;

  if(listName === day){
    Item.findByIdAndRemove(checkId, function (err) {
      if (!err) {
        console.log("items deleted succesfully ")
        res.redirect("/")
      }
    });
    
  }else {
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkId}}}, function(err, foundList){
if(!err){
  res.redirect("/"+ listName);
}

    })

  }


});
//creating the list schema 
// --------------------------------------------------------------------------------------------------------------------
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]

});
const List = mongoose.model("List", listSchema)

app.post("/list", function(req, res){

  const newList = _.capitalize(req.body.newList);
//
  List.findOne(({
    name: newList
  }), function (err, foundList) {
    if (!foundList) {

      const list = new List({
        name: newList,
        items: defaultItem,
      });
      
      list.save();
      res.redirect("/" + newList)
    } else {
      // console.log("list does not exist")

      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }

  });
//
  // res.redirect("/" + newList)
})


// creating custom routes with express rout parameters 
app.get("/:list", function (req, res) {

  const listName = _.capitalize(req.params.list);


// adding new items to the custom to do list(route)
// --------------------------------------------------------------------------------------------------------------------
  List.findOne(({
    name: listName
  }), function (err, foundList) {
    if (!foundList) {

      const list = new List({
        name: listName,
        items: defaultItem,
      });
      list.save();
      res.redirect("/" + listName)
    } else {
      // console.log("list does not exist")

      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }

  });


})

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port)

app.listen(port, function () {
  console.log("Server started on port 3000");
});