import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { name } from "ejs";
import session from "express-session";
import flash from "connect-flash";
import { request } from "http";


const app = express();
const port = 3000;


app.use(session({
  secret: 'your secret key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // set to true if your using https
}));

app.use(session({
  secret: 'secret',
  cookie: { maxAge: 60000 }, // set to true if your using https
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "project",
  password: "nithin",
  port: 5432,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("login.ejs", { cart: cart });
});
// login;

app.post("/login", async (req, res) => {
  req.session.userName = req.body["userName"];
  const name = req.body["userName"];
  const password = req.body["password"];
  
  try {
    const result = await db.query(
      "SELECT name,password FROM details WHERE name = $1 AND password=$2",
      [name,password]
    );
    if (result.rowCount > 0) {
      if (result.rows[0].name == name && result.rows[0].password == password) {
        
        res.redirect("/home");
        
      }
    } else {
      req.flash('message','Invalid username or password');
      res.redirect("/login_sign");
   
    }
  } catch (err) {
    console.log(err);
  }
  
});
app.get("/login_sign",(req, res) => {
  res.render("login_sign.ejs",{message:req.flash('message')});
});

// signup
app.post("/signin", async (req, res) => {
  const name = req.body["name"];
  const email = req.body["email"];
  const p_number=req.body["number"];
  const password = req.body["password"];
  try {
    const result = await db.query(
      "INSERT INTO details(name, email,p_number, password) VALUES ($1, $2, $3, $4)",
      [name, email,p_number, password]
    );
    if (result.rowCount > 0) {
      res.redirect("/home");
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
 
});
app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});


// add to cart
let cart = [];
app.post("/add", async (req, res) => {
  const item_name = req.body["Apple"];
  const item_price= req.body["cost"];
  const quantity = req.body["quantity"];
   const name = req.session.userName;
  // const name = req.body["name"];
  try {
    const result1 = await db.query(
      "INSERT INTO cart(item_name, item_price,quantity,name) VALUES ($1, $2, $3,$4)",
      [item_name, item_price,quantity,name]
     //"select cart.item_name,cart.item_price,cart.quantity from details join cart on details.name=cart.name where details.name=$1",
     );
     const result = await db.query(
     "select cart.item_name,cart.item_price,cart.quantity from details join cart on details.name=cart.name where details.name=$1",
      [name]
      );
    if (result.rowCount >= 0) {
      const cart = result.rows; // assign the result of the query to the cart variable
      res.render("cart.ejs", { cart: cart });
    } else {
      res.redirect("/home");
    }
  } catch (err) {
    console.log(err);
  }
});
// view cart 
app.post("/view_cart",async(req,res)=>{
  const name = req.session.userName;
  try{
    const result = await db.query(
      "select cart.item_name,cart.item_price,cart.quantity from details join cart on details.name=cart.name where details.name=$1",
       [name]
       );
     if (result.rowCount >= 0) {
       const cart = result.rows; // assign the result of the query to the cart variable
       res.render("cart.ejs", { cart: cart });
     } else {
       res.redirect("/home");
     }
   } catch (err) {
     console.log(err);
   }
  
})

app.get("/cart", async (req, res) => {
  res.render("cart.ejs");
});

//buy cart

app.post("/buy", async (req, res) => {
      res.render("farmers/buy_now.ejs");
});

app.get("/farmers/buy_now", async (req, res) => {
  res.render("farmers/buy_now.ejs");
});

//payment

app.post("/pay", async (req, res) => {
  res.render("payment.ejs");
});
app.get("/payment", async (req, res) => {
  res.render("payment.ejs");
});

//oredr cart

app.post("/order", async (req, res) => {
  res.render("order.ejs");
});
app.get("/order", async (req, res) => {
  res.render("order.ejs");
});

app.get("/farmers/order", async (req, res) => {
  res.render("farmers/order.ejs");
});

app.post("/search", async (req, res) => { 
  const name = req.body["search"];
  try {
    
    if(name=='apple'||name=='custard' || name=='watermelon' || name=='grapes' || name=='guava' || name=='orange'){
      res.redirect("/fruits");
    }
     else {
      res.redirect("/home");
    }
  } catch (err) {
    console.log(err);
  }
});

// new farmer

app.post("/new", async (req, res) => {
  const name = req.body.name;
  const number = req.body.number;
  const address = req.body.address;
  const crop = req.body.crop;
  const quantity = req.body.Quantity;
  const cost = req.body.cost;
  try { 
  
    const result = await db.query(
      "INSERT INTO farmer(name, number,address,crop,quantity,cost) VALUES ($1, $2, $3, $4, $5, $6)",
      [name, number,address,crop,quantity,cost]
    );
    if (result.rowCount  > 0) {
      res.render("farmers/New.ejs", {Name: name, number: number, address: address, crop: crop, quantity: quantity, cost: cost});
    } else {
      res.redirect("/home");
    }
  } catch (err) {     
    console.log(err);
  }
 
});
app.get("/farmers/New", (req, res) => {
  res.render("farmers/New.ejs");
});
  


// home page

app.post("/home", async (req, res) => {
  res.render("about.ejs");
  
});
app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.post("/home1", async (req, res) => {
  res.render("storage.ejs");
  
});
app.get("/storage", (req, res) => {
  res.render("storage.ejs");
});

app.post("/home2", async (req, res) => {
  res.render("register.ejs");
  
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.post("/home3", async (req, res) => {
  res.render("home.ejs");
});
app.get("/home", (req, res) => {
  res.render("home.ejs");
});
app.get("/cereals", (req, res) => {
  res.render("cereals.ejs");
});
app.get("/fruits", (req, res) => {
  res.render("fruits.ejs");
});
app.get("/commercial", (req, res) => {
  res.render("cereals.ejs");
});
app.get("/vegetables", (req, res) => {
  res.render("vegetables.ejs");
});
app.get("/millets", (req, res) => {
  res.render("millets.ejs");
});
app.get("/pulses", (req, res) => {
  res.render("pulses.ejs");
});
// farmers of fruits
app.get("/farmers/grapes", (req, res) => {
  res.render("farmers/grapes.ejs");
});
app.get("/farmers/guava", (req, res) => {
  res.render("farmers/guava.ejs");
});
app.get("/farmers/oranges", (req, res) => {
  res.render("farmers/oranges.ejs");
});
app.get("/farmers/watermelon", (req, res) => {
  res.render("farmers/watermelon.ejs");
});
app.get("/farmers/Custard/", (req, res) => {
  res.render("farmers/Custard.ejs");
});
app.get("/farmers/Apple", (req, res) => {
  res.render("farmers/Apple.ejs");
});
// farmers of commercial
app.get("/farmers/groundnut", (req, res) => {
  res.render("farmers/groundnut.ejs");
});

app.get("/farmers/soyabean", (req, res) => {
  res.render("farmers/soyabean.ejs");
});
app.get("/farmers/coffecherry", (req, res) => {
  res.render("farmers/coffecherry.ejs");
});
app.get("/farmers/mustard", (req, res) => {
  res.render("farmers/mustard.ejs");
});
app.get("/farmers/sugarcane", (req, res) => {
  res.render("farmers/sugarcane.ejs");
});
app.get("/farmers/cotton", (req, res) => {
  res.render("farmers/cotton.ejs");
});
// farmers of vegetables
app.get("/farmers/potato", (req, res) => {
  res.render("farmers/potato.ejs");
});
app.get("/farmers/tomato5", (req, res) => {
  res.render("farmers/tomato5.ejs");
});
app.get("/farmers/tomato4", (req, res) => {
  res.render("farmers/tomato4.ejs");
});
app.get("/farmers/cabbage", (req, res) => {
  res.render("farmers/cabbage.ejs");
});
app.get("/farmers/carrot", (req, res) => {
  res.render("farmers/carrot.ejs");
});
app.get("/farmers/Tomato", (req, res) => {
  res.render("farmers/Tomato.ejs");
});
// farmers of cereals
app.get("/farmers/wheat", (req, res) => {
  res.render("farmers/wheat.ejs");
});
// farmers of millets
app.get("/farmers/pearmillet", (req, res) => {
  res.render("farmers/pearmillet.ejs");
});
// farmers of pulse
app.get("/farmers/redgram", (req, res) => {
  res.render("farmers/redgram.ejs");
});

app.get("/farmers/milk", (req, res) => {
  res.render("farmers/milk.ejs");
});

app.get("/farmers/ghee", (req, res) => {
  res.render("farmers/ghee.ejs");
});
app.get("/farmers/rice", (req, res) => {
  res.render("farmers/rice.ejs");
});
app.get("/farmers/honey", (req, res) => {
  res.render("farmers/honey.ejs");
});
app.get("/farmers/fish", (req, res) => {
  res.render("farmers/fish.ejs");
});
app.get("/farmers/prawns", (req, res) => {
  res.render("farmers/prawns.ejs");
});

// listen
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



