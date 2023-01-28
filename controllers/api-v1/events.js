const router = require('express').Router()
const db = require('../../models')
const authLockedRoute = require('./authLockedRoute')


router.get('/', async (req, res) => {
    try {
        // find all events
        const events = await db.Event.find({})
        // send events back, status 200 express's default
        res.json(events)
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Interval Server Error, Contact the System Administrator' })
    }
 })

router.get('/:id', async (req, res) => {
    try {
        // look up a event using the id from the request parameters
        const event = await db.Event.findById(req.params.id)
        // if the bounty is not found, respond with 404
        if (!event) {
            res.status(404).json({ msg: "not found" })
            return // don't want to send headers twice, stop the function
        }
        // respond with the event we found
        res.json(event)
    } catch (err) {
        console.log(err)
        if (err.kind === "ObjectId") {
            res.status(404).json({ msg: err.message })
        } else {
            res.status(500).json({ msg: 'Interval Server Error, Contact the System Administrator' })
        }
    }
})


router.post('/', async (req, res) => {
    try {
        // add a new event to the db, based on the req.body
        const event = await db.Event.create(req.body)
        // either redirect to where the client can find the new event OR send back the new event
        res.status(201).json(event)
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Interval Server Error, Contact the System Administrator' })
    }
})


router.put('/:id', async (req, res) => {
    try {
        // get the id from the url
        // get the data to update in from the req.body
        const updatedEvent = await db.Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
        if (!updatedEvent) {
            res.status(404).json({ msg: "not found" })
            return // don't want to send headers twice, stop the function
        }
        // send the udpated event    
        res.json(updatedEvent)   
    } catch (err) {
        console.log(err)
        if (err.kind === "ObjectId") {
            res.status(404).json({ msg: err.message })
        } else {
            res.status(500).json({ msg: 'Interval Server Error, Contact the System Administrator' })
        }
    }
})


router.delete('/:id', async (req, res) => {
    try {
        // get the id from the url, and destroy that id
        const deletedEvent = await db.Event.findByIdAndDelete(req.params.id)
        if (!deletedEvent) {
            res.status(404).json({ msg: "not found" })
            return // don't want to send headers twice, stop the function
        }
        // send a status of 204 (no content) and nothing else
        res.sendStatus(204)
    } catch (err) {
        console.log(err)
        if (err.kind === "ObjectId") {
            res.status(404).json({ msg: err.message })
        } else {
            res.status(500).json({ msg: 'Interval Server Error, Contact the System Administrator' })
        }
    }
})

module.exports = router