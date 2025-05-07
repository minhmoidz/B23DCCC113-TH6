import { Note } from '../../models/bai2/Note';

const STORAGE_KEY = 'personal_notes';

export const getNotes = (): Note[] => {
  const notes = localStorage.getItem(STORAGE_KEY);
  return notes ? JSON.parse(notes) : [];
};

export const saveNotes = (notes: Note[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const addNote = (note: Note): void => {
  const notes = getNotes();
  notes.push(note);
  saveNotes(notes);
};

export const updateNote = (updatedNote: Note): void => {
  const notes = getNotes();
  const index = notes.findIndex(note => note.id === updatedNote.id);
  if (index !== -1) {
    notes[index] = updatedNote;
    saveNotes(notes);
  }
};

export const deleteNote = (id: string): void => {
  const notes = getNotes();
  const filteredNotes = notes.filter(note => note.id !== id);
  saveNotes(filteredNotes);
};
