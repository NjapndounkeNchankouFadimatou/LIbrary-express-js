import express from 'express'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import userRoute from './route/user.route.js'
import libraryRoute from './route/library.route.js'
import loansRouter from './route/loan.route.js'


const app = express()

const limiter = rateLimit({
    windowMs: 15 * 16 * 1000,
    limit: 100,
    message: {error: 'Trop de requete depuis cette adresse IP'}
})
//middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(limiter)
//route
app.use('/profile' , userRoute)
app.use('/library' , libraryRoute)
app.use('/BookLoans' , libraryRoute)

export default app