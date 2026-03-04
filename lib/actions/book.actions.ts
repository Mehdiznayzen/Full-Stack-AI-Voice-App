"use server";

import { connectToDatabase } from "@/database/mongoose";
import { CreateBook, TextSegment } from "@/types";
import { generateSlug, serializeData } from "../utils";
import Book from "@/database/models/book.model";
import BookSegment from "@/database/models/book-segment.model";

export const getAllBooks = async () => {
  try {
    await connectToDatabase();

    const books = await Book.find().sort({ createdAt: -1 }).lean();

    return {
      success: true,
      data: serializeData(books), // clé "data" pour être cohérent avec ta page
    };
  } catch (err) {
    console.error('Error fetching books:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Something went wrong",
    };
  }
};

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
            error: err instanceof Error ? err.message : "Something went wrong",
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
            error: err instanceof Error ? err.message : "Unknown error"
        }
    }
}

export const saveBookSegments = async (bookId: string,clerkId: string,segments: TextSegment[]) => {
  try {
    await connectToDatabase();

    const segmentsToInsert = segments.map(({ text, segmentIndex, pageNumber, wordCount }) => ({
        clerkId,
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
      error: err instanceof Error ? err.message : "Something went wrong"
    };
  }
};