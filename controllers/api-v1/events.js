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
        const details = await db.Event.findById(req.params.id).populate('host')
        
        // if the bounty is not found, respond with 404
        if (!details) {
            res.status(404).json({ msg: "not found" })
            return // don't want to send headers twice, stop the function
        }
        // respond with the event we found
        res.json(details)
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
        // console.log(req.body)
        const event = await db.Event.create({
            name: req.body.name,
            location: req.body.location,
            date: req.body.date,
            time: req.body.time,
            timezone: req.body.timezone,
            gameTitle: req.body.gameTitle,
            details: req.body.details, 
            host: req.body.host
        }) 
        console.log(req.body)
        //maybe add push if we keep it as an array
        // either redirect to where the client can find the new event OR send back the new event
        res.status(201).json(event)
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Interval Server Error, Contact the System Administrator' })
    }
})

router.post('/:id', async(req, res)=> {
    try {
        const foundUser= await db.User.findOne({
            _id: req.body.id
        })

        const foundEvent= await db.Event.findOne({
            _id: req.body.event
        })

        const foundHost= await db.User.findOne({
            _id: foundEvent.host
        })

        console.log(`|${foundEvent.host._id}||${foundUser._id}|`)
        console.log(typeof foundEvent.host._id)
        console.log(typeof foundUser._id)
        if(foundUser._id.equals(foundEvent.host._id)){
            console.log('host of the enent')
            res.json({msg: 'host of the event'})
        } else if(foundEvent.rsvp.includes(foundUser._id)){
            console.log('already rsvp\'d to this event')
            res.json({msg: 'already rsvp\'d to this event'})
            } else {
                foundUser.events.push(foundEvent._id)
                foundEvent.rsvp.push(foundUser._id)
    
                await foundUser.save()
                await foundEvent.save()

        }

        
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
        const foundUsers = await db.User.find({})
        console.log('before change', foundUsers)
        foundUsers.forEach(user => {
            if(user.events.includes(req.params.id)){
                const index= user.events.indexOf(req.params.id)
                const newEvents= user.events.splice(index, 1)
                user.save()
            }
        })
        console.log('what i want', foundUsers)
        // await db.User.updateMany(, {event: user.events}, {new: true})
        
        
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