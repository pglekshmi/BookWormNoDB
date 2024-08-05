import Router from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

const router =Router();
dotenv.config();
let user={};
const secret_key=process.env.secret_key;


router.get('/',(req,res)=>{
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
        if(user[UserName]){
            res.status(400).json({message:"Username already exist"});
        }
        else{
        user[UserName] = {
            FirstName:FirstName,
            LastName:LastName,
            Password: newPassword,
            UserRole:UserRole
        };
        console.log(user[UserName]);
        // // console.log(result);
        res.status(201).json({ message: "Saved Data" })}
    }
    catch (error) {
        res.status(500).json(error);
    }
})

router.post('/login', async (req, res) => {
    try {
        const { UserName, Password } = req.body;
       
        if (!user[UserName]) {
            res.status(404).json({ message: 'User not found' });
        }

        const isvalid = await bcrypt.compare(Password, user[UserName].Password);
        if (isvalid) {
            console.log(user[UserName].UserRole);
            const token = jwt.sign({ UserName: UserName, UserRole: user[UserName].UserRole }, secret_key, { expiresIn: '1h' })
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
    catch (error) {
        res.status(500).json(error);
    }
})



export default router;