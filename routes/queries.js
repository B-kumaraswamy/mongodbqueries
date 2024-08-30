import express from "express";
import users from "../models/userModel.js";

const queryRouter = express.Router()
queryRouter.use(express.json())

queryRouter.get('/', async(req, res) => {

    try {
        const usersInDb = await users.aggregate([
           {$match : {isActive : true}},
           {$group : {_id : null, averageAge : {$avg : "$age"}}}
        ])

      

        console.log("usersInDb", usersInDb)


        return res.status(200).json({status : 200, message : "queries successfully executed", length : usersInDb.length, result : usersInDb})

        

    }

    catch(err) {
        console.log("error while fetching queries", err)
    }
})

export default queryRouter

/* 
Queries I executed successfully 

const users = await User.find();
console.log(users);

const usersInCity = await User.find({ city: 'Denver' });
console.log(usersInCity);

const user = await User.findOne({ email: 'ethan@example.com' });
console.log(user);

const olderUsers = await User.find({ age: { $gt: 30 } });
console.log(olderUsers);

const usersWithInterest = await User.find({ interests: 'sports' }); //==> users with a specific interest
console.log(usersWithInterest);

const usersWithInterest = await User.find({ interests: { $in: ['sports', 'reading'] } }); //==> interest in either sports or reading
console.log(usersWithInterest);

Find users interested in both "sports" and "music":
const users = await User.find({ interests: { $all: ['sports', 'music'] } });
console.log(users);


const updatedUser = await User.findOneAndUpdate(
  { email: 'ethan@example.com' },
  { city: 'Boulder' },
  { new: true }
);
console.log(updatedUser);
The new option in findOneAndUpdate is not a field in the database. It's a parameter that tells Mongoose to return the updated document instead of the original one before the update.
Query: { email: 'ethan@example.com' } specifies which document to update.
Update: { city: 'Boulder' } specifies the changes to make.
Options: { new: true } makes Mongoose return the updated document.
Without { new: true }, the method returns the document as it was before the update.


const deletedUser = await User.findOneAndDelete({ email: 'ethan@example.com' });
console.log(deletedUser);

const count = await User.countDocuments({ city: 'Denver' });
console.log(`Users in Denver: ${count}`);

const sortedUsers = await User.find().sort({ signupDate: -1 });
console.log(sortedUsers);


const page = 1;
const limit = 10;
const paginatedUsers = await User.find()
  .skip((page - 1) * limit) //==> Like OFFSET in SQL, it specifies how many documents to skip.
  .limit(limit); //==> Like LIMIT in SQL, it specifies the number of documents to return.
console.log(paginatedUsers);

In otherwords, const paginatedUsers = await User.find().skip(0).limit(20)
This query will return the first 20 users from the database.


Find active users in a specific city:
const users = await User.find({ city: 'Denver', isActive: true });
console.log(users);


Retrieve only specific fields (e.g., name and email):
const users = await User.find({}, 'name email'); //==> returns name, email fields of all users in the db 
console.log(users);

const users = await User.find({age : 32}, 'name email'); //==> returns name, email fields of users with age 32
console.log(users);

Tip to remember : await User.find({condition}, 'fields you want from each user object')


Set all inactive users to active:
const result = await User.updateMany({ isActive: false }, { isActive: true });
console.log(result);

Delete all users from a specific city:
const result = await User.deleteMany({ city: 'Miami' });
console.log(result);


Get users between ages 25 and 35:
const users = await User.find({ age: { $gte: 25, $lte: 35 } });
console.log(users);

Search for users whose name contains "eth":
const users = await User.find({ name: /eth/i });
console.log(users);

Set all users with age 30 to inactive:
const result = await User.updateMany({ age: 30 }, { isActive: false });
console.log(result);


Find users who signed up after January 1, 2023:
const users = await User.find({ signupDate: { $gt: new Date('2023-01-01') } });
console.log(users);

Get a list of unique cities where users are located:
const cities = await User.distinct('city');
console.log(cities);


Count how many users have "photography" as an interest:
const count = await User.countDocuments({ interests: 'photography' });
console.log(`Users interested in photography: ${count}`);
=================================================

Aggregate Queries 

Calculate the average age of users grouped by city:
const result = await User.aggregate([
  { $group: { _id: "$city", averageAge: { $avg: "$age" } } }
]);
console.log(result);
Explanation: Groups users by city and calculates the average age for each city.


Count the number of users in each city:
const result = await User.aggregate([
  { $group: { _id: "$city", totalUsers: { $sum: 1 } } }
]);
console.log(result);
Explanation: Groups users by city and counts how many users are in each city.


Find the maximum age of all users:
const result = await User.aggregate([
  { $group: { _id: null, maxAge: { $max: "$age" } } }
]);
console.log(result);
Explanation: Calculates the maximum age among all users.
The _id field is required in the $group stage because it serves as a unique key for each group of documents. When you use $group, MongoDB needs a way to identify each group, even if there's only one. Setting _id to null means all documents are grouped into a single group.


Calculate the total sum of ages for users grouped by city:
const result = await User.aggregate([
  { $group: { _id: "$city", totalAge: { $sum: "$age" } } }
]);
console.log(result);
Explanation: Sums the ages of users in each city.


Calculate the average age of active users:
const result = await User.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: null, averageAge: { $avg: "$age" } } }
]);
console.log(result);
Explanation: Filters active users and calculates their average age.

Sum the ages of users grouped by a specific interest:
const result = await User.aggregate([
  { $unwind: "$interests" },
  { $group: { _id: "$interests", totalAge: { $sum: "$age" } } }
]);
console.log(result);
The `$unwind` stage is used to deconstruct an array field from the input documents to output a document for each element of the array. This is necessary when you want to group or filter based on individual array elements.

### Explanation

- **`$unwind: "$interests"`**: This splits each document with an array of interests into multiple documents, each with a single interest. For example, if a user has interests `["sports", "music"]`, `$unwind` creates two documents: one for "sports" and one for "music".

- **Why `$match` isn't used here**: `$match` is used to filter documents based on certain criteria. While you can use `$match` before or after `$unwind` to filter documents, `$unwind` is specifically needed to break down the array elements for grouping or aggregation.

### Example Use

If you want to filter users by a specific interest before unwinding, you could do:

```javascript
const result = await User.aggregate([
  { $match: { interests: "sports" } }, // Match documents containing the interest
  { $unwind: "$interests" },
  { $group: { _id: "$interests", totalAge: { $sum: "$age" } } }
]);
console.log(result);
```

Here, `$match` ensures you only process documents with the interest "sports" before unwinding.


Find the top 3 cities with the highest number of users:
const result = await User.aggregate([
  { $group: { _id: "$city", userCount: { $sum: 1 } } },
  { $sort: { userCount: -1 } },
  { $limit: 3 }
]);
console.log(result);

================================================
To find the second highest salary in a collection using MongoDB and Mongoose, you can use the aggregation framework like this:
const result = await Employee.aggregate([
  { $sort: { salary: -1 } },      // Sort by salary in descending order
  { $skip: 1 },                   // Skip the highest salary
  { $limit: 1 }                   // Limit the result to the next document
]);

console.log(result);

=============================

To find people aged 60 or older in each ward of a town, you can use the aggregation framework:

```javascript
const result = await Person.aggregate([
  { $match: { age: { $gte: 60 } } }, // Filter for age 60 or older
  { $group: { _id: "$ward", eligiblePeople: { $push: "$name" } } } // Group by ward
]);

console.log(result);
```

### Explanation

- **`$match`**: Filters documents to include only those with age 60 or older.
- **`$group`**: Groups the results by `ward` and collects the names of eligible people in each ward.

The `$push` operator is used to create an array of names for people eligible for a pension in each ward. It collects the names of those who meet the criteria into the `eligiblePeople` array for each ward.

=====================================
To find the total number of people aged 60 or older in each ward, you can use:

```javascript
const result = await Person.aggregate([
  { $match: { age: { $gte: 60 } } }, // Filter for age 60 or older
  { $group: { _id: "$ward", count: { $sum: 1 } } } // Group by ward and count
]);

console.log(result);
```

### Explanation

- **`$match`**: Filters documents to include only those with age 60 or older.
- **`$group`**: Groups the results by `ward` and counts the number of eligible people in each ward using `$sum: 1`.

====================================================

*/