const { sequelize, User } = require('../models');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Joi = require('joi');

const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));

function authToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.status(401).json({ msg: err });
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    
        if (err) return res.status(403).json({ msg: err });
    
        req.user = user;
    
        next();
    });
}

const sema = Joi.object().keys({
    firstName: Joi.string().min(4).max(16).required(),
    lastName: Joi.string().min(4).max(16).required(),
    username: Joi.string().min(4).max(12).required(),
    password: Joi.string().min(4).required(),
    role: Joi.string().min(4).max(16)
});

route.get('/users', (req, res) => {
    User.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.role === 'admin') {
                User.findAll()
                    .then( rows => res.json(rows) )
                    .catch( err => res.status(500).json(err) );
            } else {
                res.status(403).json({ msg: "This user is not admin!"});
            }
        })
        .catch( err => res.status(500).json({ msg: "This user is not admin!"}) );
});

route.get('/users/:id', authToken, (req, res) => {
    User.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.role === 'admin') {
                User.findOne({ where: { id : req.params.id } })
                    .then( rows => res.json(rows) )
                    .catch( err => res.status(500).json(err) );
            } else {
                res.status(403).json({ msg: "This user is not admin!"});
            }
        })
        .catch( err => res.status(500).json({ msg: "This user is not admin!"}) );
});

route.post('/users', authToken, (req, res) => {
    User.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.role === 'admin') {
                const obj = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password, 10),
                    role: req.body.role
                };
            
                User.create(obj)
                    .then( rows => res.json(rows) )
                    .catch( err => res.status(500).json(err) );
            } else {
                res.status(403).json({ msg: "This user is not admin!"});
            }
        })
        .catch( err => res.status(500).json({ msg: "This user is not admin!"}) );
});

route.put('/users/:id', authToken, (req, res) => {
    User.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.role === 'admin') {
                User.findOne({ where: { id : req.params.id } })
                    .then( user => {
                        user.firstName = req.body.firstName;
                        user.lastName = req.body.lastName;
                        user.username = req.body.username;
                        user.password = req.body.password;
                        user.role = req.body.role;

                        user.save()
                            .then( rows => res.json(rows) )
                            .catch( err => res.status(500).json(err) );
                    } )
                    .catch( err => res.status(500).json(err) );
            } else {
                res.status(403).json({ msg: "This user is not admin!"});
            }
        })
        .catch( err => res.status(500).json({ msg: "This user is not admin!"}) );
});

route.delete('/users/:id', authToken, (req, res) => {
    User.findOne({ where: { id: req.user.userId } })
        .then( usr => {
            if (usr.role === 'admin') {
                User.findOne({ where: { id : req.params.id } })
                    .then( user => {
                        user.destroy()
                            .then( rows => res.json(rows) )
                            .catch( err => res.status(500).json(err) );
                    } )
                    .catch( err => res.status(500).json(err) );
            } else {
                res.status(403).json({ msg: "This user is not admin!"});
            }
        })
        .catch( err => res.status(500).json({ msg: "This user is not admin!"}) );
});


module.exports = route;