/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const { ObjectId } = require("mongodb");

module.exports = function (app, db) {
    app.route("/api/books")
        .get(function (req, res) {
            db.find({}).toArray((err, data) => {
                if (err) {
                    res.json({ error: err });
                } else {
                    res.json(data);
                }
            });
            //response will be array of book objects
            //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        })

        .post(function (req, res) {
            let title = req.body.title;
            if (!title) {
                return res.send("missing required field title");
            }
            db.insertOne(
                { title: title, comments: [], commentcount: 0 },
                (err, data) => {
                    if (err) {
                        res.json({ error: err });
                    } else {
                        res.json({ title: title, _id: data.insertedId });
                    }
                }
            );
            //response will contain new book object including atleast _id and title
        })

        .delete(function (req, res) {
            db.deleteMany({}, (err, data) => {
                if (err) {
                    res.json({ error: err });
                } else {
                    res.send("complete delete successful");
                }
            });
            //if successful response will be 'complete delete successful'
        });

    app.route("/api/books/:id")
        .get(function (req, res) {
            let bookid = req.params.id;
            db.findOne({ _id: new ObjectId(bookid) }, (err, data) => {
                if (!data) {
                    res.send("no book exists");
                } else {
                    res.json({ ...data, comments: data.comments || [] });
                }
            });
            //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        })

        .post(function (req, res) {
            let bookid = req.params.id;
            let comment = req.body.comment;
            if (!comment) {
                return res.send("missing required field comment");
            }
            db.findOneAndUpdate(
                { _id: new ObjectId(bookid) },
                { $push: { comments: comment }, $inc: { commentcount: 1 } },
                (err, data) => {
                    if (data.lastErrorObject.updatedExisting === false) {
                        res.send("no book exists");
                    } else {
                        res.json({
                            ...data.value,
                            comments: [...data.value.comments, comment],
                        });
                    }
                }
            );
            //json res format same as .get
        })

        .delete(function (req, res) {
            let bookid = req.params.id;
            db.deleteOne({ _id: new ObjectId(bookid) }, (err, data) => {
                if (data.deletedCount === 0) {
                    res.send("no book exists");
                } else {
                    res.send("delete successful");
                }
            });
            //if successful response will be 'delete successful'
        });
};
