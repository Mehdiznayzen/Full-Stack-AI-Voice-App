"use server";

import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

export const checkBookExists = async (title: string) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(title);

        const existingBook = await Book.findOne({slug}).lean();

        if(existingBook) {
            return {
                exists: true,
                book: serializeData(existingBook)
            }
        }

        return {
            exists: false,
        }
    } catch (err) {
        console.error('Error checking book exists', err);
        return {
            exists: false, 
            error: err,
            success: false
        }
    }
}

export const createBook = async (data: CreateBook) => {
    try {
        await connectToDatabase();

        const slug = generateSlug(data.title)

        const existingBook = await Book.findOne({ slug }).lean();
        if(existingBook) {
            return {
                success: true,
                data: serializeData(existingBook),
                alreadyExists: true
            }
        }

        const book = await Book.create({ ...data, slug, totalSegments: 0 });
        return {
            success: true,
            data: serializeData(book)
        }
    } catch (err) {
        console.error("Error creating a book ", err);

        return {
            success: false,
            error: err
        }
    }
}

export const saveBookSegments = async (bookId: string,clerckId: string,segments: TextSegment[]) => {
  try {
    await connectToDatabase();

    const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerckId,
        bookId,
        content: text,
        segmentIndex,
        pageNumber,
        wordCount,
      })
    );

    await BookSegment.insertMany(segmentsToInsert);
    await Book.findByIdAndUpdate(bookId, {totalSegments: segments.length});

    return {
      success: true,
      data: { segmentsCreated: segments.length },
    };
  } catch (err) {
    await BookSegment.deleteMany({ bookId });

    return {
      success: false,
      error: err,
    };
  }
};