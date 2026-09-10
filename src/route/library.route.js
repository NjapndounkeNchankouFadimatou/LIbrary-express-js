import { Router } from "express";
import libraryController from "../controller/library.controller.js";
import authMiddleWare from "../middleware/auth.middleware.js";
import verifRole from "../middleware/VerifRole.middleware.js";

const libraryRoute = Router()

const libraryPattern ={
    getBooks : '/books',
    postBook : '/book/add',
    updateBook : '/books/:id',
    deleteBook : '/books/:id'
}

libraryRoute.get(libraryPattern.getBooks, libraryController.getAllBooks)
libraryRoute.post(libraryPattern.postBook,authMiddleWare,verifRole, libraryController.addBook)
libraryRoute.put(libraryPattern.updateBook,authMiddleWare,verifRole, libraryController.updateBook)
libraryRoute.delete(libraryPattern.deleteBook,authMiddleWare,verifRole,libraryController.deleteBook)


export default libraryRoute