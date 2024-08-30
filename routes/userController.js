import express from "express"
import users from "../models/userModel.js"

const userController = express.Router()

userController.use(express.json())

userController.post('/', async(req, res) => {
    try {
        console.log("Req from the frontend", req.body)
        const {name, age, city, email, interests, signupDate, isActive} = req.body

        let ignoredObjects = []

        for (let user of req.body) {
            const existingUser = await users.findOne({
                $or : [
                    {name : user.name},
                    {email : user.email}
                ]
            })

            if(existingUser) {
                ignoredObjects.push(existingUser)
            }
            else {
                
                const newUser = new users({name : user.name, age : user.age, city : user.city, email : user.email, interests : user.interests, signupDate : user.signupDate, isActive : user.isActive})
                await newUser.save()
                
                
            }
            
        }

        return res.status(200).json({status : 200, message : "successfully pushed to db", ignoredObjects : ignoredObjects})

        
    }
    catch(err) {
        console.log("error while pushing into db", err)
        return res.status(404).json({status : 404, error : `error while pushing to db ${err}`})
    }
} )

userController.get('/', async(req, res) => {
   try {
    const usersInDb = await users.find()


    return res.status(200).json({status : 200, length : usersInDb.length, usersInDb : usersInDb})
   }
   catch(err) {
    console.log("error while getting users in the db")
    return res.status(404).json({status : 404, error : `error while fetching from the db ${err}`})
   }
})

userController.delete('/', async(req, res) => {
    try {
        await users.deleteMany({})
        return res.status(200).json({status : 200, message : "users deleted from the db successfully"})
    }

    catch(err) {
        return res.status(404).json({status : 404, error : err})
    }
})



export default userController