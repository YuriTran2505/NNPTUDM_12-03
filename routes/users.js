var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users')

/* GET all users */
router.get('/', async function (req, res, next) {
    try {
        let data = await userModel.find({
            isDeleted: false
        }).populate({
            path: 'role',
            select: 'name description'
        });
        res.send(data);
    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
});

/* GET user by id */
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findOne({
            isDeleted: false,
            _id: id
        }).populate({
            path: 'role',
            select: 'name description'
        });
        if (result) {
            res.send(result)
        } else {
            res.status(404).send({
                message: "User NOT FOUND"
            })
        }
    } catch (error) {
        res.status(404).send({
            message: error.message
        })
    }
});

/* CREATE user */
router.post('/', async function (req, res, next) {
    try {
        let { username, password, email, fullName, avatarUrl, role, loginCount } = req.body;
        
        if (!username || !password || !email || !role) {
            return res.status(400).send({
                message: "username, password, email, and role are required"
            })
        }

        let newUser = new userModel({
            username,
            password,
            email,
            fullName: fullName || "",
            avatarUrl: avatarUrl || "https://i.sstatic.net/l60Hf.png",
            role,
            loginCount: loginCount || 0,
            status: false
        });

        let result = await newUser.save();
        result = await result.populate({
            path: 'role',
            select: 'name description'
        });
        res.status(201).send(result);
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
});

/* UPDATE user */
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let { username, password, email, fullName, avatarUrl, role, loginCount } = req.body;

        let user = await userModel.findOne({
            isDeleted: false,
            _id: id
        });

        if (!user) {
            return res.status(404).send({
                message: "User NOT FOUND"
            })
        }

        if (username) user.username = username;
        if (password) user.password = password;
        if (email) user.email = email;
        if (fullName !== undefined) user.fullName = fullName;
        if (avatarUrl) user.avatarUrl = avatarUrl;
        if (role) user.role = role;
        if (loginCount !== undefined) user.loginCount = loginCount;

        let result = await user.save();
        result = await result.populate({
            path: 'role',
            select: 'name description'
        });
        res.send(result);
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
});

/* DELETE user (soft delete) */
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;

        let result = await userModel.findByIdAndUpdate(id, {
            isDeleted: true
        }, {
            new: true
        }).populate({
            path: 'role',
            select: 'name description'
        });

        if (result) {
            res.send({
                message: "User deleted successfully",
                data: result
            });
        } else {
            res.status(404).send({
                message: "User NOT FOUND"
            })
        }
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
});

/* ENABLE user - POST /users/enable */
router.post('/enable', async function (req, res, next) {
    try {
        let { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).send({
                message: "email and username are required"
            })
        }

        let user = await userModel.findOne({
            isDeleted: false,
            email,
            username
        });

        if (!user) {
            return res.status(404).send({
                message: "User NOT FOUND with provided email and username"
            })
        }

        user.status = true;
        let result = await user.save();
        result = await result.populate({
            path: 'role',
            select: 'name description'
        });

        res.send({
            message: "User enabled successfully",
            data: result
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
});

/* DISABLE user - POST /users/disable */
router.post('/disable', async function (req, res, next) {
    try {
        let { email, username } = req.body;

        if (!email || !username) {
            return res.status(400).send({
                message: "email and username are required"
            })
        }

        let user = await userModel.findOne({
            isDeleted: false,
            email,
            username
        });

        if (!user) {
            return res.status(404).send({
                message: "User NOT FOUND with provided email and username"
            })
        }

        user.status = false;
        let result = await user.save();
        result = await result.populate({
            path: 'role',
            select: 'name description'
        });

        res.send({
            message: "User disabled successfully",
            data: result
        });
    } catch (error) {
        res.status(400).send({
            message: error.message
        })
    }
});

module.exports = router;
