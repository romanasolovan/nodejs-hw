import createHttpError from 'http-errors';
import { Note } from '../models/note.js';


export const getAllNotes = async (req, res) => {
  const { tag, search, page, perPage } = req.query;
  const notesQuery = Note.find({ userId: req.user._id });
  if (tag) {
    notesQuery.where('tag').equals(tag);
  }
  if (search) {
    notesQuery.where({
      $text: {
        $search: search,
      },
    });
  }

  const skip = (page - 1) * perPage;

  const [notes, totalNotes] = await Promise.all([
    notesQuery.clone().skip(skip).limit(perPage),
    notesQuery.countDocuments(),
  ]);
  const totalPages = Math.ceil(totalNotes / perPage);
  res.json({ page, perPage, totalNotes, totalPages, notes });
};


export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) throw createHttpError(404, 'Note not found');

    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};


export const createNote = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const newNote = await Note.create({ ...req.body, userId });

    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};


export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const updated = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      req.body,
      { new: true }
    );

    if (!updated) throw createHttpError(404, 'Note not found');

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};


export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const deleted = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!deleted) throw createHttpError(404, 'Note not found');

    res.status(200).json(deleted);
  } catch (error) {
    next(error);
  }
};


