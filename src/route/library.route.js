import { Router } from "express";
import libraryController from "../controller/library.controller.js";

const libraryRoute = Router()

const libraryPattern ={
    getBooks : '/books',
    postBook : '/book',
    updateBook : '/books/:id',
    deleteBook : '/books/:id'
}

libraryRoute.get(libraryPattern.getBooks,libraryController.getAllBooks)
libraryRoute.post(libraryPattern.postBook,libraryController.addBook)
libraryRoute.put(libraryPattern.updateBook,libraryController.updateBook)
libraryRoute.get(libraryPattern.deleteBook,libraryController.deleteBook)


export default libraryRoute