import prisma from "../lib/prisma.js";
import httpCode from "../static/httpCode.js";
import { v4 as uuidv4 } from 'uuid'


const libraryController = {
    getAllBooks: async (req, res) => {
        try {

            const books = await prisma.library.findMany({
                orderBy: { publishDate: 'desc' }
            })

            if (!books) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "No books in the library" })
            }

            return res.status(httpCode.OK).json({ message: "Your book", books })

        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    addBook: async (req, res) => {
        try {
            const { title, author, description, ISBN } = req.body
            if (!title || !author || !description)
                return res.status(httpCode.BAD_REQUEST).json({ message: "All the fields are required" })

            const titleExist = await prisma.library.findFirst({
                where: { title: title }
            })
            if (titleExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "This book already exist" })
            }
            const book = await prisma.library.create({
                data: {
                    Lib_id: uuidv4(),
                    title,
                    author,
                    description,
                    ISBN
                }
            })

            return res.status(httpCode.OK).json({ message: "Book successfully added", book })
        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },

    updateBook: async (req, res) => {
        try {
            const { id } = req.params
            const { title, author, description, ISBN } = req.body
            if (!title || !author || !description)
                return res.status(httpCode.BAD_REQUEST).json({ message: "All the fields are required" })

            const bookExist = await prisma.library.findUnique({
                where: { Lib_id: id }
            })
            if (!bookExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "No book found" })
            }

            const updateBook = await prisma.library.update({
                where: { Lib_id: bookExist.Lib_id },
                data: {
                    title: title ?? bookExist.title,
                    author: author ?? bookExist.author,
                    description: description ?? bookExist.description,
                    ISBN: ISBN ?? bookExist.ISBN
                }
            })
            return res.status(httpCode.OK).json({ message: "FOUND", updateBook })

        }
        catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    },
    deleteBook: async (req, res) => {
        try {
            const { title } = req.body
            if (!title)
                return res.status(httpCode.BAD_REQUEST).json({ message: "All the fields are required" })

            const bookExist = await prisma.library.findFirst({
                where: { title: title }
            })
            if (!bookExist) {
                return res.status(httpCode.BAD_REQUEST).json({ message: "No book found" })
            }

            const deleteBook = await prisma.library.delete({
                where: { Lib_id: bookExist.Lib_id },
            })

            return res.status(httpCode.OK).json({ message: "Deleted Successfully", deleteBook })


        } catch (error) {
            return res.status(httpCode.SERVER_ERROR).json({ message: "Erreur du server", error: error.message })

        }
    }

}

export default libraryController