import Router from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import authenticate from '../Middleware/auth.js';

const router = Router();
dotenv.config();
const user = new Map();
const book = new Map();
const cart = new Map();
// const cartArray=[];
const secret_key = process.env.secret_key;


router.get('/', (req, res) => {
    res.send("Hello world!!!");
})

router.post('/signup', async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const { FirstName, LastName, UserName, Password, UserRole } = req.body;
        console.log(UserName);
        const newPassword = await bcrypt.hash(Password, 10)

        console.log(newPassword);
        if (user.get(UserName)) {
            res.status(400).json({ message: "Username already exist" });
        }
        else {
            user.set(UserName, { FirstName, LastName, Password: newPassword, UserRole })
            console.log(user.get(UserName));
            // // console.log(result);
            res.status(201).json({ message: "Saved Data" })
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
})

router.post('/login', async (req, res) => {
    try {
        const { UserName, Password } = req.body;
        const result = user.get(UserName)
        console.log(result);


        if (!result) {
            res.status(404).json({ message: 'User not found' });
        }
        else {
            console.log(Password);
            console.log(result.Password);


            const isvalid = await bcrypt.compare(Password, result.Password);
            console.log(isvalid);

            if (isvalid) {
                console.log(result.UserRole);
                const token = jwt.sign({ UserName: UserName, UserRole: result.UserRole }, secret_key, { expiresIn: '1h' })
                console.log(token);

                res.cookie('authToken', token, {
                    httpOnly: true
                });
                res.send(token);
            }
            else {
                res.send("Invalid Password");
            }
        }
    }
    catch (error) {
        res.status(500).json(error);
    }
})

router.post('/addBook', authenticate, async (req, res) => {
    console.log(req.user);
    const user = req.user;

    const { BookName, Author, ISBN, Category, Copies, Price } = req.body;

    try {

        if (user == "admin") {
            try {
                if (book.get(BookName)) {
                    res.status(400).json({ message: "Book already present" })
                }
                else {
                    book.set(BookName, {
                        Author: Author,
                        ISBN: ISBN,
                        Category: Category,
                        Copies: Copies,
                        Price: Price
                    })

                    res.status(201).json({ message: "Book Details Uploaded" });
                    console.log(book.get(BookName));

                }
            }

            catch (error) {
                res.status(400).json({ message: "Check the Book Details" });

            }
        }

        else {
            res.status(400).json({ message: "Unauthorized Access" })
        }
    }


    catch (error) {
        res.status(401).json({ message: "Check Book details" });

    }
})

router.get('/getBook/:id', async (req, res) => {
    try {
        const search = req.params.id;
        console.log(search);

        if (book.get(search)) {
            const result = book.get(search)
            res.send(result);
        }
    }
    catch (error) {
        res.status(400).json({ message: "Check the input" })
    }
})

router.post('/addCart', authenticate, async (req, res) => {

    const UserRole = req.user;
    const UserName = req.name;
    console.log(UserRole, "hi user");
    console.log(UserName, "name");

    try {
        if (UserRole == 'user') {
            const { BookName, Quantity } = req.body;
            console.log(BookName);

            const bookDetails = book.get(BookName);
            console.log(bookDetails);

            const cartDetails = {
                BookName: BookName,
                Price: bookDetails.Price,
                Quantity: Quantity
            }
            let cartArray = [];
            cartArray.push(cartDetails);
            console.log(cartArray);

            try {
                const data = cart.get(UserName);
                if (data) {
                    data.push(cartDetails);
                    console.log(cart.get(UserName));
                    res.status(201).json({ message: "Item added to cart" })
                }
                else {
                    cart.set(UserName, cartArray);


                    console.log(cart.get(UserName));

                    res.status(201).json({ message: "Item added to cart" })
                }
            }

            catch (error) {
                res.status(400).json({ message: "Check the input" })
            }

        }
        else {
            res.status(400).json({ message: "Unauthorized Access" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Check the bookName" });
    }


})

router.get('/viewCart', authenticate, async (req, res) => {
    const UserRole = req.user;
    const UserName = req.name;
    console.log(UserName);

    const result = cart.get(UserName);
    res.send(result);
})

router.post('/updateCart', authenticate, async (req, res) => {

    const UserRole = req.user;
    const UserName = req.name;
    console.log(UserRole, "hi user");
    console.log(UserName, "name");

    try {
        if (UserRole == 'user') {
            const { BookName, Quantity } = req.body;
            console.log(BookName);

            const bookDetails = book.get(BookName);
            console.log(bookDetails);


            try {
                const data = cart.get(UserName);
                if (data) {
                    data.forEach(x => {
                        if (x.BookName == BookName) {
                            x.Price = bookDetails.Price;
                            x.Quantity = Quantity;
                        }

                    })

                    res.status(201).json({ message: "Item updated to cart" })
                }
                else {

                    res.status(201).json({ message: "Invalid Request" })
                }
            }

            catch (error) {
                res.status(400).json({ message: "Check the input" })
            }

        }
        else {
            res.status(400).json({ message: "Unauthorized Access" });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Check the bookName" });
    }
})

router.get('/buyCart', authenticate, async (req, res) => {
    try{
    const UserRole = req.user;
    const UserName = req.name;
    console.log(UserRole, "hi user");
    console.log(UserName, "name");
   
    const data = cart.get(UserName);
    console.log(data);
    let total = 0;
    let Price, Quantity,BookName;
    data.forEach(x=>{
        BookName=x.BookName;
        Price=x.Price;
        Quantity=x.Quantity;
        total+=(Price*Quantity);
        const data=book.get(BookName);
        data.Copies-=Quantity;
        console.log(data);
        
        book.set(BookName,data);
    })
   
    console.log(total);
    res.status(200).send(total);
}
    catch{
        res.status(500).json({message:"Check Details"});
    }
   


})
export default router;