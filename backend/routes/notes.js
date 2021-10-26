const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Route 1:Get All the Notes using : GET,Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
});

// Route 2: Adding a new note using: POST,Login required
router.post("/addnote", fetchuser,
    [
        body("title", "Enter a Valid Title").isLength({ min: 3 }),
        body("description", "Enter atleast 5 characters").isLength({ min: 5 }),
    ],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            // If there are any errors, return Bad status
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Notes({
                title,
                description,
                tag,
                user: req.user.id,
            });
            const savedNote = await note.save();
            res.json(savedNote);
        } catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
        }
    }
);
// Route 3: Update existing note using: PUT,Login required
router.put("/updatenote/:id", fetchuser,async (req, res) => {
    const {title, description, tag} = req.body;
    // Create a nwNote object
    const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};
    
        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json({note})
});
// Route 4: Delete existing note using: Delete,"/api/notes/deletenote" -Login required
router.delete("/deletenote/:id", fetchuser,async (req, res) => {
    try {
        // Find the note to be Deleted and delete it
        let note = await Notes.findById(req.params.id);
        if(!note){return res.status(404).send("Not Found")}

        // Allow deletion only if user owns this Note
        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({"Success":"Note has been delete", note:note})

    }catch (error) {
            console.log(error.message);
            res.status(500).send("Internal Server Error");
        }
});
module.exports = router;
