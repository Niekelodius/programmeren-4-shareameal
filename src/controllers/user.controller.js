let database = [];
let id = 0;

let userController = {
    
    addUser:(req, res) => {
        let user = req.body;
        user = {
            id,
            ...user,
        };
    
        const emailCheck = database.some(element => {
            if (element.email === user.email) {
                return true;
            }
        });
    
        if (emailCheck) {
            console.log(user.email + " already in use");
            res.status(403).json({
                status: 403,
                result: `email already in use`,
            });
        }
        else {
            id++;
            database.push(user);
            console.log("added " + user);
            res.status(201).json({
                status: 201,
                result: database,
            });
        }
        
    },
    

    editUser:(req, res, next) => {
        const userId = req.params.userId;

        let oldUser = database.filter((item) => item.id == userId);
        if (oldUser.length > 0) {
    
            let newUser = req.body;
            id = parseInt(userId);
            newUser = {
                id,
                ...newUser,
            };
            console.log(newUser);
            database[userId] = newUser;
    
            res.status(201).json({
                status: 201,
                result: newUser,
            });
            console.log(`Modified user ${userId}`);
        }
        else {
            res.status(403).json({
                status: 403,
                result: `User with ID ${userId} not found`,
            });
        }
    
    },

    getAllUsers:(req, res) => {
        res.status(201).json({
            status: 201,
            result: database,
        });
    },

    deleteUser:(req, res, next) => {
        const userId = req.params.userId;
        console.log(`User with ID ${userId} has been deleted`);
        let user = database.filter((item) => item.id == userId);
        if (user.length > 0) {
            console.log(user);
            database.splice(userId, 1);
            res.status(201).json({
                status: 201,
                result: user,
            });
        } else {
            res.status(403).json({
                status: 403,
                result: `User with ID ${userId} not found`,
            });
        }
    },

    getUserById:(req, res, next) => {
        const userId = req.params.userId;
        console.log(`User met ID ${userId} gezocht`);
        let user = database.filter((item) => item.id == userId);
        if (user.length > 0) {
            console.log(user);
            res.status(201).json({
                status: 201,
                result: user,
            });
        } else {
            res.status(403).json({
                status: 403,
                result: `User with ID ${userId} not found`,
            });
        }
    },

    getProfile:(req, res, next) => {
        res.status(200).json({
            status: 401,
            result: `Unauthorized`,
        });
    }
    
};
module.exports = userController;